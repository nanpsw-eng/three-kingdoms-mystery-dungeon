import { chooseAllAttackCommand, chooseSmartCommand, RepeatAutoController } from "../battle/auto.js";
import { MAX_ENERGY, POST_BATTLE_KO_RECOVERY_RATIO } from "../battle/balance.js";
import { BattleEngine } from "../battle/battle.js";
import { FORMATION_SLOTS } from "../battle/formation.js";
import { SeededRng } from "../core/rng.js";
import { DungeonEngine } from "../dungeon/engine.js";
import { generateFloor, pickWeighted } from "../dungeon/floor.js";
import { DUEL_CHAMPION_HP_RATIO, DUEL_DEFAULT_PENALTY, DUEL_LOSS_ENEMY_ENERGY, ENHANCE_CAP, ENHANCE_COST_BASE, ENHANCE_STEP, IDENTIFY_COST, INVENTORY_SLOTS, LEVEL_EXP_TABLE, LEVEL_GROWTH, MAX_PARTY_SIZE, MAX_RECRUITS_PER_RUN, PARTY_LEVEL_CAP, REINFORCEMENT_REWARD_RATIO, RENOWN_ENEMY_STEP, RENOWN_MAX, RENOWN_REWARD_STEP, SAFE_ZONE_HEAL_RATIO, SHOP_EQUIPMENT_OFFERS, SHOP_ITEM_OFFERS, SORCERY_ENEMY_ENERGY, STARTING_GENERALS, STARTING_GOLD, STARTING_ITEMS, TRAIT_LEVELS, TRAIT_OPTIONS, TRAIT_RELATED_TAG_WEIGHT, TRAIT_REROLLS_PER_RUN, TRAIT_UNIQUE_SHARE, } from "./balance.js";
function byId(items) {
    const map = new Map();
    for (const item of items) {
        if (map.has(item.id))
            throw new Error("Duplicate content id: " + item.id);
        map.set(item.id, item);
    }
    return map;
}
export class RunEngine {
    content;
    campaign;
    #characters;
    #traits;
    #equipment;
    #items;
    #groups;
    #events;
    #scenes;
    #rulerId;
    #renown;
    #seed;
    #dungeonLayout;
    #rng;
    #unlockedCharacters;
    #party = [];
    #bag = [];
    #pending = [];
    #defeatedGroups = new Set();
    #itemsSeen = new Set();
    #recruited = [];
    #uidSeq = 0;
    #floorIndex = 0;
    #dungeon = null;
    #battle = null;
    #encounter = null;
    #battleItemsAtStart = [];
    #battleGroupId = null;
    #queued = null;
    #clearAfterScenes = false;
    #repeat = new RepeatAutoController();
    #battleMode;
    #exp = 0;
    #level = 1;
    #gold = STARTING_GOLD;
    #food = 100;
    #rerolls = TRAIT_REROLLS_PER_RUN;
    #safeZone = false;
    #shop = [];
    #ended = null;
    #turnsBeforeFloor = 0;
    #battles = 0;
    constructor(content, options) {
        if (options.dungeonLayout !== undefined && options.dungeonLayout !== "legacy-v1" && options.dungeonLayout !== "compact-v2")
            throw new RangeError("Unknown dungeon layout version.");
        this.#dungeonLayout = options.dungeonLayout ?? "legacy-v1";
        this.content = content;
        this.#characters = byId(content.characters);
        this.#traits = byId(content.traits);
        this.#equipment = byId(content.equipment);
        this.#items = byId(content.items);
        this.#groups = byId(content.enemyGroups);
        this.#events = byId(content.events);
        this.#scenes = byId(content.scenes ?? []);
        this.#rulerId = options.rulerId;
        const renown = options.renown ?? 0;
        const allowed = options.meta === undefined ? RENOWN_MAX : Math.min(RENOWN_MAX, options.meta.renown?.[options.campaignId] ?? 0);
        if (!Number.isInteger(renown) || renown < 0 || renown > allowed)
            throw new RangeError("Renown level not unlocked: " + renown);
        this.#renown = renown;
        const campaign = content.campaigns.find((candidate) => candidate.id === options.campaignId);
        if (campaign === undefined)
            throw new Error("Unknown campaign: " + options.campaignId);
        this.campaign = campaign;
        const unlockedCampaigns = new Set(options.meta?.unlockedCampaigns ?? content.startingUnlocks.campaigns);
        if (!unlockedCampaigns.has(campaign.id))
            throw new Error("Campaign is locked: " + campaign.id);
        this.#unlockedCharacters = new Set(options.meta?.unlockedCharacters ?? content.startingUnlocks.characters);
        const ruler = this.#character(options.rulerId);
        if (ruler.kind !== "ruler")
            throw new Error("Not a ruler: " + ruler.id);
        if (options.generalIds.length !== STARTING_GENERALS || new Set(options.generalIds).size !== STARTING_GENERALS) {
            throw new RangeError("Start requires exactly " + STARTING_GENERALS + " distinct generals.");
        }
        for (const id of [ruler.id, ...options.generalIds]) {
            if (!this.#unlockedCharacters.has(id))
                throw new Error("Character is locked: " + id);
            const character = this.#character(id);
            if (id !== ruler.id && character.kind !== "general")
                throw new Error("Not a general: " + id);
            this.#addMember(character);
        }
        this.#seed = options.seed;
        const root = new SeededRng(options.seed).fork("run");
        this.#rng = { traits: root.fork("traits"), loot: root.fork("loot"), shop: root.fork("shop"), recruit: root.fork("recruit"), floors: root.fork("floors") };
        this.#battleMode = options.battleMode ?? "manual";
        this.#queueScene(campaign.scenes?.intro);
        for (const itemId of STARTING_ITEMS)
            if (this.#items.has(itemId))
                this.#addToBag(itemId);
        const startLevel = Math.min(PARTY_LEVEL_CAP, Math.max(1, campaign.startLevel ?? 1));
        if (startLevel > 1) {
            this.#level = startLevel;
            this.#exp = LEVEL_EXP_TABLE[startLevel - 1];
            for (const member of this.#party) {
                member.hp = this.#stats(member).maxHp;
                for (const level of TRAIT_LEVELS)
                    if (level <= startLevel)
                        this.#pending.push({ kind: "trait", characterId: member.characterId, options: this.#traitOptions(member), level });
            }
        }
        this.#enterFloor(0, []);
    }
    // ---------- queries ----------
    get phase() {
        if (this.#ended !== null)
            return this.#ended;
        if (this.#battle !== null)
            return "battle";
        const next = this.#pending[0];
        if (next !== undefined)
            return next.kind === "trait" ? "trait-choice" : next.kind;
        if (this.#safeZone)
            return "safe-zone";
        return "dungeon";
    }
    get level() { return this.#level; }
    get exp() { return this.#exp; }
    get gold() { return this.#gold; }
    get food() { return this.#food; }
    get rerolls() { return this.#rerolls; }
    get depth() { return this.campaign.floors[this.#floorIndex].depth; }
    get floorIndex() { return this.#floorIndex; }
    get battleMode() { return this.#battleMode; }
    get renown() { return this.#renown; }
    get dungeon() { if (this.#dungeon === null)
        throw new Error("No active floor."); return this.#dungeon; }
    get battle() { return this.#battle; }
    get encounter() { return this.#encounter; }
    pending() { return [...this.#pending]; }
    inventory() { return [...this.#bag]; }
    shop() { return [...this.#shop]; }
    character(id) { return this.#character(id); }
    trait(id) { const trait = this.#traits.get(id); if (!trait)
        throw new Error("Unknown trait: " + id); return trait; }
    item(id) { return this.#items.get(id); }
    equipmentDef(id) { return this.#equipment.get(id); }
    group(id) { return this.#groups.get(id); }
    event(id) { return this.#events.get(id); }
    /** Scene with the ruler-specific lines resolved (common historical view, flavored per ruler). */
    scene(id) {
        const scene = this.#scenes.get(id);
        if (scene === undefined)
            return undefined;
        return {
            id: scene.id, ...(scene.title === undefined ? {} : { title: scene.title }),
            lines: scene.variants?.[this.#rulerId] ?? scene.lines, choices: (scene.choices ?? []).map((choice) => choice.label),
        };
    }
    party() {
        return this.#party.map((member) => {
            const character = this.#character(member.characterId);
            const stats = this.#stats(member);
            return {
                characterId: member.characterId, name: character.name, hp: member.hp, maxHp: stats.maxHp, stats,
                traits: [...member.traits], equipment: { ...member.equipment }, slot: member.slot, skillIds: this.#skillIds(member),
            };
        });
    }
    summary() {
        return {
            campaignId: this.campaign.id, cleared: this.#ended === "cleared", depthReached: this.depth,
            defeatedGroups: [...this.#defeatedGroups].sort(), recruited: [...this.#recruited], itemsSeen: [...this.#itemsSeen].sort(),
            level: this.#level, turns: this.#turnsBeforeFloor + (this.#dungeon?.turn ?? 0), battles: this.#battles, renown: this.#renown,
        };
    }
    stateHash() {
        const json = JSON.stringify({
            floor: this.#floorIndex, level: this.#level, exp: this.#exp, gold: this.#gold, food: this.#food, rerolls: this.#rerolls,
            party: this.#party, bag: this.#bag, pending: this.#pending, safe: this.#safeZone, shop: this.#shop, ended: this.#ended,
            queued: this.#queued, clearing: this.#clearAfterScenes, renown: this.#renown,
            dungeon: this.#dungeon?.stateHash() ?? null, battle: this.#battle?.stateHash() ?? null,
            rng: Object.values(this.#rng).map((rng) => rng.snapshot()),
        });
        let hash = 0x811c9dc5;
        for (let index = 0; index < json.length; index += 1) {
            hash ^= json.charCodeAt(index);
            hash = Math.imul(hash, 0x01000193);
        }
        return (hash >>> 0).toString(16).padStart(8, "0");
    }
    // ---------- commands ----------
    act(command) {
        const events = [];
        const phase = this.phase;
        if (phase === "cleared" || phase === "failed")
            throw new Error("Run has ended: " + phase);
        switch (command.type) {
            case "battle-mode":
                this.#battleMode = command.mode;
                if (phase === "battle")
                    this.#advanceBattle(events);
                return events;
            case "set-formation":
                this.#requirePhase(phase, ["dungeon", "safe-zone", "trait-choice", "recruit", "event", "scene", "duel"]);
                this.#setFormation(command.characterId, command.slot);
                return events;
            case "discard":
                this.#requirePhase(phase, ["dungeon", "safe-zone"]);
                this.#takeFromBag(command.uid);
                return events;
            case "dungeon":
                this.#requirePhase(phase, ["dungeon"]);
                this.#dungeonStep(this.dungeon.execute(command.command).events, events);
                return events;
            case "auto-explore": {
                this.#requirePhase(phase, ["dungeon"]);
                this.#pushToDungeon();
                const result = this.dungeon.autoExplore(command.maxSteps ?? 200);
                this.#dungeonStep(result.events, events);
                return events;
            }
            case "use-item":
                this.#requirePhase(phase, ["dungeon", "safe-zone"]);
                this.#useItem(command.uid, command.targetId, events, phase === "dungeon");
                return events;
            case "equip":
                this.#requirePhase(phase, ["dungeon", "safe-zone"]);
                this.#equip(command.characterId, command.uid, events, phase === "dungeon");
                return events;
            case "unequip":
                this.#requirePhase(phase, ["dungeon", "safe-zone"]);
                this.#unequip(command.characterId, command.slot, events, phase === "dungeon");
                return events;
            case "battle": {
                this.#requirePhase(phase, ["battle"]);
                const battle = this.#battle;
                battle.execute(command.command);
                this.#repeat.record(command.command);
                this.#advanceBattle(events);
                return events;
            }
            case "choose-trait": {
                this.#requirePhase(phase, ["trait-choice"]);
                const choice = this.#pending[0];
                if (!choice.options.includes(command.traitId))
                    throw new Error("Trait not offered: " + command.traitId);
                this.#member(choice.characterId).traits.push(command.traitId);
                this.#pending.shift();
                events.push({ type: "trait-chosen", characterId: choice.characterId, traitId: command.traitId });
                this.#clampHp();
                this.#afterDecision(events);
                return events;
            }
            case "reroll-traits": {
                this.#requirePhase(phase, ["trait-choice"]);
                if (this.#rerolls <= 0)
                    throw new Error("No trait rerolls left.");
                const choice = this.#pending[0];
                this.#rerolls -= 1;
                this.#pending[0] = { ...choice, options: this.#traitOptions(this.#member(choice.characterId)) };
                return events;
            }
            case "recruit": {
                this.#requirePhase(phase, ["recruit"]);
                const offer = this.#pending.shift();
                if (offer.objectId !== "")
                    this.dungeon.removeObject(offer.objectId);
                if (command.accept)
                    this.#recruit(offer.characterId, events);
                this.#afterDecision(events);
                return events;
            }
            case "event-choice": {
                this.#requirePhase(phase, ["event"]);
                const pending = this.#pending[0];
                const definition = this.#events.get(pending.eventId);
                const choice = definition.choices[command.index];
                if (choice === undefined)
                    throw new RangeError("Invalid event choice.");
                this.#pending.shift();
                this.dungeon.removeObject(pending.objectId);
                for (const effect of choice.effects)
                    this.#applyEffect(effect, events);
                events.push({ type: "event-resolved", eventId: pending.eventId, choice: command.index });
                this.#pushToDungeon();
                this.#afterDecision(events);
                return events;
            }
            case "scene": {
                this.#requirePhase(phase, ["scene"]);
                const pending = this.#pending[0];
                const definition = this.#scenes.get(pending.sceneId);
                let index = null;
                if (definition.choices !== undefined && definition.choices.length > 0) {
                    index = command.choice ?? -1;
                    const choice = definition.choices[index];
                    if (choice === undefined)
                        throw new RangeError("Scene needs a valid choice.");
                    this.#pending.shift();
                    for (const effect of choice.effects)
                        this.#applyEffect(effect, events);
                }
                else {
                    this.#pending.shift();
                }
                events.push({ type: "scene-ended", sceneId: pending.sceneId, choice: index });
                this.#pushToDungeon();
                this.#afterDecision(events);
                return events;
            }
            case "duel": {
                this.#requirePhase(phase, ["duel"]);
                const pending = this.#pending[0];
                if (command.characterId !== null) {
                    const member = this.#member(command.characterId);
                    if (member.hp <= 0)
                        throw new Error("A KO member cannot duel.");
                }
                this.#pending.shift();
                if (command.characterId !== null)
                    this.#fightDuel(command.characterId, pending, events);
                this.#afterDecision(events);
                return events;
            }
            case "shop-buy": {
                this.#requirePhase(phase, ["safe-zone"]);
                const offer = this.#shop[command.offerIndex];
                if (offer === undefined || offer.sold)
                    throw new Error("Offer unavailable.");
                if (this.#gold < offer.price)
                    throw new Error("Not enough gold.");
                if (this.#bag.length >= INVENTORY_SLOTS)
                    throw new Error("Inventory is full.");
                this.#gold -= offer.price;
                this.#shop[command.offerIndex] = { ...offer, sold: true };
                this.#addToBag(offer.contentId, true);
                events.push({ type: "purchased", contentId: offer.contentId });
                return events;
            }
            case "identify": {
                this.#requirePhase(phase, ["safe-zone"]);
                if (this.#gold < IDENTIFY_COST)
                    throw new Error("Not enough gold.");
                if (!this.#identify(command.uid))
                    throw new Error("Nothing to identify: " + command.uid);
                this.#gold -= IDENTIFY_COST;
                return events;
            }
            case "enhance": {
                this.#requirePhase(phase, ["safe-zone"]);
                const member = this.#member(command.characterId);
                const instance = member.equipment[command.slot];
                if (instance === undefined)
                    throw new Error("Nothing equipped in " + command.slot);
                if (instance.enhance >= ENHANCE_CAP)
                    throw new Error("Enhancement cap reached.");
                const cost = ENHANCE_COST_BASE * (instance.enhance + 1);
                if (this.#gold < cost)
                    throw new Error("Not enough gold.");
                this.#gold -= cost;
                member.equipment[command.slot] = { ...instance, enhance: instance.enhance + 1, identified: true };
                return events;
            }
            case "leave-safe-zone":
                this.#requirePhase(phase, ["safe-zone"]);
                this.#safeZone = false;
                this.#shop = [];
                this.#enterFloor(this.#floorIndex + 1, events);
                return events;
        }
    }
    // ---------- party / stats ----------
    #character(id) {
        const character = this.#characters.get(id);
        if (character === undefined)
            throw new Error("Unknown character: " + id);
        return character;
    }
    #member(id) {
        const member = this.#party.find((candidate) => candidate.characterId === id);
        if (member === undefined)
            throw new Error("Not in party: " + id);
        return member;
    }
    #requirePhase(phase, allowed) {
        if (!allowed.includes(phase))
            throw new Error("Command not allowed in phase: " + phase);
    }
    #addMember(character) {
        if (this.#party.length >= MAX_PARTY_SIZE)
            throw new Error("Party is full.");
        const taken = new Set(this.#party.map((member) => member.slot));
        const slot = taken.has(character.defaultSlot) ? FORMATION_SLOTS.find((candidate) => !taken.has(candidate)) : character.defaultSlot;
        const member = { characterId: character.id, hp: 0, traits: [], equipment: {}, slot };
        this.#party.push(member);
        member.hp = this.#stats(member).maxHp;
    }
    #stats(member) {
        const base = this.#character(member.characterId).stats;
        const percent = { maxHp: 0, atk: 0, def: 0, spd: 0, int: 0 };
        for (const traitId of member.traits) {
            for (const [key, value] of Object.entries(this.#traits.get(traitId)?.effect.statPercent ?? {}))
                percent[key] += value ?? 0;
        }
        const flat = { maxHp: 0, atk: 0, def: 0, spd: 0, int: 0 };
        for (const instance of Object.values(member.equipment)) {
            if (instance === undefined)
                continue;
            const definition = this.#equipment.get(instance.equipmentId);
            for (const [key, value] of Object.entries(definition?.stats ?? {})) {
                const amount = value ?? 0;
                flat[key] += amount + instance.enhance * Math.sign(amount) * Math.max(1, Math.round(Math.abs(amount) * ENHANCE_STEP));
            }
        }
        const result = {};
        for (const key of ["maxHp", "atk", "def", "spd", "int"]) {
            const grown = base[key] * (1 + LEVEL_GROWTH[key] * (this.#level - 1));
            result[key] = Math.max(1, Math.round((grown + flat[key]) * (1 + percent[key])));
        }
        return result;
    }
    #skillIds(member) {
        const ids = [...this.#character(member.characterId).skillIds];
        for (const traitId of member.traits) {
            const granted = this.#traits.get(traitId)?.effect.grantSkillId;
            if (granted !== undefined && !ids.includes(granted))
                ids.push(granted);
        }
        // Keep the ally loadout limit: newest actives replace the oldest when over 3.
        const skills = new Map(this.content.skills.map((skill) => [skill.id, skill]));
        const actives = ids.filter((id) => skills.get(id)?.kind === "active");
        const ultimates = ids.filter((id) => skills.get(id)?.kind === "ultimate");
        return [...actives.slice(-3), ...ultimates.slice(-1)];
    }
    #clampHp() {
        for (const member of this.#party)
            member.hp = Math.min(member.hp, this.#stats(member).maxHp);
    }
    #setFormation(characterId, slot) {
        const member = this.#member(characterId);
        const occupant = this.#party.find((candidate) => candidate.slot === slot);
        if (occupant !== undefined)
            occupant.slot = member.slot;
        member.slot = slot;
    }
    #expedition() {
        return this.#party.map((member) => ({ id: member.characterId, maxHp: this.#stats(member).maxHp, hp: member.hp }));
    }
    #pushToDungeon() {
        if (this.#dungeon === null)
            return;
        this.#dungeon.setParty(this.#expedition());
        this.#dungeon.setFood(this.#food);
    }
    #pullFromDungeon() {
        if (this.#dungeon === null)
            return;
        for (const vitals of this.#dungeon.party()) {
            const member = this.#party.find((candidate) => candidate.characterId === vitals.id);
            if (member !== undefined)
                member.hp = vitals.hp;
        }
        this.#food = this.#dungeon.food;
    }
    // ---------- inventory ----------
    #newUid() { return "u" + this.#uidSeq++; }
    #addToBag(contentId, identified = false) {
        if (this.#bag.length >= INVENTORY_SLOTS)
            return false;
        this.#itemsSeen.add(contentId);
        if (this.#items.has(contentId)) {
            this.#bag.push({ uid: this.#newUid(), kind: "item", itemId: contentId });
            return true;
        }
        const definition = this.#equipment.get(contentId);
        if (definition === undefined)
            throw new Error("Unknown item or equipment: " + contentId);
        this.#bag.push({ uid: this.#newUid(), kind: "equipment", equipment: { uid: this.#newUid(), equipmentId: contentId, identified: identified || !definition.unidentified, enhance: 0 } });
        return true;
    }
    #takeFromBag(uid) {
        const index = this.#bag.findIndex((entry) => entry.uid === uid);
        if (index < 0)
            throw new Error("Not in inventory: " + uid);
        return this.#bag.splice(index, 1)[0];
    }
    #identify(uid) {
        const index = this.#bag.findIndex((entry) => entry.uid === uid && entry.kind === "equipment" && !entry.equipment.identified);
        if (index >= 0) {
            const entry = this.#bag[index];
            this.#bag[index] = { ...entry, equipment: { ...entry.equipment, identified: true } };
            return true;
        }
        for (const member of this.#party) {
            for (const slot of ["weapon", "armor", "treasure"]) {
                const instance = member.equipment[slot];
                if (instance !== undefined && instance.uid === uid && !instance.identified) {
                    member.equipment[slot] = { ...instance, identified: true };
                    return true;
                }
            }
        }
        return false;
    }
    #spendDungeonTurn(events, reason) {
        this.#pushToDungeon();
        this.#dungeonStep(this.dungeon.execute({ type: "spend-turn", reason }).events, events);
    }
    #useItem(uid, targetId, events, spendsTurn) {
        const entry = this.#bag.find((candidate) => candidate.uid === uid);
        if (entry === undefined || entry.kind !== "item")
            throw new Error("Not a usable item: " + uid);
        const item = this.#items.get(entry.itemId);
        const healBonus = (member) => member.traits.reduce((sum, id) => sum + (this.#traits.get(id)?.effect.healItemBonus ?? 0), 0);
        switch (item.use.kind) {
            case "food":
                this.#food = Math.min(100, this.#food + item.use.amount);
                break;
            case "heal": {
                const ratio = item.use.ratio;
                const targets = item.use.target === "party" ? this.#party.filter((m) => m.hp > 0) : [this.#member(targetId ?? this.#party.find((m) => m.hp > 0).characterId)];
                if (targets.some((m) => m.hp <= 0))
                    throw new Error("Healing items cannot revive KO members.");
                for (const member of targets) {
                    const max = this.#stats(member).maxHp;
                    member.hp = Math.min(max, member.hp + Math.max(1, Math.round(max * ratio * (1 + healBonus(member)))));
                }
                break;
            }
            case "treat": {
                const member = this.#member(targetId ?? this.#party.find((m) => m.hp <= 0)?.characterId ?? "");
                if (member.hp > 0)
                    throw new Error("Treatment requires a KO member.");
                member.hp = Math.max(1, Math.round(this.#stats(member).maxHp * item.use.ratio));
                break;
            }
            case "identify":
                if (targetId === undefined || !this.#identify(targetId))
                    throw new Error("Identify needs an unidentified equipment uid.");
                break;
            case "reveal-traps":
                this.dungeon.revealAllTraps();
                break;
            case "battle":
                throw new Error("Battle items can only be used in battle.");
        }
        this.#takeFromBag(uid);
        events.push({ type: "item-used", itemId: item.id });
        if (spendsTurn)
            this.#spendDungeonTurn(events, "item");
        else
            this.#pushToDungeon();
    }
    #equip(characterId, uid, events, spendsTurn) {
        const member = this.#member(characterId);
        const entry = this.#bag.find((candidate) => candidate.uid === uid);
        if (entry === undefined || entry.kind !== "equipment")
            throw new Error("Not equipment: " + uid);
        const definition = this.#equipment.get(entry.equipment.equipmentId);
        this.#takeFromBag(uid);
        const previous = member.equipment[definition.slot];
        if (previous !== undefined)
            this.#bag.push({ uid: this.#newUid(), kind: "equipment", equipment: previous });
        member.equipment[definition.slot] = { ...entry.equipment, identified: true };
        this.#clampHp();
        events.push({ type: "equipped", characterId, equipmentId: definition.id });
        if (spendsTurn)
            this.#spendDungeonTurn(events, "equipment");
        else
            this.#pushToDungeon();
    }
    #unequip(characterId, slot, events, spendsTurn) {
        const member = this.#member(characterId);
        const instance = member.equipment[slot];
        if (instance === undefined)
            throw new Error("Nothing equipped.");
        if (this.#bag.length >= INVENTORY_SLOTS)
            throw new Error("Inventory is full.");
        delete member.equipment[slot];
        this.#bag.push({ uid: this.#newUid(), kind: "equipment", equipment: instance });
        this.#clampHp();
        if (spendsTurn)
            this.#spendDungeonTurn(events, "equipment");
        else
            this.#pushToDungeon();
    }
    // ---------- floors / dungeon ----------
    #enterFloor(index, events) {
        if (this.#dungeon !== null)
            this.#turnsBeforeFloor += this.#dungeon.turn;
        this.#floorIndex = index;
        const plan = this.campaign.floors[index];
        const floorRng = this.#rng.floors.fork("floor-" + index);
        const modifier = plan.modifiers !== undefined && plan.modifiers.length > 0 && floorRng.chance(plan.modifierChance ?? 0) ? pickWeighted(floorRng, plan.modifiers) : undefined;
        const spec = {
            layoutVersion: this.#dungeonLayout,
            seed: String(this.#seed) + "::" + this.campaign.id,
            depth: plan.depth,
            enemyGroups: plan.enemyGroups,
            enemyCount: plan.enemyCount,
            traps: plan.traps,
            trapCount: plan.trapCount,
            ...(plan.objects === undefined ? {} : { objects: plan.objects }),
            ...(plan.secretRoomChance === undefined ? {} : { secretRoomChance: plan.secretRoomChance }),
            ...(modifier === undefined ? {} : { modifier }),
            ...(plan.bossGroupId === undefined ? {} : { boss: { groupId: plan.bossGroupId } }),
            mechanics: {
                ...(plan.gateDefenderGroupId === undefined ? {} : { gates: { defenderGroupId: plan.gateDefenderGroupId } }),
                ...(plan.sorceryFormations === undefined ? {} : { sorceryFormations: plan.sorceryFormations }),
                ...(plan.alarmNetwork === undefined ? {} : { alarmNetwork: plan.alarmNetwork }),
                ...(plan.mechanics === undefined ? {} : { list: plan.mechanics }),
            },
        };
        const floor = generateFloor(spec);
        const passive = Math.max(0, ...this.#party.flatMap((member) => member.traits.map((id) => this.#traits.get(id)?.effect.passiveTrapDetection ?? 0)));
        this.#dungeon = new DungeonEngine(floor, {
            seed: String(this.#seed) + "::" + this.campaign.id, party: this.#expedition(), food: this.#food,
            passiveTrapDetection: passive, reinforcementGroups: plan.enemyGroups,
        });
        events.push({ type: "floor-entered", depth: plan.depth, modifier: floor.modifier });
        this.#queueScene(this.campaign.scenes?.floorEnter?.[plan.depth]);
    }
    #dungeonStep(dungeonEvents, events) {
        this.#pullFromDungeon();
        for (const event of dungeonEvents) {
            events.push({ type: "dungeon", event });
            switch (event.type) {
                case "object":
                    this.#onObject(event.object.id, event.object.kind, event.object.contentId, events);
                    break;
                case "encounter":
                    this.#startBattle(event.encounter, events);
                    break;
                case "descended":
                    this.#onDescended(events);
                    break;
                case "party-defeated":
                    if (this.#battle === null)
                        this.#fail("starvation", events);
                    break;
                default:
                    break;
            }
        }
    }
    #onObject(objectId, kind, contentId, events) {
        if (this.#pending.some((decision) => "objectId" in decision && decision.objectId === objectId))
            return;
        if (kind === "item") {
            if (this.#addToBag(contentId)) {
                this.dungeon.removeObject(objectId);
                events.push({ type: "picked-up", contentId });
            }
            else
                events.push({ type: "bag-full", contentId });
            return;
        }
        if (kind === "event") {
            this.#pending.push({ kind: "event", eventId: contentId, objectId });
            return;
        }
        if (kind === "recruit") {
            const inParty = new Set(this.#party.map((member) => member.characterId));
            const pool = this.content.characters.filter((c) => c.kind === "general" && this.#unlockedCharacters.has(c.id) && !inParty.has(c.id));
            const candidate = contentId === "random" ? (pool.length > 0 ? this.#rng.recruit.pick(pool).id : undefined) : pool.find((c) => c.id === contentId)?.id;
            if (candidate === undefined || this.#party.length >= MAX_PARTY_SIZE || this.#recruited.length >= MAX_RECRUITS_PER_RUN) {
                this.dungeon.removeObject(objectId);
                return;
            }
            this.#pending.push({ kind: "recruit", characterId: candidate, objectId });
        }
    }
    #recruit(characterId, events) {
        this.#addMember(this.#character(characterId));
        this.#recruited.push(characterId);
        const member = this.#member(characterId);
        // A-16: late joiners get the trait picks they missed (AC-005-02 level sync is implicit: level is shared).
        if (!this.#clearAfterScenes)
            for (const level of TRAIT_LEVELS)
                if (level <= this.#level)
                    this.#pending.push({ kind: "trait", characterId, options: this.#traitOptions(member), level });
        events.push({ type: "recruited", characterId });
        this.#pushToDungeon();
    }
    #onDescended(events) {
        const plan = this.campaign.floors[this.#floorIndex];
        if (this.#floorIndex >= this.campaign.floors.length - 1) {
            this.#finishRun(events);
            return;
        }
        if (plan.safeZoneAfter) {
            this.#safeZone = true;
            for (const member of this.#party)
                member.hp = Math.max(member.hp, Math.round(this.#stats(member).maxHp * SAFE_ZONE_HEAL_RATIO));
            this.#shop = this.#generateShop();
            events.push({ type: "safe-zone" });
            return;
        }
        this.#enterFloor(this.#floorIndex + 1, events);
    }
    #generateShop() {
        const offers = [];
        for (let index = 0; index < SHOP_ITEM_OFFERS && this.campaign.shopItems.length > 0; index += 1) {
            const id = pickWeighted(this.#rng.shop, this.campaign.shopItems);
            offers.push({ kind: "item", contentId: id, price: this.#items.get(id).price, sold: false });
        }
        for (let index = 0; index < SHOP_EQUIPMENT_OFFERS && this.campaign.shopEquipment.length > 0; index += 1) {
            const id = pickWeighted(this.#rng.shop, this.campaign.shopEquipment);
            offers.push({ kind: "equipment", contentId: id, price: this.#equipment.get(id).price, sold: false });
        }
        return offers;
    }
    #applyEffect(effect, events) {
        switch (effect.kind) {
            case "gold":
                this.#gold = Math.max(0, this.#gold + effect.amount);
                break;
            case "food":
                this.#food = Math.max(0, Math.min(100, this.#food + effect.amount));
                break;
            case "heal":
                for (const member of this.#party)
                    if (member.hp > 0) {
                        const max = this.#stats(member).maxHp;
                        member.hp = Math.min(max, member.hp + Math.max(1, Math.round(max * effect.ratio)));
                    }
                break;
            case "damage":
                for (const member of this.#party)
                    if (member.hp > 0)
                        member.hp = Math.max(1, member.hp - Math.max(1, Math.round(this.#stats(member).maxHp * effect.ratio)));
                break;
            case "item":
            case "equipment": {
                const id = effect.kind === "item" ? effect.itemId : effect.equipmentId;
                events.push(this.#addToBag(id) ? { type: "picked-up", contentId: id } : { type: "bag-full", contentId: id });
                break;
            }
            case "exp":
                this.#gainExp(effect.amount, events);
                break;
        }
    }
    // ---------- traits / level ----------
    #traitOptions(member) {
        const character = this.#character(member.characterId);
        const owned = new Set(member.traits);
        const ownedTags = new Set(member.traits.flatMap((id) => this.#traits.get(id)?.tags ?? []));
        const unique = character.traitIds.filter((id) => !owned.has(id) && this.#traits.has(id));
        const common = this.content.traits.filter((trait) => trait.ownerId === undefined && !owned.has(trait.id) &&
            (trait.classes === undefined || trait.classes.includes(character.characterClass))).map((trait) => trait.id);
        const weight = (id) => (this.#traits.get(id).tags.some((tag) => ownedTags.has(tag)) ? TRAIT_RELATED_TAG_WEIGHT : 1);
        const options = [];
        for (let draw = 0; draw < TRAIT_OPTIONS; draw += 1) {
            const uniqueLeft = unique.filter((id) => !options.includes(id));
            const commonLeft = common.filter((id) => !options.includes(id));
            const useUnique = uniqueLeft.length > 0 && (commonLeft.length === 0 || this.#rng.traits.chance(TRAIT_UNIQUE_SHARE));
            const pool = useUnique ? uniqueLeft : commonLeft;
            if (pool.length === 0)
                break;
            options.push(pickWeighted(this.#rng.traits, pool.map((id) => ({ id, weight: weight(id) }))));
        }
        return options;
    }
    #gainExp(amount, events) {
        this.#exp += Math.max(0, Math.round(amount));
        while (this.#level < PARTY_LEVEL_CAP && this.#exp >= LEVEL_EXP_TABLE[this.#level]) {
            const before = this.#party.map((member) => this.#stats(member).maxHp);
            this.#level += 1;
            this.#party.forEach((member, index) => { if (member.hp > 0)
                member.hp += this.#stats(member).maxHp - before[index]; });
            events.push({ type: "level-up", level: this.#level });
            if (TRAIT_LEVELS.includes(this.#level)) {
                for (const member of this.#party) {
                    const options = this.#traitOptions(member);
                    if (options.length > 0)
                        this.#pending.push({ kind: "trait", characterId: member.characterId, options, level: this.#level });
                }
            }
        }
    }
    // ---------- scenes / pending flow ----------
    #queueScene(sceneId) {
        if (sceneId !== undefined && this.#scenes.has(sceneId))
            this.#pending.push({ kind: "scene", sceneId });
    }
    /** Called after a pending decision resolves: start a queued battle or finish the run once nothing is pending. */
    #afterDecision(events) {
        if (this.#pending.length > 0 || this.#ended !== null)
            return;
        if (this.#clearAfterScenes) {
            this.#clear(events);
            return;
        }
        const queued = this.#queued;
        if (queued !== null) {
            this.#queued = null;
            this.#launchBattle(queued, events);
        }
    }
    /** Campaign complete: drop leftover picks, play the outro (if any), then clear. */
    #finishRun(events) {
        for (let index = this.#pending.length - 1; index >= 0; index -= 1) {
            const kind = this.#pending[index].kind;
            if (kind !== "scene" && kind !== "recruit")
                this.#pending.splice(index, 1);
        }
        this.#queueScene(this.campaign.scenes?.outro);
        if (this.#pending.length === 0) {
            this.#clear(events);
            return;
        }
        this.#clearAfterScenes = true;
    }
    // ---------- battle ----------
    #startBattle(encounter, events) {
        const group = this.#groups.get(encounter.groupId);
        if (group === undefined)
            throw new Error("Unknown enemy group: " + encounter.groupId);
        const queued = { encounter, groupId: group.id, enemyHp: {}, enemyEnergy: 0 };
        const champion = group.duel === undefined ? undefined : group.units[group.duel.unitIndex];
        if (champion !== undefined && this.#party.some((member) => member.hp > 0)) {
            this.#encounter = encounter;
            this.#queued = queued;
            this.#pending.unshift({ kind: "duel", groupId: group.id, champion: champion.name });
            return;
        }
        this.#launchBattle(queued, events);
    }
    #launchBattle(queued, events) {
        const encounter = queued.encounter;
        const group = this.#groups.get(queued.groupId);
        const participants = [];
        const foodPenalty = this.#food <= 0;
        for (const member of this.#party) {
            const character = this.#character(member.characterId);
            const entryEnergy = foodPenalty ? 0 : Math.min(MAX_ENERGY, member.traits.reduce((sum, id) => sum + (this.#traits.get(id)?.effect.entryEnergy ?? 0), 0));
            participants.push({
                unit: { id: member.characterId, side: "ally", stats: this.#stats(member) }, slot: member.slot, basicAttackReach: character.reach,
                skillIds: this.#skillIds(member), entry: { hp: member.hp, energy: entryEnergy },
            });
        }
        group.units.forEach((unit, index) => {
            const maxHp = this.#enemyStats(unit.stats).maxHp;
            const energy = Math.min(MAX_ENERGY, (encounter.empowered ? SORCERY_ENEMY_ENERGY : 0) + queued.enemyEnergy);
            participants.push({
                unit: { id: encounter.enemyId + "#" + index, side: "enemy", stats: this.#enemyStats(unit.stats) }, slot: unit.slot, basicAttackReach: unit.reach,
                skillIds: unit.skillIds ?? [],
                entry: { hp: Math.max(1, Math.round(maxHp * encounter.enemyHpRatio * (queued.enemyHp[index] ?? 1))), energy },
            });
        });
        const battleItems = this.#bag.filter((entry) => entry.kind === "item" && this.#items.get(entry.itemId)?.battle !== undefined).map((entry) => entry.itemId);
        const phaseKey = group.id === encounter.groupId ? "" : "::" + group.id;
        const definition = {
            seed: String(this.#seed) + "::battle::" + this.#floorIndex + "::" + encounter.enemyId + "::" + this.#battles + phaseKey,
            participants,
            skills: this.content.skills,
            items: this.content.items.filter((item) => item.battle !== undefined).map((item) => item.battle),
            inventories: { ally: battleItems },
            retreatAllowed: encounter.retreatAllowed && group.id === encounter.groupId,
            ...(encounter.surprise === null || group.id !== encounter.groupId ? {} : { surprise: encounter.surprise }),
        };
        this.#battle = new BattleEngine(definition);
        this.#battleItemsAtStart = battleItems;
        this.#battleGroupId = group.id;
        this.#encounter = encounter;
        this.#repeat = new RepeatAutoController();
        this.#battles += 1;
        events.push({ type: "battle-started", encounter, groupName: group.name });
        this.#advanceBattle(events);
    }
    /** X8 명성: enemies grow stronger per renown level (SPD grows at a third of the rate to keep turn order readable). */
    #enemyStats(stats) {
        if (this.#renown === 0)
            return stats;
        const k = 1 + RENOWN_ENEMY_STEP * this.#renown;
        return {
            maxHp: Math.round(stats.maxHp * k), atk: Math.round(stats.atk * k), def: Math.round(stats.def * k),
            spd: Math.round(stats.spd * (1 + (k - 1) / 3)), int: Math.round(stats.int * k),
        };
    }
    /** X5 일기토: 1v1, both sides on Smart Auto (the player's decision is who answers the challenge). */
    #fightDuel(characterId, pending, events) {
        const queued = this.#queued;
        const group = this.#groups.get(pending.groupId);
        const index = group.duel.unitIndex;
        const unit = group.units[index];
        const member = this.#member(characterId);
        const character = this.#character(characterId);
        const enemyId = queued.encounter.enemyId + "#" + index;
        const duel = new BattleEngine({
            seed: String(this.#seed) + "::duel::" + this.#floorIndex + "::" + group.id + "::" + this.#battles,
            participants: [
                { unit: { id: characterId, side: "ally", stats: this.#stats(member) }, slot: "front-center", basicAttackReach: character.reach, skillIds: this.#skillIds(member), entry: { hp: member.hp, energy: 0 } },
                { unit: { id: enemyId, side: "enemy", stats: this.#enemyStats(unit.stats) }, slot: "front-center", basicAttackReach: unit.reach, skillIds: unit.skillIds ?? [], entry: { hp: Math.max(1, Math.round(this.#enemyStats(unit.stats).maxHp * queued.encounter.enemyHpRatio * DUEL_CHAMPION_HP_RATIO)), energy: 0 } },
            ],
            skills: this.content.skills,
            retreatAllowed: false,
        });
        for (let guard = 0; guard < 2000 && duel.outcome === "ongoing"; guard += 1) {
            if (duel.snapshot().activeTurn === null && duel.nextTurn() === null)
                break;
            duel.execute(chooseSmartCommand(duel));
        }
        const won = duel.outcome === "ally-victory";
        const after = duel.snapshot().units.find((candidate) => candidate.id === characterId);
        member.hp = won ? Math.max(1, after?.hp ?? 1) : 1;
        if (won)
            queued.enemyHp[index] = 1 - (group.duel.penalty ?? DUEL_DEFAULT_PENALTY);
        else
            queued.enemyEnergy = DUEL_LOSS_ENEMY_ENERGY;
        events.push({ type: "duel-ended", characterId, champion: pending.champion, won });
    }
    #advanceBattle(events) {
        const battle = this.#battle;
        if (battle === null)
            return;
        for (let guard = 0; guard < 5000; guard += 1) {
            if (battle.outcome !== "ongoing") {
                this.#finishBattle(events);
                return;
            }
            let active = battle.snapshot().activeTurn;
            if (active === null) {
                if (battle.nextTurn() === null) {
                    this.#finishBattle(events);
                    return;
                }
                active = battle.snapshot().activeTurn;
            }
            const isEnemy = active.actorId.includes("#");
            if (!isEnemy && this.#battleMode === "manual")
                return;
            const command = isEnemy ? chooseSmartCommand(battle)
                : this.#battleMode === "smart" ? chooseSmartCommand(battle)
                    : this.#battleMode === "all-attack" ? chooseAllAttackCommand(battle)
                        : this.#repeat.choose(battle);
            battle.execute(command);
        }
        throw new Error("Battle did not resolve within 5000 actions.");
    }
    #finishBattle(events) {
        const battle = this.#battle;
        const encounter = this.#encounter;
        const snapshot = battle.snapshot();
        const outcome = snapshot.outcome === "ally-victory" ? "victory" : snapshot.outcome === "ally-retreated" ? "retreat" : "defeat";
        for (const member of this.#party) {
            const unit = snapshot.units.find((candidate) => candidate.id === member.characterId);
            if (unit === undefined)
                continue;
            member.hp = unit.hp;
            if (unit.knockedOut && outcome === "victory")
                member.hp = Math.max(1, Math.round(this.#stats(member).maxHp * POST_BATTLE_KO_RECOVERY_RATIO));
        }
        // Consumed battle items leave the shared bag.
        const remaining = [...snapshot.inventories.ally];
        for (const itemId of this.#battleItemsAtStart) {
            const left = remaining.indexOf(itemId);
            if (left >= 0) {
                remaining.splice(left, 1);
                continue;
            }
            const entry = this.#bag.find((candidate) => candidate.kind === "item" && candidate.itemId === itemId);
            if (entry !== undefined)
                this.#takeFromBag(entry.uid);
        }
        const groupId = this.#battleGroupId ?? encounter.groupId;
        this.#battle = null;
        this.#battleGroupId = null;
        let exp = 0;
        let gold = 0;
        const loot = [];
        if (outcome === "victory") {
            const group = this.#groups.get(groupId);
            const ratio = encounter.reinforcement ? REINFORCEMENT_REWARD_RATIO : 1;
            const renownBonus = 1 + RENOWN_REWARD_STEP * this.#renown;
            exp = Math.round(group.exp * ratio * renownBonus);
            gold = Math.round(group.gold * ratio * renownBonus);
            this.#gold += gold;
            this.#defeatedGroups.add(group.id);
            if (group.loot !== undefined && group.loot.length > 0 && this.#rng.loot.chance((group.lootChance ?? 0.3) * ratio)) {
                const id = pickWeighted(this.#rng.loot, group.loot);
                loot.push(id);
            }
        }
        events.push({ type: "battle-ended", outcome, exp, gold, loot });
        for (const id of loot)
            events.push(this.#addToBag(id) ? { type: "picked-up", contentId: id } : { type: "bag-full", contentId: id });
        const group = this.#groups.get(groupId);
        const next = outcome === "victory" && group.nextPhase !== undefined ? this.#groups.get(group.nextPhase) : undefined;
        if (next !== undefined) {
            // X7: the boss rallies — the next phase starts after pending picks/scene, on the same encounter.
            if (exp > 0)
                this.#gainExp(exp, events);
            events.push({ type: "boss-phase", groupId: next.id, groupName: next.name });
            this.#queueScene(next.phaseScene);
            this.#queued = { encounter, groupId: next.id, enemyHp: {}, enemyEnergy: 0 };
            this.#afterDecision(events);
            return;
        }
        this.#encounter = null;
        const dungeonEvents = this.dungeon.resolveEncounter(outcome, this.#expedition());
        for (const event of dungeonEvents)
            events.push({ type: "dungeon", event });
        if (outcome === "defeat") {
            this.#fail("battle", events);
            return;
        }
        if (exp > 0)
            this.#gainExp(exp, events);
        if (outcome !== "victory")
            return;
        this.#queueScene(this.campaign.scenes?.bossDefeated?.[group.id]);
        this.#offerEnemyRecruit(group.recruit);
        if (encounter.boss && this.#floorIndex >= this.campaign.floors.length - 1)
            this.#finishRun(events);
    }
    /** X6 적장 등용: a defeated named general may offer to join (and is unlocked permanently via meta). */
    #offerEnemyRecruit(recruit) {
        if (recruit === undefined || !this.#characters.has(recruit.characterId))
            return;
        if (this.#party.some((member) => member.characterId === recruit.characterId) || this.#party.length >= MAX_PARTY_SIZE)
            return;
        if (!this.#rng.recruit.chance(recruit.chance))
            return;
        this.#pending.push({ kind: "recruit", characterId: recruit.characterId, objectId: "" });
    }
    #clear(events) {
        this.#ended = "cleared";
        events.push({ type: "run-cleared" });
    }
    #fail(cause, events) {
        this.#ended = "failed";
        events.push({ type: "run-failed", cause });
    }
}
//# sourceMappingURL=engine.js.map