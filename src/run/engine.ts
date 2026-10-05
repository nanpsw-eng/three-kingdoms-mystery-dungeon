import { chooseAllAttackCommand, chooseSmartCommand, RepeatAutoController } from "../battle/auto.js";
import { MAX_ENERGY, POST_BATTLE_KO_RECOVERY_RATIO } from "../battle/balance.js";
import { BattleEngine, type BattleCommand, type BattleDefinition, type BattleParticipantDefinition } from "../battle/battle.js";
import { FORMATION_SLOTS, type FormationSlot } from "../battle/formation.js";
import type { CoreStats } from "../battle/unit.js";
import { SeededRng, type Seed } from "../core/rng.js";
import { DungeonEngine, type DungeonCommand, type DungeonEvent, type Encounter, type ExpeditionMember } from "../dungeon/engine.js";
import { generateFloor, pickWeighted, type FloorSpec } from "../dungeon/floor.js";
import {
  ENHANCE_CAP,
  ENHANCE_COST_BASE,
  ENHANCE_STEP,
  IDENTIFY_COST,
  INVENTORY_SLOTS,
  LEVEL_EXP_TABLE,
  LEVEL_GROWTH,
  MAX_PARTY_SIZE,
  MAX_RECRUITS_PER_RUN,
  PARTY_LEVEL_CAP,
  REINFORCEMENT_REWARD_RATIO,
  SAFE_ZONE_HEAL_RATIO,
  SHOP_EQUIPMENT_OFFERS,
  SHOP_ITEM_OFFERS,
  SORCERY_ENEMY_ENERGY,
  STARTING_GENERALS,
  STARTING_GOLD,
  STARTING_ITEMS,
  TRAIT_LEVELS,
  TRAIT_OPTIONS,
  TRAIT_RELATED_TAG_WEIGHT,
  TRAIT_REROLLS_PER_RUN,
  TRAIT_UNIQUE_SHARE,
} from "./balance.js";
import type {
  CampaignDefinition,
  CharacterDefinition,
  ContentPack,
  EnemyGroupDefinition,
  EquipmentDefinition,
  EquipmentSlot,
  EventDefinition,
  ItemDefinition,
  MetaState,
  RunEffect,
  StatKey,
  TraitDefinition,
} from "./types.js";

export type BattleAutoMode = "manual" | "smart" | "all-attack" | "repeat";
export type RunPhase = "dungeon" | "battle" | "trait-choice" | "recruit" | "event" | "safe-zone" | "cleared" | "failed";

export interface EquipmentInstance {
  readonly uid: string;
  readonly equipmentId: string;
  readonly identified: boolean;
  readonly enhance: number;
}
export type InventoryEntry =
  | Readonly<{ uid: string; kind: "item"; itemId: string }>
  | Readonly<{ uid: string; kind: "equipment"; equipment: EquipmentInstance }>;

export interface MemberView {
  readonly characterId: string;
  readonly name: string;
  readonly hp: number;
  readonly maxHp: number;
  readonly stats: CoreStats;
  readonly traits: readonly string[];
  readonly equipment: Readonly<Partial<Record<EquipmentSlot, EquipmentInstance>>>;
  readonly slot: FormationSlot;
  readonly skillIds: readonly string[];
}

export interface PendingTraitChoice { readonly kind: "trait"; readonly characterId: string; readonly options: readonly string[]; readonly level: number; }
export interface PendingRecruit { readonly kind: "recruit"; readonly characterId: string; readonly objectId: string; }
export interface PendingEvent { readonly kind: "event"; readonly eventId: string; readonly objectId: string; }
export type PendingDecision = PendingTraitChoice | PendingRecruit | PendingEvent;

export interface ShopOffer { readonly kind: "item" | "equipment"; readonly contentId: string; readonly price: number; readonly sold: boolean; }

export type RunCommand =
  | Readonly<{ type: "dungeon"; command: DungeonCommand }>
  | Readonly<{ type: "auto-explore"; maxSteps?: number }>
  | Readonly<{ type: "use-item"; uid: string; targetId?: string }>
  | Readonly<{ type: "equip"; characterId: string; uid: string }>
  | Readonly<{ type: "unequip"; characterId: string; slot: EquipmentSlot }>
  | Readonly<{ type: "discard"; uid: string }>
  | Readonly<{ type: "set-formation"; characterId: string; slot: FormationSlot }>
  | Readonly<{ type: "battle-mode"; mode: BattleAutoMode }>
  | Readonly<{ type: "battle"; command: BattleCommand }>
  | Readonly<{ type: "choose-trait"; traitId: string }>
  | Readonly<{ type: "reroll-traits" }>
  | Readonly<{ type: "recruit"; accept: boolean }>
  | Readonly<{ type: "event-choice"; index: number }>
  | Readonly<{ type: "shop-buy"; offerIndex: number }>
  | Readonly<{ type: "identify"; uid: string }>
  | Readonly<{ type: "enhance"; characterId: string; slot: EquipmentSlot }>
  | Readonly<{ type: "leave-safe-zone" }>;

