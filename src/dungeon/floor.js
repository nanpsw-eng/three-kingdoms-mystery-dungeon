import { SeededRng } from "../core/rng.js";
import { DEFAULT_SECRET_ROOM_CHANCE, EXTRA_EDGE_CHANCE, FLOOR_HEIGHT, FLOOR_WIDTH, MAX_DEAD_ENDS, MAX_EXTRA_EDGES, MAX_ROOMS, MIN_ROOMS, ROOM_MAX_HEIGHT, ROOM_MAX_WIDTH, ROOM_MIN_SIZE, ROOM_PADDING, COMPACT_ROOM_MAX_WIDTH, COMPACT_ROOM_MAX_HEIGHT, } from "./balance.js";
import { DIRECTIONS, manhattan, rectCenter, rectContains, rectsOverlap } from "./geometry.js";
export const TRAP_TYPES = [
    "rockfall", "poison-needle", "fire-circle", "pit", "alarm-bell", "food-loss", "confusion-circle", "teleport-circle",
];
export function tileIndex(width, point) {
    return point.y * width + point.x;
}
export function isPassableTile(kind) {
    return kind === "room" || kind === "corridor";
}
export function pickWeighted(rng, pool) {
    const total = pool.reduce((sum, entry) => sum + entry.weight, 0);
    if (pool.length === 0 || !(total > 0))
        throw new RangeError("Weighted pool must have positive total weight.");
    let roll = rng.nextFloat() * total;
    for (const entry of pool) {
        roll -= entry.weight;
        if (roll < 0)
            return entry.id;
    }
    return pool[pool.length - 1].id;
}
function rollRange(rng, [min, max]) {
    if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || min < 0 || max < min) {
        throw new RangeError("Count range must be integers with 0 <= min <= max.");
    }
    return rng.nextInt(min, max + 1);
}
class Grid {
    width;
    height;
    tiles;
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.tiles = new Array(width * height).fill("wall");
    }
    inBounds(p) { return p.x >= 0 && p.y >= 0 && p.x < this.width && p.y < this.height; }
    get(p) { return this.inBounds(p) ? this.tiles[tileIndex(this.width, p)] : undefined; }
    set(p, kind) { this.tiles[tileIndex(this.width, p)] = kind; }
}
function placeRooms(rng, count, compact) {
    const rooms = [];
    for (let attempt = 0; attempt < 600 && rooms.length < count; attempt += 1) {
        const width = rng.nextInt(ROOM_MIN_SIZE, (compact ? COMPACT_ROOM_MAX_WIDTH : ROOM_MAX_WIDTH) + 1);
        const height = rng.nextInt(ROOM_MIN_SIZE, (compact ? COMPACT_ROOM_MAX_HEIGHT : ROOM_MAX_HEIGHT) + 1);
        const room = { x: rng.nextInt(1, FLOOR_WIDTH - width - 1), y: rng.nextInt(1, FLOOR_HEIGHT - height - 1), width, height };
        if (rooms.every((other) => !rectsOverlap(room, other, ROOM_PADDING)))
            rooms.push(room);
    }
    return rooms.length === count ? rooms : null;
}
/** Prim MST over room centers (manhattan), then a few extra loop edges. */
function roomEdges(rng, rooms) {
    const centers = rooms.map(rectCenter);
    const inTree = new Set([0]);
    const edges = [];
    while (inTree.size < rooms.length) {
        let best = null;
        let bestCost = Infinity;
        for (const from of inTree) {
            for (let to = 0; to < rooms.length; to += 1) {
                if (inTree.has(to))
                    continue;
                const cost = manhattan(centers[from], centers[to]);
                if (cost < bestCost) {
                    bestCost = cost;
                    best = [from, to];
                }
            }
        }
        edges.push(best);
        inTree.add(best[1]);
    }
    const candidates = [];
    for (let a = 0; a < rooms.length; a += 1) {
        for (let b = a + 1; b < rooms.length; b += 1) {
            if (edges.some(([x, y]) => (x === a && y === b) || (x === b && y === a)))
                continue;
            candidates.push([a, b, manhattan(centers[a], centers[b])]);
        }
    }
    candidates.sort((left, right) => left[2] - right[2] || left[0] - right[0] || left[1] - right[1]);
    let extra = 0;
    for (const [a, b] of candidates) {
        if (extra >= MAX_EXTRA_EDGES)
            break;
        if (rng.chance(EXTRA_EDGE_CHANCE)) {
            edges.push([a, b]);
            extra += 1;
        }
    }
    return edges;
}
function corridorPath(rng, from, to) {
    const path = [];
    const horizontalFirst = rng.chance(0.5);
    let x = from.x;
    let y = from.y;
    const stepX = () => { while (x !== to.x) {
        x += Math.sign(to.x - x);
        path.push({ x, y });
    } };
    const stepY = () => { while (y !== to.y) {
        y += Math.sign(to.y - y);
        path.push({ x, y });
    } };
    if (horizontalFirst) {
        stepX();
        stepY();
    }
    else {
        stepY();
        stepX();
    }
    return path;
}
function carve(grid, path) {
    for (const p of path)
        if (grid.get(p) === "wall")
            grid.set(p, "corridor");
}
function roomOf(rooms, p) {
    return rooms.findIndex((room) => rectContains(room, p));
}
function hopDistances(roomCount, edges, from) {
    const dist = new Array(roomCount).fill(Infinity);
    dist[from] = 0;
    const queue = [from];
    while (queue.length > 0) {
        const current = queue.shift();
        for (const [a, b] of edges) {
            const next = a === current ? b : b === current ? a : -1;
            if (next >= 0 && dist[next] === Infinity) {
                dist[next] = dist[current] + 1;
                queue.push(next);
            }
        }
    }
    return dist;
}
function farthest(dist, exclude) {
    let best = -1;
    for (let index = 0; index < dist.length; index += 1) {
        if (index === exclude)
            continue;
        if (best < 0 || dist[index] > dist[best])
            best = index;
    }
    return best;
}
function addDeadEnds(rng, grid, rooms) {
    const corridors = [];
    for (let y = 0; y < grid.height; y += 1)
        for (let x = 0; x < grid.width; x += 1)
            if (grid.get({ x, y }) === "corridor")
                corridors.push({ x, y });
    if (corridors.length === 0)
        return;
    const count = rng.nextInt(0, MAX_DEAD_ENDS + 1);
    const cardinal = ["n", "e", "s", "w"];
    for (let index = 0; index < count; index += 1) {
        const origin = rng.pick(corridors);
        const direction = rng.pick(cardinal);
        const length = rng.nextInt(3, 7);
        const d = { n: [0, -1], e: [1, 0], s: [0, 1], w: [-1, 0] }[direction];
        let current = origin;
        for (let stepIndex = 0; stepIndex < length; stepIndex += 1) {
            const next = { x: current.x + d[0], y: current.y + d[1] };
            if (next.x < 1 || next.y < 1 || next.x >= grid.width - 1 || next.y >= grid.height - 1)
                break;
            if (grid.get(next) !== "wall")
                break;
            if (rooms.some((room) => rectsOverlap({ x: next.x, y: next.y, width: 1, height: 1 }, room, 1)))
                break;
            grid.set(next, "corridor");
            current = next;
        }
    }
}
function addSecretRoom(rng, grid, rooms) {
    for (let attempt = 0; attempt < 80; attempt += 1) {
        const width = rng.nextInt(ROOM_MIN_SIZE, 6);
        const height = rng.nextInt(ROOM_MIN_SIZE, 6);
        const room = { x: rng.nextInt(1, FLOOR_WIDTH - width - 1), y: rng.nextInt(1, FLOOR_HEIGHT - height - 1), width, height };
        if (rooms.some((other) => rectsOverlap(room, other, ROOM_PADDING)))
            continue;
        // Room interior must currently be untouched wall (no corridor crossing it).
        let clear = true;
        for (let y = room.y - 1; y <= room.y + room.height && clear; y += 1) {
            for (let x = room.x - 1; x <= room.x + room.width; x += 1)
                if (grid.get({ x, y }) !== "wall") {
                    clear = false;
                    break;
                }
        }
        if (!clear)
            continue;
        const center = rectCenter(room);
        const target = rooms.map((other, index) => ({ index, cost: manhattan(center, rectCenter(other)) })).sort((a, b) => a.cost - b.cost || a.index - b.index)[0];
        const path = corridorPath(rng, center, rectCenter(rooms[target.index]));
        const carved = [];
        let secret = null;
        const touchesExisting = (p) => [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => {
            const q = { x: p.x + dx, y: p.y + dy };
            return grid.get(q) !== "wall" && grid.get(q) !== undefined && !rectContains(room, q);
        });
        for (const p of path) {
            if (rectContains(room, p))
                continue;
            if (grid.get(p) !== "wall") {
                secret = carved.length > 0 ? carved[carved.length - 1] : null;
                break;
            }
            // The first carved tile touching existing walkable space becomes the secret passage,
            // so the hidden corridor can never connect around it.
            if (touchesExisting(p)) {
                secret = p;
                break;
            }
            carved.push(p);
        }
        if (secret === null)
            continue;
        for (let y = room.y; y < room.y + room.height; y += 1)
            for (let x = room.x; x < room.x + room.width; x += 1)
                grid.set({ x, y }, "room");
        for (const p of carved)
            grid.set(p, "corridor");
        grid.set(secret, "secret");
        rooms.push(room);
        return rooms.length - 1;
    }
    return null;
}
function interiorTiles(room) {
    const tiles = [];
    for (let y = room.y; y < room.y + room.height; y += 1)
        for (let x = room.x; x < room.x + room.width; x += 1)
            tiles.push({ x, y });
    return tiles;
}
function reachable(grid, from, passable) {
    const seen = new Set([tileIndex(grid.width, from)]);
    const queue = [from];
    while (queue.length > 0) {
        const current = queue.shift();
        for (const direction of ["n", "e", "s", "w"]) {
            const d = { n: [0, -1], e: [1, 0], s: [0, 1], w: [-1, 0] }[direction];
            const next = { x: current.x + d[0], y: current.y + d[1] };
            const key = tileIndex(grid.width, next);
            if (!seen.has(key) && passable(grid.get(next))) {
                seen.add(key);
                queue.push(next);
            }
        }
    }
    return seen;
}
function tryGenerate(spec, attempt) {
    const root = new SeededRng(spec.seed).fork("floor-" + spec.depth).fork("attempt-" + attempt);
    const layoutRng = root.fork("layout");
    const roomCount = layoutRng.nextInt(MIN_ROOMS, MAX_ROOMS + 1);
    const rooms = placeRooms(layoutRng, roomCount, spec.layoutVersion === "compact-v2");
    if (rooms === null)
        return null;
    const grid = new Grid(FLOOR_WIDTH, FLOOR_HEIGHT);
    for (const room of rooms)
        for (const p of interiorTiles(room))
            grid.set(p, "room");
    const edges = roomEdges(layoutRng, rooms);
    for (const [a, b] of edges)
        carve(grid, corridorPath(layoutRng, rectCenter(rooms[a]), rectCenter(rooms[b])));
    addDeadEnds(layoutRng, grid, rooms);
    // Start/stairs: endpoints of the room-graph diameter (minimum distance rule).
    const startRoom = farthest(hopDistances(rooms.length, edges, 0), -1);
    const stairsRoom = farthest(hopDistances(rooms.length, edges, startRoom), startRoom);
    const mainRooms = rooms.length;
    const secretRoom = layoutRng.chance(spec.secretRoomChance ?? DEFAULT_SECRET_ROOM_CHANCE) ? addSecretRoom(layoutRng, grid, rooms) : null;
    const placeRng = root.fork("place");
    const start = rectCenter(rooms[startRoom]);
    const stairsCandidates = interiorTiles(rooms[stairsRoom]);
    const stairs = placeRng.pick(stairsCandidates);
    const occupied = new Set([tileIndex(grid.width, start), tileIndex(grid.width, stairs)]);
    const take = (p) => { const key = tileIndex(grid.width, p); if (occupied.has(key))
        return false; occupied.add(key); return true; };
    const freeTileIn = (room) => {
        const tiles = interiorTiles(rooms[room]).filter((p) => !occupied.has(tileIndex(grid.width, p)));
        if (tiles.length === 0)
            return null;
        const p = placeRng.pick(tiles);
        take(p);
        return p;
    };
    const contentRooms = [...Array(mainRooms).keys()].filter((index) => index !== startRoom);
    // Gates (Hulao): corridor tiles orthogonally touching the stairs room, defender just outside.
    const gates = [];
    const enemies = [];
    let enemySeq = 0;
    if (spec.mechanics?.gates !== undefined && !spec.boss) {
        const room = rooms[stairsRoom];
        const touches = (q) => [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => rectContains(room, { x: q.x + dx, y: q.y + dy }));
        const gateTiles = interiorTiles({ x: room.x - 1, y: room.y - 1, width: room.width + 2, height: room.height + 2 })
            .filter((p) => !rectContains(room, p) && grid.get(p) === "corridor" && touches(p));
        const gateKeys = new Set(gateTiles.map((p) => tileIndex(grid.width, p)));
        const defenderIds = [];
        for (const p of gateTiles) {
            if (defenderIds.length >= 2)
                break;
            const outward = [[0, 1], [0, -1], [1, 0], [-1, 0]]
                .map(([dx, dy]) => ({ x: p.x + dx, y: p.y + dy }))
                .find((q) => grid.get(q) === "corridor" && !rectContains(room, q) && !gateKeys.has(tileIndex(grid.width, q)) && !occupied.has(tileIndex(grid.width, q)));
            if (outward === undefined)
                continue;
            take(outward);
            const id = "enemy-" + enemySeq++;
            defenderIds.push(id);
            enemies.push({ id, groupId: spec.mechanics.gates.defenderGroupId, pos: outward, facing: DIRECTIONS[placeRng.nextInt(0, 8)], behavior: "stationary", gateId: "gate-0" });
        }
        if (defenderIds.length === 0)
            gateTiles.length = 0;
        if (gateTiles.length > 0) {
            for (const p of gateTiles)
                grid.set(p, "gate");
            gates.push({ id: "gate-0", tiles: gateTiles, defenderIds });
        }
    }
    if (spec.boss !== undefined) {
        const p = freeTileIn(stairsRoom);
        if (p === null)
            return null;
        enemies.push({ id: "enemy-" + enemySeq++, groupId: spec.boss.groupId, pos: p, facing: "s", behavior: "stationary", boss: true });
    }
    const enemyRng = root.fork("enemies");
    const enemyCount = rollRange(enemyRng, spec.enemyCount);
    for (let index = 0; index < enemyCount && spec.enemyGroups.length > 0; index += 1) {
        const room = enemyRng.pick(contentRooms);
        const p = freeTileIn(room);
        if (p === null)
            continue;
        enemies.push({ id: "enemy-" + enemySeq++, groupId: pickWeighted(enemyRng, spec.enemyGroups), pos: p, facing: DIRECTIONS[enemyRng.nextInt(0, 8)], behavior: enemyRng.chance(0.6) ? "patrol" : "idle" });
    }
    const objectRng = root.fork("objects");
    const objects = [];
    let objectSeq = 0;
    for (const group of spec.objects ?? []) {
        if (!objectRng.chance(group.chance ?? 1))
            continue;
        const count = rollRange(objectRng, group.count);
        for (let index = 0; index < count; index += 1) {
            const pool = [...contentRooms, ...(secretRoom === null ? [] : [secretRoom, secretRoom])];
            const room = objectRng.pick(pool);
            const p = freeTileIn(room);
            if (p === null)
                continue;
            objects.push({ id: "object-" + objectSeq++, kind: group.kind, contentId: pickWeighted(objectRng, group.pool), pos: p, room });
        }
    }
    const sorceryCount = Math.min(spec.mechanics?.sorceryFormations ?? 0, contentRooms.length - 1);
    const sorceryRooms = objectRng.shuffle(contentRooms.filter((index) => index !== stairsRoom)).slice(0, sorceryCount);
    for (const room of sorceryRooms) {
        const p = freeTileIn(room);
        if (p !== null)
            objects.push({ id: "object-" + objectSeq++, kind: "sorcery", contentId: "sorcery-formation", pos: p, room });
    }
    const trapRng = root.fork("traps");
    const traps = [];
    const trapCount = spec.traps.length === 0 ? 0 : rollRange(trapRng, spec.trapCount);
    const trapTiles = [];
    for (let y = 0; y < grid.height; y += 1) {
        for (let x = 0; x < grid.width; x += 1) {
            const p = { x, y };
            const kind = grid.get(p);
            if (!isPassableTile(kind))
                continue;
            if (rectContains(rooms[startRoom], p) || occupied.has(tileIndex(grid.width, p)))
                continue;
            trapTiles.push(p);
        }
    }
    for (let index = 0; index < trapCount && trapTiles.length > 0; index += 1) {
        const p = trapRng.pick(trapTiles);
        if (!take(p))
            continue;
        traps.push({ id: "trap-" + index, type: pickWeighted(trapRng, spec.traps), pos: p });
    }
    // Validation: everything required is reachable (gates/secret treated as openable).
    const openable = reachable(grid, start, (kind) => kind === "room" || kind === "corridor" || kind === "gate" || kind === "secret");
    const required = [stairs, ...enemies.map((e) => e.pos), ...objects.map((o) => o.pos)];
    if (!required.every((p) => openable.has(tileIndex(grid.width, p))))
        return null;
    const withoutSecret = reachable(grid, start, (kind) => kind === "room" || kind === "corridor" || kind === "gate");
    if (!withoutSecret.has(tileIndex(grid.width, stairs)))
        return null;
    const gatesClosed = reachable(grid, start, (kind) => kind === "room" || kind === "corridor");
    if (!enemies.filter((e) => e.gateId !== undefined).every((e) => gatesClosed.has(tileIndex(grid.width, e.pos))))
        return null;
    return {
        depth: spec.depth,
        width: grid.width,
        height: grid.height,
        tiles: grid.tiles,
        rooms,
        startRoom,
        stairsRoom,
        secretRoom,
        start,
        stairs,
        traps,
        objects,
        enemies,
        gates,
        modifier: spec.modifier ?? null,
        boss: spec.boss !== undefined,
        alarmNetwork: spec.mechanics?.alarmNetwork ?? false,
        mechanics: spec.mechanics?.list ?? [],
        attempt,
    };
}
/** Deterministic floor generation: same spec (incl. seed) → identical floor. */
export function generateFloor(spec) {
    if (spec.layoutVersion !== undefined && spec.layoutVersion !== "legacy-v1" && spec.layoutVersion !== "compact-v2")
        throw new RangeError("Unknown dungeon layout version.");
    if (!Number.isSafeInteger(spec.depth) || spec.depth < 1)
        throw new RangeError("Floor depth must be a positive integer.");
    for (let attempt = 0; attempt < 50; attempt += 1) {
        const floor = tryGenerate(spec, attempt);
        if (floor !== null)
            return floor;
    }
    throw new Error("Floor generation failed after 50 attempts: depth " + spec.depth);
}
export function roomAt(floor, p) {
    return roomOf(floor.rooms, p);
}
//# sourceMappingURL=floor.js.map