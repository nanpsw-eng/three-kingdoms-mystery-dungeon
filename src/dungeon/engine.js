import { SeededRng } from "../core/rng.js";
import { ALERT_ENGAGE_COOLDOWN_TURNS, AUTO_LOW_FOOD, AUTO_LOW_HP_RATIO, CONFUSION_TRAP_TURNS, CORRIDOR_VISION_RADIUS, DANGER_CAUTION_TURN, DANGER_HIGH_TURN, DANGER_PATROL_HUNT_CHANCE, ENEMY_DETECTION_RANGE, ENEMY_TRAP_HP_LOSS, FOOD_LOSS_AMOUNT, FOOD_MAX, FOOD_TICK_TURNS, NATURAL_RECOVERY_RATIO, NATURAL_RECOVERY_TURNS, PIT_STUCK_TURNS, REINFORCEMENT_CHANCE_CAUTION, REINFORCEMENT_CHANCE_HIGH, REINFORCEMENT_CHECK_TURNS, REINFORCEMENT_EXTRA_CAP, SEARCH_STATE_TURNS, STARVATION_DAMAGE_RATIO, TRAP_DAMAGE_RATIO, } from "./balance.js";
import { createMechanics } from "./mechanics.js";
import { isPassableTile, pickWeighted, roomAt, tileIndex, } from "./floor.js";
import { DIRECTIONS, chebyshev, directionDistance, directionTo, line, manhattan, rectCenter, samePoint, step, } from "./geometry.js";
const UNAWARE = new Set(["IDLE", "PATROL", "SEARCH"]);
const FIRE_MULTIPLIER = { dry: 1.5, "strong-wind": 1.25, rain: 0.5 };
export class DungeonEngine {
    floor;
    #tiles;
    #enemies = new Map();
    #traps;
    #objects = new Map();
    #explored = new Set();
    #party;
    #aiRng;
    #trapRng;
    #spawnRng;
    #playerRng;
    #mechanicRng;
    #mechanics;
    #passiveTrapDetection;
    #reinforcementGroups;
    #initialEnemyCount;
    #defeated = [];
    #seenObjects = new Set();
    #seenTraps = new Set();
    #hintedSecrets = new Set();
    #openedGates = new Set();
    #visible = new Set();
    #visibleAtTurnStart = new Set();
    #pos;
    #facing = "s";
    #confused = 0;
    #stuck = 0;
    #turn = 0;
    #food;
    #danger = "stable";
    #status = "exploring";
    #encounter = null;
    #bossDefeated = false;
    #stairsSeen = false;
    #reinforcementSeq = 0;
    #lowFoodLatched = false;
    #lowHpLatched = false;
    constructor(floor, options) {
        this.floor = floor;
        this.#tiles = [...floor.tiles];
        this.#traps = floor.traps.map((trap) => ({ ...trap, revealed: false }));
        for (const object of floor.objects)
            this.#objects.set(object.id, object);
        for (const spawn of floor.enemies) {
            this.#enemies.set(spawn.id, {
                id: spawn.id, groupId: spawn.groupId, pos: spawn.pos, facing: spawn.facing,
                state: spawn.behavior === "patrol" ? "PATROL" : "IDLE", behavior: spawn.behavior,
                boss: spawn.boss ?? false, gateId: spawn.gateId ?? null, hpRatio: 1, reinforcement: false,
                cooldown: 0, stuck: 0, lastKnown: null, patrolTarget: null, searchTurns: 0, approachedUnseen: false,
            });
        }
        this.#initialEnemyCount = this.#enemies.size;
        if (options.party.length === 0)
            throw new RangeError("Expedition party must not be empty.");
        this.#party = options.party.map((member) => {
            if (!Number.isSafeInteger(member.maxHp) || member.maxHp <= 0 || !Number.isSafeInteger(member.hp) || member.hp < 0 || member.hp > member.maxHp) {
                throw new RangeError("Invalid expedition member HP: " + member.id);
            }
            return { ...member };
        });
        const food = options.food ?? FOOD_MAX;
        if (!Number.isSafeInteger(food) || food < 0 || food > FOOD_MAX)
            throw new RangeError("Food must be an integer between 0 and " + FOOD_MAX + ".");
        this.#food = food;
        this.#passiveTrapDetection = options.passiveTrapDetection ?? 0;
        this.#reinforcementGroups = options.reinforcementGroups ?? [];
        const rng = new SeededRng(options.seed).fork("dungeon-" + floor.depth);
        this.#aiRng = rng.fork("ai");
        this.#trapRng = rng.fork("traps");
        this.#spawnRng = rng.fork("spawn");
        this.#playerRng = rng.fork("player");
        this.#mechanicRng = rng.fork("mechanics");
        this.#mechanics = createMechanics(floor.mechanics ?? []);
        this.#pos = floor.start;
        this.#updateVision();
        this.#stairsSeen = false;
    }
    // ---------- queries ----------
    get status() { return this.#status; }
    get turn() { return this.#turn; }
    get food() { return this.#food; }
    get danger() { return this.#danger; }
    get position() { return this.#pos; }
    get facing() { return this.#facing; }
    get encounter() { return this.#encounter; }
    get bossDefeated() { return this.#bossDefeated; }
    party() { return this.#party.map((member) => ({ ...member })); }
    enemies() { return [...this.#enemies.values()].map((enemy) => ({ ...enemy })); }
    objects() { return [...this.#objects.values()]; }
    tile(p) { return this.#inBounds(p) ? this.#tiles[tileIndex(this.floor.width, p)] : undefined; }
    isExplored(p) { return this.#explored.has(tileIndex(this.floor.width, p)); }
    isVisible(p) { return this.#visible.has(tileIndex(this.floor.width, p)); }
    revealedTraps() {
        return this.#traps.filter((trap) => trap.revealed).map(({ id, type, pos }) => ({ id, type, pos }));
    }
    visibleEnemies() { return this.enemies().filter((enemy) => this.isVisible(enemy.pos)); }
    defeatedEnemies() { return [...this.#defeated]; }
    /** HUD lines for active floor mechanics (fire countdown, water level…). */
    mechanicStatus() {
        return this.#mechanics.map((mechanic) => mechanic.status?.(this.#turn) ?? null).filter((status) => status !== null);
    }
    // ---------- party hooks for the Run layer ----------
    setParty(members) {
        for (const update of members) {
            const member = this.#party.find((candidate) => candidate.id === update.id);
            if (member === undefined) {
                this.#party.push({ ...update });
            }
            else {
                member.hp = Math.max(0, Math.min(update.maxHp, update.hp));
                member.maxHp = update.maxHp;
            }
        }
    }
    setFood(food) { this.#food = Math.max(0, Math.min(FOOD_MAX, Math.round(food))); }
    removeObject(objectId) { this.#objects.delete(objectId); }
    /** Item hook: reveal every trap on the floor. */
    revealAllTraps() { for (const trap of this.#traps)
        trap.revealed = true; }
    // ---------- commands ----------
    execute(command) {
        if (this.#status !== "exploring")
            throw new Error("Dungeon is not accepting commands in status: " + this.#status);
        const events = [];
        switch (command.type) {
            case "face":
                this.#facing = command.direction;
                return { turnSpent: false, events };
            case "descend": {
                if (!samePoint(this.#pos, this.floor.stairs))
                    return { turnSpent: false, events: [{ type: "blocked", reason: "not-on-stairs" }] };
                if (this.floor.boss && !this.#bossDefeated)
                    return { turnSpent: false, events: [{ type: "blocked", reason: "stairs-locked" }] };
                this.#status = "descended";
                return { turnSpent: false, events: [{ type: "descended" }] };
            }
            case "move": {
                const moved = this.#playerMove(command.direction, events);
                if (!moved)
                    return { turnSpent: false, events };
                break;
            }
            case "wait":
            case "spend-turn":
                break;
            case "search":
                this.#search(events);
                break;
            case "interact": {
                const object = [...this.#objects.values()].find((candidate) => samePoint(candidate.pos, this.#pos));
                if (object === undefined || object.kind !== "sorcery")
                    return { turnSpent: false, events: [{ type: "blocked", reason: "nothing-here" }] };
                this.#objects.delete(object.id);
                events.push({ type: "sorcery-destroyed", objectId: object.id });
                break;
            }
        }
        this.#finishTurn(events);
        return { turnSpent: true, events };
    }
    /** Called by the Run layer after the battle for the pending encounter is resolved. */
    resolveEncounter(outcome, party) {
        const encounter = this.#encounter;
        if (this.#status !== "encounter" || encounter === null)
            throw new Error("No pending encounter.");
        if (party !== undefined)
            this.setParty(party);
        const events = [];
        const enemy = this.#enemies.get(encounter.enemyId);
        this.#encounter = null;
        if (outcome === "defeat") {
            this.#status = "defeated";
            events.push({ type: "party-defeated" });
            return events;
        }
        if (outcome === "retreat") {
            if (!encounter.retreatAllowed)
                throw new Error("Retreat is not allowed for this encounter.");
            if (enemy !== undefined) {
                enemy.state = "ALERT";
                enemy.cooldown = ALERT_ENGAGE_COOLDOWN_TURNS;
                enemy.hpRatio = 1;
                enemy.lastKnown = this.#pos;
            }
            this.#status = "exploring";
            return events;
        }
        if (enemy !== undefined) {
            this.#enemies.delete(enemy.id);
            this.#defeated.push(enemy.id);
            if (enemy.boss)
                this.#bossDefeated = true;
            if (enemy.gateId !== null)
                this.#maybeOpenGate(enemy.gateId, events);
        }
        this.#status = this.#party.some((member) => member.hp > 0) ? "exploring" : "defeated";
        if (this.#status === "defeated")
            events.push({ type: "party-defeated" });
        this.#updateVision();
        return events;
    }
    // ---------- auto explore (DUNGEON_SPEC §14) ----------
    autoExplore(maxSteps = 200) {
        const events = [];
        for (let steps = 0;; steps += 1) {
            if (this.#status !== "exploring")
                return { steps, stopReason: this.#status === "encounter" ? "encounter" : "not-exploring", events };
            const reason = this.#autoStopReason();
            if (reason !== null)
                return { steps, stopReason: reason, events };
            if (steps >= maxSteps)
                return { steps, stopReason: "max-steps", events };
            const direction = this.#autoDirection();
            if (direction === null)
                return { steps, stopReason: "explored", events };
            const result = this.execute({ type: "move", direction });
            events.push(...result.events);
            const interrupt = result.events.find((event) => event.type === "encounter" || event.type === "trap" || event.type === "object" || event.type === "teleported");
            if (interrupt !== undefined) {
                const map = { encounter: "encounter", trap: "trap-hint", object: "item", teleported: "trap-hint" };
                return { steps: steps + 1, stopReason: map[interrupt.type], events };
            }
            if (!result.turnSpent)
                return { steps, stopReason: "explored", events };
        }
    }
    /**
     * First step of a shortest explored path toward `target` (tap-to-move / auto-play helper).
     * Enemies block except on the target tile; revealed traps are avoided unless they are the target.
     */
    travelDirection(target) {
        const goal = tileIndex(this.floor.width, target);
        const isGoal = (key) => key === goal;
        return this.#pathStep(isGoal, "strict") ?? this.#pathStep(isGoal, "enemies") ?? this.#pathStep(isGoal, "all");
    }
    /** First step toward the nearest unexplored frontier; `allowTraps` lets the route cross revealed traps. */
    frontierDirection(allowTraps = false) {
        const width = this.floor.width;
        const frontier = (key) => this.#isFrontier({ x: key % width, y: Math.floor(key / width) });
        return this.#pathStep(frontier, "strict") ?? this.#pathStep(frontier, "enemies") ?? (allowTraps ? this.#pathStep(frontier, "all") : null);
    }
    stateHash() {
        const state = {
            depth: this.floor.depth, turn: this.#turn, pos: this.#pos, facing: this.#facing, food: this.#food,
            danger: this.#danger, status: this.#status, confused: this.#confused, stuck: this.#stuck,
            enemies: [...this.#enemies.values()].sort((a, b) => a.id.localeCompare(b.id)),
            traps: this.#traps.map((trap) => [trap.id, trap.revealed]),
            objects: [...this.#objects.keys()].sort(),
            party: this.#party, explored: this.#explored.size, defeated: this.#defeated, boss: this.#bossDefeated,
            tiles: this.#tiles.join(""),
            rng: [this.#aiRng, this.#trapRng, this.#spawnRng, this.#playerRng].map((rng) => rng.snapshot()),
            encounter: this.#encounter,
        };
        const json = JSON.stringify(state);
        let hash = 0x811c9dc5;
        for (let index = 0; index < json.length; index += 1) {
            hash ^= json.charCodeAt(index);
            hash = Math.imul(hash, 0x01000193);
        }
        return (hash >>> 0).toString(16).padStart(8, "0");
    }
    // ---------- internals: movement ----------
    #inBounds(p) { return p.x >= 0 && p.y >= 0 && p.x < this.floor.width && p.y < this.floor.height; }
    #passable(p) { return isPassableTile(this.tile(p)); }
    #canStep(from, direction) {
        const to = step(from, direction);
        if (!this.#passable(to))
            return false;
        if (to.x !== from.x && to.y !== from.y) {
            // No corner cutting past walls.
            if (!this.#passable({ x: to.x, y: from.y }) || !this.#passable({ x: from.x, y: to.y }))
                return false;
        }
        return true;
    }
    #enemyAt(p) {
        for (const enemy of this.#enemies.values())
            if (samePoint(enemy.pos, p))
                return enemy;
        return undefined;
    }
    #playerMove(requested, events) {
        if (this.#stuck > 0) {
            events.push({ type: "blocked", reason: "stuck" });
            return true;
        }
        let direction = requested;
        if (this.#confused > 0)
            direction = DIRECTIONS[this.#playerRng.nextInt(0, 8)];
        this.#facing = direction;
        const target = step(this.#pos, direction);
        if (!this.#canStep(this.#pos, direction)) {
            events.push({ type: "blocked", reason: this.#passable(target) ? "corner" : "wall" });
            // A confused stumble into a wall still costs the turn.
            return this.#confused > 0;
        }
        const enemy = this.#enemyAt(target);
        if (enemy !== undefined) {
            this.#startEncounter(enemy, "player", events);
            return true;
        }
        this.#pos = target;
        events.push({ type: "moved", to: target });
        this.#updateVision();
        this.#passiveDetect(events);
        const trap = this.#traps.find((candidate) => samePoint(candidate.pos, target));
        if (trap !== undefined)
            this.#triggerTrapOnPlayer(trap, events);
        const object = [...this.#objects.values()].find((candidate) => samePoint(candidate.pos, this.#pos));
        if (object !== undefined && object.kind !== "sorcery")
            events.push({ type: "object", object });
        return true;
    }
    #search(events) {
        for (const trap of this.#traps) {
            if (!trap.revealed && chebyshev(trap.pos, this.#pos) <= 1) {
                trap.revealed = true;
                events.push({ type: "trap-found", trapId: trap.id });
            }
        }
        for (let dy = -1; dy <= 1; dy += 1) {
            for (let dx = -1; dx <= 1; dx += 1) {
                const p = { x: this.#pos.x + dx, y: this.#pos.y + dy };
                if (this.tile(p) === "secret") {
                    this.#tiles[tileIndex(this.floor.width, p)] = "corridor";
                    events.push({ type: "secret-found", pos: p });
                }
            }
        }
        this.#updateVision();
    }
    #passiveDetect(events) {
        if (this.#passiveTrapDetection <= 0)
            return;
        for (const trap of this.#traps) {
            if (trap.revealed || chebyshev(trap.pos, this.#pos) > 1 || samePoint(trap.pos, this.#pos))
                continue;
            if (this.#trapRng.chance(Math.min(1, this.#passiveTrapDetection))) {
                trap.revealed = true;
                events.push({ type: "trap-found", trapId: trap.id });
            }
        }
    }
    // ---------- internals: traps ----------
    #damageParty(ratio, canKo) {
        const damage = [];
        for (const member of this.#party) {
            if (member.hp <= 0)
                continue;
            const raw = Math.max(1, Math.round(member.maxHp * ratio));
            const floor = canKo ? 0 : 1;
            const amount = Math.max(0, Math.min(raw, member.hp - floor));
            member.hp -= amount;
            damage.push({ memberId: member.id, amount });
        }
        return damage;
    }
    #triggerTrapOnPlayer(trap, events) {
        trap.revealed = true;
        let damage = [];
        switch (trap.type) {
            case "rockfall":
            case "poison-needle":
            case "pit":
                damage = this.#damageParty(TRAP_DAMAGE_RATIO[trap.type], false);
                if (trap.type === "pit")
                    this.#stuck = PIT_STUCK_TURNS;
                break;
            case "fire-circle":
                damage = this.#damageParty(TRAP_DAMAGE_RATIO["fire-circle"] * (FIRE_MULTIPLIER[this.floor.modifier ?? ""] ?? 1), false);
                break;
            case "alarm-bell":
                this.#alarm(events);
                break;
            case "food-loss":
                this.#food = Math.max(0, this.#food - FOOD_LOSS_AMOUNT);
                events.push({ type: "food", food: this.#food });
                break;
            case "confusion-circle":
                this.#confused = CONFUSION_TRAP_TURNS;
                break;
            case "teleport-circle": {
                const to = this.#randomFreeRoomTile(this.#trapRng, (room) => room !== this.floor.secretRoom);
                if (to !== null) {
                    this.#pos = to;
                    this.#updateVision();
                    events.push({ type: "trap", trapId: trap.id, trap: trap.type, target: "player", damage });
                    events.push({ type: "teleported", to });
                    return;
                }
                break;
            }
        }
        events.push({ type: "trap", trapId: trap.id, trap: trap.type, target: "player", damage });
    }
    #triggerTrapOnEnemy(trap, enemy, events) {
        switch (trap.type) {
            case "rockfall":
            case "poison-needle":
            case "fire-circle":
                enemy.hpRatio = Math.max(0.1, enemy.hpRatio - ENEMY_TRAP_HP_LOSS);
                break;
            case "pit":
            case "confusion-circle":
                enemy.stuck = PIT_STUCK_TURNS;
                break;
            case "alarm-bell":
                this.#alarm(events);
                break;
            case "teleport-circle": {
                const to = this.#randomFreeRoomTile(this.#trapRng, () => true);
                if (to !== null)
                    enemy.pos = to;
                break;
            }
            case "food-loss":
                break;
        }
        events.push({ type: "trap", trapId: trap.id, trap: trap.type, target: enemy.id, damage: [] });
    }
    #alarm(events) {
        for (const enemy of this.#enemies.values()) {
            if (enemy.state === "ENGAGE")
                continue;
            enemy.state = "ALERT";
            enemy.lastKnown = this.#pos;
            events.push({ type: "enemy-alert", enemyId: enemy.id });
        }
        if (this.floor.alarmNetwork)
            this.#spawnReinforcement(events, true);
    }
    // ---------- internals: enemies ----------
    #detectionRange() {
        const modifier = this.floor.modifier;
        return ENEMY_DETECTION_RANGE + (modifier === "fog" ? -1 : modifier === "smoke" ? -2 : 0);
    }
    #lineOfSight(from, to) {
        const points = line(from, to);
        for (let index = 1; index < points.length - 1; index += 1)
            if (!this.#passable(points[index]))
                return false;
        return true;
    }
    #detects(enemy) {
        const enemyRoom = roomAt(this.floor, enemy.pos);
        const playerRoom = roomAt(this.floor, this.#pos);
        if (enemyRoom >= 0 && enemyRoom === playerRoom)
            return true;
        const distance = chebyshev(enemy.pos, this.#pos);
        if (distance > this.#detectionRange())
            return false;
        if (!this.#lineOfSight(enemy.pos, this.#pos))
            return false;
        const toward = directionTo(enemy.pos, this.#pos);
        if (toward === undefined)
            return true;
        // Corridor: front cone at range, sides when adjacent, never directly behind (rear contact = surprise).
        return directionDistance(enemy.facing, toward) <= (distance <= 1 ? 2 : 1);
    }
    #nextStepToward(enemy, target) {
        if (samePoint(enemy.pos, target))
            return null;
        const width = this.floor.width;
        const start = tileIndex(width, enemy.pos);
        const goal = tileIndex(width, target);
        const previous = new Map([[start, -1]]);
        const firstStep = new Map();
        const queue = [enemy.pos];
        while (queue.length > 0) {
            const current = queue.shift();
            const currentKey = tileIndex(width, current);
            if (currentKey === goal)
                return firstStep.get(goal) ?? null;
            for (const direction of DIRECTIONS) {
                if (!this.#canStep(current, direction))
                    continue;
                const next = step(current, direction);
                const key = tileIndex(width, next);
                if (previous.has(key))
                    continue;
                const blocker = this.#enemyAt(next);
                if (blocker !== undefined && blocker !== enemy && key !== goal)
                    continue;
                if (key !== goal && samePoint(next, this.#pos))
                    continue;
                previous.set(key, currentKey);
                firstStep.set(key, currentKey === start ? direction : firstStep.get(currentKey));
                queue.push(next);
            }
        }
        return null;
    }
    #moveEnemy(enemy, direction, events) {
        const next = step(enemy.pos, direction);
        enemy.facing = direction;
        if (samePoint(next, this.#pos) || this.#enemyAt(next) !== undefined || !this.#canStep(enemy.pos, direction))
            return;
        const wasAdjacent = chebyshev(enemy.pos, this.#pos) <= 1;
        const seenBefore = this.#visibleAtTurnStart.has(tileIndex(this.floor.width, enemy.pos));
        enemy.pos = next;
        if (chebyshev(next, this.#pos) <= 1) {
            if (!wasAdjacent)
                enemy.approachedUnseen = !seenBefore;
        }
        else
            enemy.approachedUnseen = false;
        const trap = this.#traps.find((candidate) => candidate.revealed && samePoint(candidate.pos, next));
        if (trap !== undefined)
            this.#triggerTrapOnEnemy(trap, enemy, events);
    }
    #pickPatrolTarget(enemy) {
        const playerRoom = roomAt(this.floor, this.#pos);
        if (this.#danger === "danger" && playerRoom >= 0 && this.#aiRng.chance(DANGER_PATROL_HUNT_CHANCE))
            return rectCenter(this.floor.rooms[playerRoom]);
        const rooms = this.floor.rooms.map((_, index) => index).filter((index) => index !== this.floor.secretRoom);
        let target = rectCenter(this.floor.rooms[this.#aiRng.pick(rooms)]);
        if (samePoint(target, enemy.pos))
            target = rectCenter(this.floor.rooms[this.#aiRng.pick(rooms)]);
        return target;
    }
    #enemyTurn(enemy, visibleAtStart, events) {
        if (enemy.stuck > 0) {
            enemy.stuck -= 1;
            return;
        }
        if (enemy.cooldown > 0)
            enemy.cooldown -= 1;
        const detects = this.#detects(enemy);
        const stationary = enemy.behavior === "stationary";
        if (detects)
            enemy.lastKnown = this.#pos;
        switch (enemy.state) {
            case "IDLE":
            case "PATROL":
            case "SEARCH":
                if (detects) {
                    enemy.state = "ALERT";
                    enemy.facing = directionTo(enemy.pos, this.#pos) ?? enemy.facing;
                    events.push({ type: "enemy-alert", enemyId: enemy.id });
                    return;
                }
                if (stationary)
                    return;
                if (enemy.state === "SEARCH") {
                    enemy.searchTurns -= 1;
                    const options = DIRECTIONS.filter((direction) => this.#canStep(enemy.pos, direction));
                    if (options.length > 0)
                        this.#moveEnemy(enemy, this.#aiRng.pick(options), events);
                    if (enemy.searchTurns <= 0)
                        enemy.state = "PATROL";
                    return;
                }
                if (enemy.state === "PATROL") {
                    if (enemy.patrolTarget === null || samePoint(enemy.patrolTarget, enemy.pos))
                        enemy.patrolTarget = this.#pickPatrolTarget(enemy);
                    const direction = this.#nextStepToward(enemy, enemy.patrolTarget);
                    if (direction === null)
                        enemy.patrolTarget = null;
                    else
                        this.#moveEnemy(enemy, direction, events);
                }
                return;
            case "ALERT":
                enemy.state = "CHASE";
                enemy.facing = directionTo(enemy.pos, enemy.lastKnown ?? this.#pos) ?? enemy.facing;
                return;
            case "CHASE": {
                const adjacent = chebyshev(enemy.pos, this.#pos) === 1;
                const toward = directionTo(enemy.pos, this.#pos);
                if (adjacent && enemy.cooldown === 0 && toward !== undefined && this.#canStep(enemy.pos, toward)) {
                    enemy.facing = toward;
                    this.#startEncounter(enemy, "enemy", events, visibleAtStart);
                    return;
                }
                if (stationary) {
                    if (toward !== undefined)
                        enemy.facing = toward;
                    return;
                }
                const target = enemy.lastKnown ?? this.#pos;
                if (!detects && samePoint(enemy.pos, target)) {
                    enemy.state = "SEARCH";
                    enemy.searchTurns = SEARCH_STATE_TURNS;
                    return;
                }
                const direction = this.#nextStepToward(enemy, adjacent ? enemy.pos : target);
                if (direction !== null)
                    this.#moveEnemy(enemy, direction, events);
                return;
            }
            case "ENGAGE":
                return;
        }
    }
    #startEncounter(enemy, initiator, events, visibleAtStart) {
        let surprise = null;
        if (initiator === "player") {
            const fromEnemy = directionTo(enemy.pos, this.#pos);
            if (UNAWARE.has(enemy.state) && fromEnemy !== undefined && directionDistance(enemy.facing, fromEnemy) >= 3)
                surprise = "ally";
        }
        else {
            const fromPlayer = directionTo(this.#pos, enemy.pos);
            const unseen = enemy.approachedUnseen || !(visibleAtStart?.has(tileIndex(this.floor.width, enemy.pos)) ?? true);
            if (unseen && fromPlayer !== undefined && directionDistance(this.#facing, fromPlayer) >= 3)
                surprise = "enemy";
        }
        const room = roomAt(this.floor, enemy.pos);
        const empowered = room >= 0 && [...this.#objects.values()].some((object) => object.kind === "sorcery" && object.room === room);
        enemy.state = "ENGAGE";
        this.#encounter = {
            enemyId: enemy.id, groupId: enemy.groupId, initiator, surprise, boss: enemy.boss, empowered,
            reinforcement: enemy.reinforcement, enemyHpRatio: enemy.hpRatio, retreatAllowed: !enemy.boss,
        };
        this.#status = "encounter";
        events.push({ type: "encounter", encounter: this.#encounter });
    }
    #maybeOpenGate(gateId, events) {
        const gate = this.floor.gates.find((candidate) => candidate.id === gateId);
        if (gate === undefined || this.#openedGates.has(gateId))
            return;
        if (gate.defenderIds.some((id) => this.#enemies.has(id)))
            return;
        for (const p of gate.tiles)
            this.#tiles[tileIndex(this.floor.width, p)] = "corridor";
        this.#openedGates.add(gateId);
        events.push({ type: "gate-opened", gateId });
    }
    // ---------- internals: turn end ----------
    #finishTurn(events) {
        if (this.#status === "exploring") {
            const visibleAtStart = new Set(this.#visible);
            this.#visibleAtTurnStart = visibleAtStart;
            for (const enemy of [...this.#enemies.values()].sort((a, b) => a.id.localeCompare(b.id))) {
                if (this.#status !== "exploring")
                    break;
                this.#enemyTurn(enemy, visibleAtStart, events);
            }
        }
        this.#turn += 1;
        if (this.#stuck > 0)
            this.#stuck -= 1;
        if (this.#confused > 0)
            this.#confused -= 1;
        if (this.#turn % FOOD_TICK_TURNS === 0 && this.#food > 0) {
            this.#food -= 1;
            events.push({ type: "food", food: this.#food });
        }
        if (this.#turn % NATURAL_RECOVERY_TURNS === 0) {
            if (this.#food > 0) {
                for (const member of this.#party)
                    if (member.hp > 0)
                        member.hp = Math.min(member.maxHp, member.hp + Math.max(1, Math.round(member.maxHp * NATURAL_RECOVERY_RATIO)));
            }
            else {
                events.push({ type: "starvation", damage: this.#damageParty(STARVATION_DAMAGE_RATIO, true) });
                if (this.#party.every((member) => member.hp <= 0)) {
                    this.#status = "defeated";
                    this.#encounter = null;
                    events.push({ type: "party-defeated" });
                }
            }
        }
        const danger = this.#turn >= DANGER_HIGH_TURN ? "danger" : this.#turn >= DANGER_CAUTION_TURN ? "caution" : "stable";
        if (danger !== this.#danger) {
            this.#danger = danger;
            events.push({ type: "danger", level: danger });
        }
        if (this.#turn % REINFORCEMENT_CHECK_TURNS === 0 && danger !== "stable") {
            const chance = danger === "danger" ? REINFORCEMENT_CHANCE_HIGH : REINFORCEMENT_CHANCE_CAUTION;
            if (this.#spawnRng.chance(chance))
                this.#spawnReinforcement(events, false);
        }
        if (this.#mechanics.length > 0 && this.#status !== "defeated")
            this.#runMechanics(events);
        this.#updateVision();
    }
    #runMechanics(events) {
        for (const mechanic of this.#mechanics) {
            const ctx = {
                turn: this.#turn,
                rng: this.#mechanicRng,
                position: this.#pos,
                damageParty: (ratio, canKo) => this.#damageParty(ratio, canKo).reduce((sum, d) => sum + d.amount, 0),
                addFood: (amount) => { this.#food = Math.max(0, Math.min(FOOD_MAX, this.#food + amount)); },
                alertAll: () => this.#alarm(events),
                reinforce: () => this.#spawnReinforcement(events, false),
                emit: (message) => events.push({ type: "mechanic", mechanic: mechanic.type, message }),
            };
            mechanic.onTurnEnd?.(ctx);
        }
        if (this.#status === "exploring" && this.#party.every((member) => member.hp <= 0)) {
            this.#status = "defeated";
            events.push({ type: "party-defeated" });
        }
    }
    #randomFreeRoomTile(rng, allowRoom) {
        const rooms = this.floor.rooms.map((_, index) => index).filter(allowRoom);
        const tiles = [];
        for (const room of rooms) {
            const rect = this.floor.rooms[room];
            for (let y = rect.y; y < rect.y + rect.height; y += 1) {
                for (let x = rect.x; x < rect.x + rect.width; x += 1) {
                    const p = { x, y };
                    if (samePoint(p, this.#pos) || this.#enemyAt(p) !== undefined || this.#traps.some((trap) => samePoint(trap.pos, p)))
                        continue;
                    tiles.push(p);
                }
            }
        }
        return tiles.length === 0 ? null : rng.pick(tiles);
    }
    #spawnReinforcement(events, fromAlarm) {
        if (this.#reinforcementGroups.length === 0)
            return;
        if (this.#enemies.size >= this.#initialEnemyCount + REINFORCEMENT_EXTRA_CAP)
            return;
        const playerRoom = roomAt(this.floor, this.#pos);
        const candidates = this.floor.rooms
            .map((rect, index) => ({ index, rect, distance: manhattan(rectCenter(rect), this.#pos) }))
            .filter(({ index, rect }) => {
            if (index === playerRoom || index === this.floor.stairsRoom || index === this.floor.secretRoom)
                return false;
            for (let y = rect.y - 1; y <= rect.y + rect.height; y += 1)
                for (let x = rect.x - 1; x <= rect.x + rect.width; x += 1)
                    if (this.isVisible({ x, y }))
                        return false;
            return true;
        })
            .sort((a, b) => b.distance - a.distance || a.index - b.index);
        if (candidates.length === 0)
            return;
        const far = candidates.slice(0, Math.max(1, Math.ceil(candidates.length / 2)));
        const room = this.#spawnRng.pick(far).index;
        const p = this.#randomFreeRoomTile(this.#spawnRng, (index) => index === room);
        if (p === null)
            return;
        const id = "reinforcement-" + this.#reinforcementSeq++;
        this.#enemies.set(id, {
            id, groupId: pickWeighted(this.#spawnRng, this.#reinforcementGroups), pos: p, facing: DIRECTIONS[this.#spawnRng.nextInt(0, 8)],
            state: fromAlarm ? "ALERT" : "PATROL", behavior: "patrol", boss: false, gateId: null, hpRatio: 1, reinforcement: true,
            cooldown: 0, stuck: 0, lastKnown: fromAlarm ? this.#pos : null, patrolTarget: null, searchTurns: 0, approachedUnseen: false,
        });
        events.push({ type: "reinforcement", enemyId: id });
    }
    #updateVision() {
        const visible = new Set();
        const width = this.floor.width;
        const room = roomAt(this.floor, this.#pos);
        const modifier = this.floor.modifier;
        if (room >= 0) {
            const rect = this.floor.rooms[room];
            const limit = modifier === "fog" ? 3 : modifier === "night" ? 4 : Infinity;
            for (let y = rect.y - 1; y <= rect.y + rect.height; y += 1) {
                for (let x = rect.x - 1; x <= rect.x + rect.width; x += 1) {
                    const p = { x, y };
                    if (this.#inBounds(p) && chebyshev(p, this.#pos) <= limit)
                        visible.add(tileIndex(width, p));
                }
            }
        }
        for (let dy = -CORRIDOR_VISION_RADIUS; dy <= CORRIDOR_VISION_RADIUS; dy += 1) {
            for (let dx = -CORRIDOR_VISION_RADIUS; dx <= CORRIDOR_VISION_RADIUS; dx += 1) {
                const p = { x: this.#pos.x + dx, y: this.#pos.y + dy };
                if (this.#inBounds(p))
                    visible.add(tileIndex(width, p));
            }
        }
        this.#visible = visible;
        for (const key of visible)
            this.#explored.add(key);
    }
    #autoStopReason() {
        if (this.visibleEnemies().length > 0)
            return "enemy";
        for (const object of this.#objects.values()) {
            if (this.#seenObjects.has(object.id) || !this.isVisible(object.pos))
                continue;
            this.#seenObjects.add(object.id);
            return object.kind === "recruit" ? "recruit" : object.kind === "event" ? "event" : object.kind === "sorcery" ? "special-room" : "item";
        }
        for (const trap of this.#traps) {
            if (!trap.revealed || this.#seenTraps.has(trap.id) || !this.isVisible(trap.pos))
                continue;
            this.#seenTraps.add(trap.id);
            return "trap-hint";
        }
        for (let dy = -2; dy <= 2; dy += 1) {
            for (let dx = -2; dx <= 2; dx += 1) {
                const p = { x: this.#pos.x + dx, y: this.#pos.y + dy };
                const key = tileIndex(this.floor.width, p);
                if (this.tile(p) === "secret" && !this.#hintedSecrets.has(key)) {
                    this.#hintedSecrets.add(key);
                    return "secret-hint";
                }
            }
        }
        if (!this.#stairsSeen && this.isVisible(this.floor.stairs)) {
            this.#stairsSeen = true;
            return "stair";
        }
        // Risk stops fire once when entering the risk state and re-arm after it clears.
        const lowFood = this.#food <= AUTO_LOW_FOOD;
        if (!lowFood)
            this.#lowFoodLatched = false;
        else if (!this.#lowFoodLatched) {
            this.#lowFoodLatched = true;
            return "low-food";
        }
        const lowHp = this.#party.some((member) => member.hp > 0 && member.hp / member.maxHp < AUTO_LOW_HP_RATIO);
        if (!lowHp)
            this.#lowHpLatched = false;
        else if (!this.#lowHpLatched) {
            this.#lowHpLatched = true;
            return "low-hp";
        }
        return null;
    }
    #autoDirection() {
        const width = this.floor.width;
        const frontier = (key) => this.#isFrontier({ x: key % width, y: Math.floor(key / width) });
        // Auto explore never deliberately steps on a revealed trap.
        return this.#pathStep(frontier, "strict") ?? this.#pathStep(frontier, "enemies");
    }
    /** BFS over explored passable tiles. "strict" avoids revealed traps and enemies; "enemies" allows enemies (bump = battle); "all" also allows traps. */
    #pathStep(isGoal, mode) {
        const width = this.floor.width;
        const start = tileIndex(width, this.#pos);
        const firstStep = new Map();
        const seen = new Set([start]);
        const queue = [this.#pos];
        const traps = new Set(this.#traps.filter((trap) => trap.revealed).map((trap) => tileIndex(width, trap.pos)));
        while (queue.length > 0) {
            const current = queue.shift();
            const key = tileIndex(width, current);
            if (key !== start && isGoal(key))
                return firstStep.get(key) ?? null;
            for (const direction of DIRECTIONS) {
                if (!this.#canStep(current, direction))
                    continue;
                const next = step(current, direction);
                const nextKey = tileIndex(width, next);
                if (seen.has(nextKey) || !this.#explored.has(nextKey))
                    continue;
                if (!isGoal(nextKey)) {
                    if (traps.has(nextKey) && mode !== "all")
                        continue;
                    if (this.#enemyAt(next) !== undefined && mode === "strict")
                        continue;
                }
                seen.add(nextKey);
                firstStep.set(nextKey, key === start ? direction : firstStep.get(key));
                queue.push(next);
            }
        }
        return null;
    }
    #isFrontier(p) {
        for (const direction of DIRECTIONS) {
            const next = step(p, direction);
            if (this.#passable(next) && !this.#explored.has(tileIndex(this.floor.width, next)))
                return true;
        }
        return false;
    }
}
//# sourceMappingURL=engine.js.map