export type RunEvent =
  | Readonly<{ type: "dungeon"; event: DungeonEvent }>
  | Readonly<{ type: "floor-entered"; depth: number; modifier: string | null }>
  | Readonly<{ type: "battle-started"; encounter: Encounter; groupName: string }>
  | Readonly<{ type: "battle-ended"; outcome: "victory" | "retreat" | "defeat"; exp: number; gold: number; loot: readonly string[] }>
  | Readonly<{ type: "level-up"; level: number }>
  | Readonly<{ type: "trait-chosen"; characterId: string; traitId: string }>
  | Readonly<{ type: "recruited"; characterId: string }>
  | Readonly<{ type: "picked-up"; contentId: string }>
  | Readonly<{ type: "bag-full"; contentId: string }>
  | Readonly<{ type: "item-used"; itemId: string }>
  | Readonly<{ type: "equipped"; characterId: string; equipmentId: string }>
  | Readonly<{ type: "event-resolved"; eventId: string; choice: number }>
  | Readonly<{ type: "safe-zone" }>
  | Readonly<{ type: "purchased"; contentId: string }>
  | Readonly<{ type: "run-cleared" }>
  | Readonly<{ type: "run-failed"; cause: "battle" | "starvation" }>;

export interface RunOptions {
  readonly seed: Seed;
  readonly campaignId: string;
  readonly rulerId: string;
  readonly generalIds: readonly string[];
  readonly meta?: MetaState;
  readonly battleMode?: BattleAutoMode;
}

export interface RunSummary {
  readonly campaignId: string;
  readonly cleared: boolean;
  readonly depthReached: number;
  readonly defeatedGroups: readonly string[];
  readonly recruited: readonly string[];
  readonly itemsSeen: readonly string[];
  readonly level: number;
  readonly turns: number;
  readonly battles: number;
}

interface Member {
  characterId: string;
  hp: number;
  traits: string[];
  equipment: Partial<Record<EquipmentSlot, EquipmentInstance>>;
  slot: FormationSlot;
}

function byId<T extends { readonly id: string }>(items: readonly T[]): Map<string, T> {
  const map = new Map<string, T>();
  for (const item of items) {
    if (map.has(item.id)) throw new Error("Duplicate content id: " + item.id);
    map.set(item.id, item);
  }
  return map;
}

export class RunEngine {
  readonly content: ContentPack;
  readonly campaign: CampaignDefinition;
  readonly #characters: Map<string, CharacterDefinition>;
  readonly #traits: Map<string, TraitDefinition>;
  readonly #equipment: Map<string, EquipmentDefinition>;
  readonly #items: Map<string, ItemDefinition>;
  readonly #groups: Map<string, EnemyGroupDefinition>;
  readonly #events: Map<string, EventDefinition>;
  readonly #seed: Seed;
  readonly #rng: { traits: SeededRng; loot: SeededRng; shop: SeededRng; recruit: SeededRng; floors: SeededRng };
  readonly #unlockedCharacters: ReadonlySet<string>;
  readonly #party: Member[] = [];
  readonly #bag: InventoryEntry[] = [];
  readonly #pending: PendingDecision[] = [];
  readonly #defeatedGroups = new Set<string>();
  readonly #itemsSeen = new Set<string>();
  readonly #recruited: string[] = [];
  #uidSeq = 0;
  #floorIndex = 0;
  #dungeon: DungeonEngine | null = null;
  #battle: BattleEngine | null = null;
  #encounter: Encounter | null = null;
  #battleItemsAtStart: string[] = [];
  #repeat = new RepeatAutoController();
  #battleMode: BattleAutoMode;
  #exp = 0;
  #level = 1;
  #gold: number = STARTING_GOLD;
  #food = 100;
  #rerolls: number = TRAIT_REROLLS_PER_RUN;
  #safeZone = false;
  #shop: ShopOffer[] = [];
  #ended: "cleared" | "failed" | null = null;
  #turnsBeforeFloor = 0;
  #battles = 0;

  constructor(content: ContentPack, options: RunOptions) {
    this.content = content;
    this.#characters = byId(content.characters);
    this.#traits = byId(content.traits);
    this.#equipment = byId(content.equipment);
    this.#items = byId(content.items);
    this.#groups = byId(content.enemyGroups);
    this.#events = byId(content.events);
    const campaign = content.campaigns.find((candidate) => candidate.id === options.campaignId);
    if (campaign === undefined) throw new Error("Unknown campaign: " + options.campaignId);
    this.campaign = campaign;
    const unlockedCampaigns = new Set(options.meta?.unlockedCampaigns ?? content.startingUnlocks.campaigns);
    if (!unlockedCampaigns.has(campaign.id)) throw new Error("Campaign is locked: " + campaign.id);
    this.#unlockedCharacters = new Set(options.meta?.unlockedCharacters ?? content.startingUnlocks.characters);
    const ruler = this.#character(options.rulerId);
    if (ruler.kind !== "ruler") throw new Error("Not a ruler: " + ruler.id);
    if (options.generalIds.length !== STARTING_GENERALS || new Set(options.generalIds).size !== STARTING_GENERALS) {
      throw new RangeError("Start requires exactly " + STARTING_GENERALS + " distinct generals.");
    }
    for (const id of [ruler.id, ...options.generalIds]) {
      if (!this.#unlockedCharacters.has(id)) throw new Error("Character is locked: " + id);
      const character = this.#character(id);
      if (id !== ruler.id && character.kind !== "general") throw new Error("Not a general: " + id);
      this.#addMember(character);
    }
    this.#seed = options.seed;
    const root = new SeededRng(options.seed).fork("run");
    this.#rng = { traits: root.fork("traits"), loot: root.fork("loot"), shop: root.fork("shop"), recruit: root.fork("recruit"), floors: root.fork("floors") };
    this.#battleMode = options.battleMode ?? "manual";
    for (const itemId of STARTING_ITEMS) if (this.#items.has(itemId)) this.#addToBag(itemId);
    const startLevel = Math.min(PARTY_LEVEL_CAP, Math.max(1, campaign.startLevel ?? 1));
    if (startLevel > 1) {
      this.#level = startLevel;
      this.#exp = LEVEL_EXP_TABLE[startLevel - 1]!;
      for (const member of this.#party) {
        member.hp = this.#stats(member).maxHp;
        for (const level of TRAIT_LEVELS) if (level <= startLevel) this.#pending.push({ kind: "trait", characterId: member.characterId, options: this.#traitOptions(member), level });
      }
    }
    this.#enterFloor(0, []);
  }

  // ---------- queries ----------
  get phase(): RunPhase {
    if (this.#ended !== null) return this.#ended;
    if (this.#battle !== null) return "battle";
    const next = this.#pending[0];
    if (next !== undefined) return next.kind === "trait" ? "trait-choice" : next.kind;
    if (this.#safeZone) return "safe-zone";
    return "dungeon";
  }
  get level(): number { return this.#level; }
  get exp(): number { return this.#exp; }
  get gold(): number { return this.#gold; }
  get food(): number { return this.#food; }
  get rerolls(): number { return this.#rerolls; }
  get depth(): number { return this.campaign.floors[this.#floorIndex]!.depth; }
  get floorIndex(): number { return this.#floorIndex; }
  get battleMode(): BattleAutoMode { return this.#battleMode; }
  get dungeon(): DungeonEngine { if (this.#dungeon === null) throw new Error("No active floor."); return this.#dungeon; }
  get battle(): BattleEngine | null { return this.#battle; }
  get encounter(): Encounter | null { return this.#encounter; }
  pending(): readonly PendingDecision[] { return [...this.#pending]; }
  inventory(): readonly InventoryEntry[] { return [...this.#bag]; }
  shop(): readonly ShopOffer[] { return [...this.#shop]; }
  character(id: string): CharacterDefinition { return this.#character(id); }
  trait(id: string): TraitDefinition { const trait = this.#traits.get(id); if (!trait) throw new Error("Unknown trait: " + id); return trait; }
  item(id: string): ItemDefinition | undefined { return this.#items.get(id); }
  equipmentDef(id: string): EquipmentDefinition | undefined { return this.#equipment.get(id); }
  group(id: string): EnemyGroupDefinition | undefined { return this.#groups.get(id); }
  event(id: string): EventDefinition | undefined { return this.#events.get(id); }

  party(): readonly MemberView[] {
    return this.#party.map((member) => {
      const character = this.#character(member.characterId);
      const stats = this.#stats(member);
      return {
        characterId: member.characterId, name: character.name, hp: member.hp, maxHp: stats.maxHp, stats,
        traits: [...member.traits], equipment: { ...member.equipment }, slot: member.slot, skillIds: this.#skillIds(member),
      };
    });
  }

  summary(): RunSummary {
    return {
      campaignId: this.campaign.id, cleared: this.#ended === "cleared", depthReached: this.depth,
      defeatedGroups: [...this.#defeatedGroups].sort(), recruited: [...this.#recruited], itemsSeen: [...this.#itemsSeen].sort(),
      level: this.#level, turns: this.#turnsBeforeFloor + (this.#dungeon?.turn ?? 0), battles: this.#battles,
    };
  }

  stateHash(): string {
    const json = JSON.stringify({
      floor: this.#floorIndex, level: this.#level, exp: this.#exp, gold: this.#gold, food: this.#food, rerolls: this.#rerolls,
      party: this.#party, bag: this.#bag, pending: this.#pending, safe: this.#safeZone, shop: this.#shop, ended: this.#ended,
      dungeon: this.#dungeon?.stateHash() ?? null, battle: this.#battle?.stateHash() ?? null,
      rng: Object.values(this.#rng).map((rng) => rng.snapshot()),
    });
    let hash = 0x811c9dc5;
    for (let index = 0; index < json.length; index += 1) { hash ^= json.charCodeAt(index); hash = Math.imul(hash, 0x01000193); }
    return (hash >>> 0).toString(16).padStart(8, "0");
  }

  // ---------- commands ----------
  act(command: RunCommand): RunEvent[] {
    const events: RunEvent[] = [];
    const phase = this.phase;
    if (phase === "cleared" || phase === "failed") throw new Error("Run has ended: " + phase);
    switch (command.type) {
      case "battle-mode":
        this.#battleMode = command.mode;
        if (phase === "battle") this.#advanceBattle(events);
        return events;
      case "set-formation":
        this.#requirePhase(phase, ["dungeon", "safe-zone", "trait-choice", "recruit", "event"]);
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
        const battle = this.#battle!;
        battle.execute(command.command);
        this.#repeat.record(command.command);
        this.#advanceBattle(events);
        return events;
      }
      case "choose-trait": {
        this.#requirePhase(phase, ["trait-choice"]);
        const choice = this.#pending[0] as PendingTraitChoice;
        if (!choice.options.includes(command.traitId)) throw new Error("Trait not offered: " + command.traitId);
        this.#member(choice.characterId).traits.push(command.traitId);
        this.#pending.shift();
        events.push({ type: "trait-chosen", characterId: choice.characterId, traitId: command.traitId });
        this.#clampHp();
        return events;
      }
      case "reroll-traits": {
        this.#requirePhase(phase, ["trait-choice"]);
        if (this.#rerolls <= 0) throw new Error("No trait rerolls left.");
        const choice = this.#pending[0] as PendingTraitChoice;
        this.#rerolls -= 1;
        this.#pending[0] = { ...choice, options: this.#traitOptions(this.#member(choice.characterId)) };
        return events;
      }
      case "recruit": {
        this.#requirePhase(phase, ["recruit"]);
        const offer = this.#pending.shift() as PendingRecruit;
        this.dungeon.removeObject(offer.objectId);
        if (command.accept) this.#recruit(offer.characterId, events);
        return events;
      }
      case "event-choice": {
        this.#requirePhase(phase, ["event"]);
        const pending = this.#pending[0] as PendingEvent;
        const definition = this.#events.get(pending.eventId)!;
        const choice = definition.choices[command.index];
        if (choice === undefined) throw new RangeError("Invalid event choice.");
        this.#pending.shift();
        this.dungeon.removeObject(pending.objectId);
        for (const effect of choice.effects) this.#applyEffect(effect, events);
        events.push({ type: "event-resolved", eventId: pending.eventId, choice: command.index });
        this.#pushToDungeon();
        return events;
      }
      case "shop-buy": {
        this.#requirePhase(phase, ["safe-zone"]);
        const offer = this.#shop[command.offerIndex];
        if (offer === undefined || offer.sold) throw new Error("Offer unavailable.");
        if (this.#gold < offer.price) throw new Error("Not enough gold.");
        if (this.#bag.length >= INVENTORY_SLOTS) throw new Error("Inventory is full.");
        this.#gold -= offer.price;
        this.#shop[command.offerIndex] = { ...offer, sold: true };
        this.#addToBag(offer.contentId, true);
        events.push({ type: "purchased", contentId: offer.contentId });
        return events;
      }
      case "identify": {
        this.#requirePhase(phase, ["safe-zone"]);
        if (this.#gold < IDENTIFY_COST) throw new Error("Not enough gold.");
        if (!this.#identify(command.uid)) throw new Error("Nothing to identify: " + command.uid);
        this.#gold -= IDENTIFY_COST;
        return events;
      }
      case "enhance": {
        this.#requirePhase(phase, ["safe-zone"]);
        const member = this.#member(command.characterId);
        const instance = member.equipment[command.slot];
        if (instance === undefined) throw new Error("Nothing equipped in " + command.slot);
        if (instance.enhance >= ENHANCE_CAP) throw new Error("Enhancement cap reached.");
        const cost = ENHANCE_COST_BASE * (instance.enhance + 1);
        if (this.#gold < cost) throw new Error("Not enough gold.");
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
  #character(id: string): CharacterDefinition {
    const character = this.#characters.get(id);
    if (character === undefined) throw new Error("Unknown character: " + id);
    return character;
  }
  #member(id: string): Member {
    const member = this.#party.find((candidate) => candidate.characterId === id);
    if (member === undefined) throw new Error("Not in party: " + id);
    return member;
  }
  #requirePhase(phase: RunPhase, allowed: readonly RunPhase[]): void {
    if (!allowed.includes(phase)) throw new Error("Command not allowed in phase: " + phase);
  }

  #addMember(character: CharacterDefinition): void {
    if (this.#party.length >= MAX_PARTY_SIZE) throw new Error("Party is full.");
    const taken = new Set(this.#party.map((member) => member.slot));
    const slot = taken.has(character.defaultSlot) ? FORMATION_SLOTS.find((candidate) => !taken.has(candidate))! : character.defaultSlot;
    const member: Member = { characterId: character.id, hp: 0, traits: [], equipment: {}, slot };
    this.#party.push(member);
    member.hp = this.#stats(member).maxHp;
  }

  #stats(member: Member): CoreStats {
    const base = this.#character(member.characterId).stats;
    const percent: Record<StatKey, number> = { maxHp: 0, atk: 0, def: 0, spd: 0, int: 0 };
    for (const traitId of member.traits) {
      for (const [key, value] of Object.entries(this.#traits.get(traitId)?.effect.statPercent ?? {})) percent[key as StatKey] += value ?? 0;
    }
    const flat: Record<StatKey, number> = { maxHp: 0, atk: 0, def: 0, spd: 0, int: 0 };
    for (const instance of Object.values(member.equipment)) {
      if (instance === undefined) continue;
      const definition = this.#equipment.get(instance.equipmentId);
      for (const [key, value] of Object.entries(definition?.stats ?? {})) {
        const amount = value ?? 0;
        flat[key as StatKey] += amount + instance.enhance * Math.sign(amount) * Math.max(1, Math.round(Math.abs(amount) * ENHANCE_STEP));
      }
    }
    const result = {} as Record<StatKey, number>;
    for (const key of ["maxHp", "atk", "def", "spd", "int"] as const) {
      const grown = base[key] * (1 + LEVEL_GROWTH[key] * (this.#level - 1));
      result[key] = Math.max(1, Math.round((grown + flat[key]) * (1 + percent[key])));
    }
    return result;
  }

  #skillIds(member: Member): string[] {
    const ids = [...this.#character(member.characterId).skillIds];
    for (const traitId of member.traits) {
      const granted = this.#traits.get(traitId)?.effect.grantSkillId;
      if (granted !== undefined && !ids.includes(granted)) ids.push(granted);
    }
    // Keep the ally loadout limit: newest actives replace the oldest when over 3.
    const skills = new Map(this.content.skills.map((skill) => [skill.id, skill]));
    const actives = ids.filter((id) => skills.get(id)?.kind === "active");
    const ultimates = ids.filter((id) => skills.get(id)?.kind === "ultimate");
    return [...actives.slice(-3), ...ultimates.slice(-1)];
  }

  #clampHp(): void {
    for (const member of this.#party) member.hp = Math.min(member.hp, this.#stats(member).maxHp);
  }

  #setFormation(characterId: string, slot: FormationSlot): void {
    const member = this.#member(characterId);
    const occupant = this.#party.find((candidate) => candidate.slot === slot);
    if (occupant !== undefined) occupant.slot = member.slot;
    member.slot = slot;
  }

  #expedition(): ExpeditionMember[] {
    return this.#party.map((member) => ({ id: member.characterId, maxHp: this.#stats(member).maxHp, hp: member.hp }));
  }
  #pushToDungeon(): void {
    if (this.#dungeon === null) return;
    this.#dungeon.setParty(this.#expedition());
    this.#dungeon.setFood(this.#food);
  }
  #pullFromDungeon(): void {
    if (this.#dungeon === null) return;
    for (const vitals of this.#dungeon.party()) {
      const member = this.#party.find((candidate) => candidate.characterId === vitals.id);
      if (member !== undefined) member.hp = vitals.hp;
    }
    this.#food = this.#dungeon.food;
  }

  // ---------- inventory ----------
  #newUid(): string { return "u" + this.#uidSeq++; }
  #addToBag(contentId: string, identified = false): boolean {
    if (this.#bag.length >= INVENTORY_SLOTS) return false;
    this.#itemsSeen.add(contentId);
    if (this.#items.has(contentId)) { this.#bag.push({ uid: this.#newUid(), kind: "item", itemId: contentId }); return true; }
    const definition = this.#equipment.get(contentId);
    if (definition === undefined) throw new Error("Unknown item or equipment: " + contentId);
    this.#bag.push({ uid: this.#newUid(), kind: "equipment", equipment: { uid: this.#newUid(), equipmentId: contentId, identified: identified || !definition.unidentified, enhance: 0 } });
    return true;
  }
  #takeFromBag(uid: string): InventoryEntry {
    const index = this.#bag.findIndex((entry) => entry.uid === uid);
    if (index < 0) throw new Error("Not in inventory: " + uid);
    return this.#bag.splice(index, 1)[0]!;
  }
  #identify(uid: string): boolean {
    const index = this.#bag.findIndex((entry) => entry.uid === uid && entry.kind === "equipment" && !entry.equipment.identified);
    if (index >= 0) {
      const entry = this.#bag[index] as Extract<InventoryEntry, { kind: "equipment" }>;
      this.#bag[index] = { ...entry, equipment: { ...entry.equipment, identified: true } };
      return true;
    }
    for (const member of this.#party) {
      for (const slot of ["weapon", "armor", "treasure"] as const) {
        const instance = member.equipment[slot];
        if (instance !== undefined && instance.uid === uid && !instance.identified) { member.equipment[slot] = { ...instance, identified: true }; return true; }
      }
    }
    return false;
  }

  #spendDungeonTurn(events: RunEvent[], reason: "item" | "equipment"): void {
    this.#pushToDungeon();
    this.#dungeonStep(this.dungeon.execute({ type: "spend-turn", reason }).events, events);
  }

  #useItem(uid: string, targetId: string | undefined, events: RunEvent[], spendsTurn: boolean): void {
    const entry = this.#bag.find((candidate) => candidate.uid === uid);
    if (entry === undefined || entry.kind !== "item") throw new Error("Not a usable item: " + uid);
    const item = this.#items.get(entry.itemId)!;
    const healBonus = (member: Member): number => member.traits.reduce((sum, id) => sum + (this.#traits.get(id)?.effect.healItemBonus ?? 0), 0);
    switch (item.use.kind) {
      case "food":
        this.#food = Math.min(100, this.#food + item.use.amount);
        break;
      case "heal": {
        const ratio = item.use.ratio;
        const targets = item.use.target === "party" ? this.#party.filter((m) => m.hp > 0) : [this.#member(targetId ?? this.#party.find((m) => m.hp > 0)!.characterId)];
        if (targets.some((m) => m.hp <= 0)) throw new Error("Healing items cannot revive KO members.");
        for (const member of targets) {
          const max = this.#stats(member).maxHp;
          member.hp = Math.min(max, member.hp + Math.max(1, Math.round(max * ratio * (1 + healBonus(member)))));
        }
        break;
      }
      case "treat": {
        const member = this.#member(targetId ?? this.#party.find((m) => m.hp <= 0)?.characterId ?? "");
        if (member.hp > 0) throw new Error("Treatment requires a KO member.");
        member.hp = Math.max(1, Math.round(this.#stats(member).maxHp * item.use.ratio));
        break;
      }
      case "identify":
        if (targetId === undefined || !this.#identify(targetId)) throw new Error("Identify needs an unidentified equipment uid.");
        break;
      case "reveal-traps":
        this.dungeon.revealAllTraps();
        break;
      case "battle":
        throw new Error("Battle items can only be used in battle.");
    }
    this.#takeFromBag(uid);
    events.push({ type: "item-used", itemId: item.id });
    if (spendsTurn) this.#spendDungeonTurn(events, "item");
    else this.#pushToDungeon();
  }

  #equip(characterId: string, uid: string, events: RunEvent[], spendsTurn: boolean): void {
    const member = this.#member(characterId);
    const entry = this.#bag.find((candidate) => candidate.uid === uid);
    if (entry === undefined || entry.kind !== "equipment") throw new Error("Not equipment: " + uid);
    const definition = this.#equipment.get(entry.equipment.equipmentId)!;
    this.#takeFromBag(uid);
    const previous = member.equipment[definition.slot];
    if (previous !== undefined) this.#bag.push({ uid: this.#newUid(), kind: "equipment", equipment: previous });
    member.equipment[definition.slot] = { ...entry.equipment, identified: true };
    this.#clampHp();
    events.push({ type: "equipped", characterId, equipmentId: definition.id });
    if (spendsTurn) this.#spendDungeonTurn(events, "equipment");
    else this.#pushToDungeon();
  }

  #unequip(characterId: string, slot: EquipmentSlot, events: RunEvent[], spendsTurn: boolean): void {
    const member = this.#member(characterId);
    const instance = member.equipment[slot];
    if (instance === undefined) throw new Error("Nothing equipped.");
    if (this.#bag.length >= INVENTORY_SLOTS) throw new Error("Inventory is full.");
    delete member.equipment[slot];
    this.#bag.push({ uid: this.#newUid(), kind: "equipment", equipment: instance });
    this.#clampHp();
    if (spendsTurn) this.#spendDungeonTurn(events, "equipment");
    else this.#pushToDungeon();
  }

  // ---------- floors / dungeon ----------
  #enterFloor(index: number, events: RunEvent[]): void {
    if (this.#dungeon !== null) this.#turnsBeforeFloor += this.#dungeon.turn;
    this.#floorIndex = index;
    const plan = this.campaign.floors[index]!;
    const floorRng = this.#rng.floors.fork("floor-" + index);
    const modifier = plan.modifiers !== undefined && plan.modifiers.length > 0 && floorRng.chance(plan.modifierChance ?? 0) ? pickWeighted(floorRng, plan.modifiers) : undefined;
    const spec: FloorSpec = {
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
      },
    };
    const floor = generateFloor(spec);
    const passive = Math.max(0, ...this.#party.flatMap((member) => member.traits.map((id) => this.#traits.get(id)?.effect.passiveTrapDetection ?? 0)));
    this.#dungeon = new DungeonEngine(floor, {
      seed: String(this.#seed) + "::" + this.campaign.id, party: this.#expedition(), food: this.#food,
      passiveTrapDetection: passive, reinforcementGroups: plan.enemyGroups,
    });
    events.push({ type: "floor-entered", depth: plan.depth, modifier: floor.modifier });
  }

  #dungeonStep(dungeonEvents: readonly DungeonEvent[], events: RunEvent[]): void {
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
          if (this.#battle === null) this.#fail("starvation", events);
          break;
        default:
          break;
      }
    }
  }

  #onObject(objectId: string, kind: string, contentId: string, events: RunEvent[]): void {
    if (this.#pending.some((decision) => decision.kind !== "trait" && decision.objectId === objectId)) return;
    if (kind === "item") {
      if (this.#addToBag(contentId)) { this.dungeon.removeObject(objectId); events.push({ type: "picked-up", contentId }); }
      else events.push({ type: "bag-full", contentId });
      return;
    }
    if (kind === "event") { this.#pending.push({ kind: "event", eventId: contentId, objectId }); return; }
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

  #recruit(characterId: string, events: RunEvent[]): void {
    this.#addMember(this.#character(characterId));
    this.#recruited.push(characterId);
    const member = this.#member(characterId);
    // A-16: late joiners get the trait picks they missed (AC-005-02 level sync is implicit: level is shared).
    for (const level of TRAIT_LEVELS) if (level <= this.#level) this.#pending.push({ kind: "trait", characterId, options: this.#traitOptions(member), level });
    events.push({ type: "recruited", characterId });
    this.#pushToDungeon();
  }

  #onDescended(events: RunEvent[]): void {
    const plan = this.campaign.floors[this.#floorIndex]!;
    if (this.#floorIndex >= this.campaign.floors.length - 1) { this.#clear(events); return; }
    if (plan.safeZoneAfter) {
      this.#safeZone = true;
      for (const member of this.#party) member.hp = Math.max(member.hp, Math.round(this.#stats(member).maxHp * SAFE_ZONE_HEAL_RATIO));
      this.#shop = this.#generateShop();
      events.push({ type: "safe-zone" });
      return;
    }
    this.#enterFloor(this.#floorIndex + 1, events);
  }

  #generateShop(): ShopOffer[] {
    const offers: ShopOffer[] = [];
    for (let index = 0; index < SHOP_ITEM_OFFERS && this.campaign.shopItems.length > 0; index += 1) {
      const id = pickWeighted(this.#rng.shop, this.campaign.shopItems);
      offers.push({ kind: "item", contentId: id, price: this.#items.get(id)!.price, sold: false });
    }
    for (let index = 0; index < SHOP_EQUIPMENT_OFFERS && this.campaign.shopEquipment.length > 0; index += 1) {
      const id = pickWeighted(this.#rng.shop, this.campaign.shopEquipment);
      offers.push({ kind: "equipment", contentId: id, price: this.#equipment.get(id)!.price, sold: false });
    }
    return offers;
  }

  #applyEffect(effect: RunEffect, events: RunEvent[]): void {
    switch (effect.kind) {
      case "gold": this.#gold = Math.max(0, this.#gold + effect.amount); break;
      case "food": this.#food = Math.max(0, Math.min(100, this.#food + effect.amount)); break;
      case "heal":
        for (const member of this.#party) if (member.hp > 0) { const max = this.#stats(member).maxHp; member.hp = Math.min(max, member.hp + Math.max(1, Math.round(max * effect.ratio))); }
        break;
      case "damage":
        for (const member of this.#party) if (member.hp > 0) member.hp = Math.max(1, member.hp - Math.max(1, Math.round(this.#stats(member).maxHp * effect.ratio)));
        break;
      case "item":
      case "equipment": {
        const id = effect.kind === "item" ? effect.itemId : effect.equipmentId;
        events.push(this.#addToBag(id) ? { type: "picked-up", contentId: id } : { type: "bag-full", contentId: id });
        break;
      }
      case "exp": this.#gainExp(effect.amount, events); break;
    }
  }

  // ---------- traits / level ----------
  #traitOptions(member: Member): string[] {
    const character = this.#character(member.characterId);
    const owned = new Set(member.traits);
    const ownedTags = new Set(member.traits.flatMap((id) => this.#traits.get(id)?.tags ?? []));
    const unique = character.traitIds.filter((id) => !owned.has(id) && this.#traits.has(id));
    const common = this.content.traits.filter((trait) => trait.ownerId === undefined && !owned.has(trait.id) &&
      (trait.classes === undefined || trait.classes.includes(character.characterClass))).map((trait) => trait.id);
    const weight = (id: string): number => (this.#traits.get(id)!.tags.some((tag) => ownedTags.has(tag)) ? TRAIT_RELATED_TAG_WEIGHT : 1);
    const options: string[] = [];
    for (let draw = 0; draw < TRAIT_OPTIONS; draw += 1) {
      const uniqueLeft = unique.filter((id) => !options.includes(id));
      const commonLeft = common.filter((id) => !options.includes(id));
      const useUnique = uniqueLeft.length > 0 && (commonLeft.length === 0 || this.#rng.traits.chance(TRAIT_UNIQUE_SHARE));
      const pool = useUnique ? uniqueLeft : commonLeft;
      if (pool.length === 0) break;
      options.push(pickWeighted(this.#rng.traits, pool.map((id) => ({ id, weight: weight(id) }))));
    }
    return options;
  }

  #gainExp(amount: number, events: RunEvent[]): void {
    this.#exp += Math.max(0, Math.round(amount));
    while (this.#level < PARTY_LEVEL_CAP && this.#exp >= LEVEL_EXP_TABLE[this.#level]!) {
      const before = this.#party.map((member) => this.#stats(member).maxHp);
      this.#level += 1;
      this.#party.forEach((member, index) => { if (member.hp > 0) member.hp += this.#stats(member).maxHp - before[index]!; });
      events.push({ type: "level-up", level: this.#level });
      if (TRAIT_LEVELS.includes(this.#level)) {
        for (const member of this.#party) {
          const options = this.#traitOptions(member);
          if (options.length > 0) this.#pending.push({ kind: "trait", characterId: member.characterId, options, level: this.#level });
        }
      }
    }
  }

  // ---------- battle ----------
  #startBattle(encounter: Encounter, events: RunEvent[]): void {
    const group = this.#groups.get(encounter.groupId);
    if (group === undefined) throw new Error("Unknown enemy group: " + encounter.groupId);
    const participants: BattleParticipantDefinition[] = [];
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
      const maxHp = unit.stats.maxHp;
      participants.push({
        unit: { id: encounter.enemyId + "#" + index, side: "enemy", stats: unit.stats }, slot: unit.slot, basicAttackReach: unit.reach,
        skillIds: unit.skillIds ?? [],
        entry: { hp: Math.max(1, Math.round(maxHp * encounter.enemyHpRatio)), energy: encounter.empowered ? SORCERY_ENEMY_ENERGY : 0 },
      });
    });
    const battleItems = this.#bag.filter((entry): entry is Extract<InventoryEntry, { kind: "item" }> => entry.kind === "item" && this.#items.get(entry.itemId)?.battle !== undefined).map((entry) => entry.itemId);
    const definition: BattleDefinition = {
      seed: String(this.#seed) + "::battle::" + this.#floorIndex + "::" + encounter.enemyId + "::" + this.#battles,
      participants,
      skills: this.content.skills,
      items: this.content.items.filter((item) => item.battle !== undefined).map((item) => item.battle!),
      inventories: { ally: battleItems },
      retreatAllowed: encounter.retreatAllowed,
      ...(encounter.surprise === null ? {} : { surprise: encounter.surprise }),
    };
    this.#battle = new BattleEngine(definition);
    this.#battleItemsAtStart = battleItems;
    this.#encounter = encounter;
    this.#repeat = new RepeatAutoController();
    this.#battles += 1;
    events.push({ type: "battle-started", encounter, groupName: group.name });
    this.#advanceBattle(events);
  }

  #advanceBattle(events: RunEvent[]): void {
    const battle = this.#battle;
    if (battle === null) return;
    for (let guard = 0; guard < 5000; guard += 1) {
      if (battle.outcome !== "ongoing") { this.#finishBattle(events); return; }
      let active = battle.snapshot().activeTurn;
      if (active === null) {
        if (battle.nextTurn() === null) { this.#finishBattle(events); return; }
        active = battle.snapshot().activeTurn!;
      }
      const isEnemy = active.actorId.includes("#");
      if (!isEnemy && this.#battleMode === "manual") return;
      const command = isEnemy ? chooseSmartCommand(battle)
        : this.#battleMode === "smart" ? chooseSmartCommand(battle)
        : this.#battleMode === "all-attack" ? chooseAllAttackCommand(battle)
        : this.#repeat.choose(battle);
      battle.execute(command);
    }
    throw new Error("Battle did not resolve within 5000 actions.");
  }

  #finishBattle(events: RunEvent[]): void {
    const battle = this.#battle!;
    const encounter = this.#encounter!;
    const snapshot = battle.snapshot();
    const outcome = snapshot.outcome === "ally-victory" ? "victory" : snapshot.outcome === "ally-retreated" ? "retreat" : "defeat";
    for (const member of this.#party) {
      const unit = snapshot.units.find((candidate) => candidate.id === member.characterId);
      if (unit === undefined) continue;
      member.hp = unit.hp;
      if (unit.knockedOut && outcome === "victory") member.hp = Math.max(1, Math.round(this.#stats(member).maxHp * POST_BATTLE_KO_RECOVERY_RATIO));
    }
    // Consumed battle items leave the shared bag.
    const remaining = [...snapshot.inventories.ally];
    for (const itemId of this.#battleItemsAtStart) {
      const left = remaining.indexOf(itemId);
      if (left >= 0) { remaining.splice(left, 1); continue; }
      const entry = this.#bag.find((candidate) => candidate.kind === "item" && candidate.itemId === itemId);
      if (entry !== undefined) this.#takeFromBag(entry.uid);
    }
    this.#battle = null;
    this.#encounter = null;
    let exp = 0;
    let gold = 0;
    const loot: string[] = [];
    if (outcome === "victory") {
      const group = this.#groups.get(encounter.groupId)!;
      const ratio = encounter.reinforcement ? REINFORCEMENT_REWARD_RATIO : 1;
      exp = Math.round(group.exp * ratio);
      gold = Math.round(group.gold * ratio);
      this.#gold += gold;
      this.#defeatedGroups.add(group.id);
      if (group.loot !== undefined && group.loot.length > 0 && this.#rng.loot.chance((group.lootChance ?? 0.3) * ratio)) {
        const id = pickWeighted(this.#rng.loot, group.loot);
        loot.push(id);
      }
    }
    events.push({ type: "battle-ended", outcome, exp, gold, loot });
    for (const id of loot) events.push(this.#addToBag(id) ? { type: "picked-up", contentId: id } : { type: "bag-full", contentId: id });
    const dungeonEvents = this.dungeon.resolveEncounter(outcome, this.#expedition());
    for (const event of dungeonEvents) events.push({ type: "dungeon", event });
    if (outcome === "defeat") { this.#fail("battle", events); return; }
    if (exp > 0) this.#gainExp(exp, events);
    if (encounter.boss && this.#floorIndex >= this.campaign.floors.length - 1) this.#clear(events);
  }

  #clear(events: RunEvent[]): void {
    this.#ended = "cleared";
    events.push({ type: "run-cleared" });
  }
  #fail(cause: "battle" | "starvation", events: RunEvent[]): void {
    this.#ended = "failed";
    events.push({ type: "run-failed", cause });
  }
}
