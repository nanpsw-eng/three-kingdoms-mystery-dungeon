import type { BattleItemDefinition, SkillDefinition } from "../battle/action.js";
import type { BasicAttackReach } from "../battle/battle.js";
import type { FormationSlot } from "../battle/formation.js";
import type { CoreStats } from "../battle/unit.js";
import type { FloorModifier, FloorObjectSpec, TrapType, Weighted } from "../dungeon/floor.js";

export type CharacterClass = "infantry" | "cavalry" | "archer" | "strategist" | "support";
export type StatKey = keyof CoreStats;
export type EquipmentSlot = "weapon" | "armor" | "treasure";

export interface CharacterDefinition {
  readonly id: string;
  readonly name: string;
  readonly kind: "ruler" | "general";
  readonly characterClass: CharacterClass;
  readonly roleTags: readonly string[];
  readonly stats: CoreStats;
  readonly reach: BasicAttackReach;
  /** Starting loadout: up to 3 actives + 1 ultimate (validated by the battle engine). */
  readonly skillIds: readonly string[];
  /** Unique trait pool (~70-80% of offers). */
  readonly traitIds: readonly string[];
  readonly defaultSlot: FormationSlot;
}

/** Data-driven trait effect. Percent values are fractions (0.1 = +10%). */
export interface TraitEffect {
  readonly statPercent?: Partial<Record<StatKey, number>>;
  readonly entryEnergy?: number;
  /** Replaces/extends the loadout with a skill (must keep loadout limits). */
  readonly grantSkillId?: string;
  readonly passiveTrapDetection?: number;
  /** Party-wide: extra natural/healing item efficiency etc. are expressed as multipliers here. */
  readonly healItemBonus?: number;
}

export interface TraitDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly tags: readonly string[];
  /** Unique traits name their owner; common traits list eligible classes/roles. */
  readonly ownerId?: string;
  readonly classes?: readonly CharacterClass[];
  readonly effect: TraitEffect;
}

export interface EquipmentDefinition {
  readonly id: string;
  readonly name: string;
  readonly slot: EquipmentSlot;
  readonly stats: Partial<Record<StatKey, number>>;
  readonly price: number;
  /** Generated unidentified (stats hidden until identified or equipped). */
  readonly unidentified?: boolean;
}

export type ItemUse =
  | Readonly<{ kind: "food"; amount: number }>
  | Readonly<{ kind: "heal"; ratio: number; target: "one" | "party" }>
  | Readonly<{ kind: "treat"; ratio: number }>
  | Readonly<{ kind: "identify" }>
  | Readonly<{ kind: "reveal-traps" }>
  | Readonly<{ kind: "battle" }>;

export interface ItemDefinition {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly use: ItemUse;
  /** Present when the item is usable in battle (use.kind === "battle"). */
  readonly battle?: BattleItemDefinition;
}

export interface EnemyUnitDefinition {
  readonly name: string;
  readonly stats: CoreStats;
  readonly reach: BasicAttackReach;
  readonly skillIds?: readonly string[];
  readonly slot: FormationSlot;
}

export interface EnemyGroupDefinition {
  readonly id: string;
  readonly name: string;
  readonly units: readonly EnemyUnitDefinition[];
  readonly exp: number;
  readonly gold: number;
  readonly loot?: readonly Weighted[];
  readonly lootChance?: number;
  readonly boss?: boolean;
}

export type RunEffect =
  | Readonly<{ kind: "gold"; amount: number }>
  | Readonly<{ kind: "food"; amount: number }>
  | Readonly<{ kind: "heal"; ratio: number }>
  | Readonly<{ kind: "damage"; ratio: number }>
  | Readonly<{ kind: "item"; itemId: string }>
  | Readonly<{ kind: "equipment"; equipmentId: string }>
  | Readonly<{ kind: "exp"; amount: number }>;

export interface EventDefinition {
  readonly id: string;
  readonly title: string;
  readonly text: string;
  readonly choices: readonly { readonly label: string; readonly effects: readonly RunEffect[] }[];
}

export interface FloorPlan {
  readonly depth: number;
  readonly enemyGroups: readonly Weighted[];
  readonly enemyCount: readonly [number, number];
  readonly traps: readonly Weighted<TrapType>[];
  readonly trapCount: readonly [number, number];
  readonly objects?: readonly FloorObjectSpec[];
  readonly modifierChance?: number;
  readonly modifiers?: readonly Weighted<FloorModifier>[];
  readonly bossGroupId?: string;
  readonly gateDefenderGroupId?: string;
  readonly sorceryFormations?: number;
  readonly alarmNetwork?: boolean;
  /** A safe zone (rest + shop) follows this floor. */
  readonly safeZoneAfter?: boolean;
  readonly secretRoomChance?: number;
}

export interface CampaignDefinition {
  readonly id: string;
  readonly name: string;
  readonly preview?: boolean;
  readonly floors: readonly FloorPlan[];
  readonly shopItems: readonly Weighted[];
  readonly shopEquipment: readonly Weighted[];
}

export type UnlockCondition =
  | Readonly<{ kind: "clear-campaign"; campaignId: string }>
  | Readonly<{ kind: "reach-depth"; campaignId: string; depth: number }>
  | Readonly<{ kind: "defeat-group"; groupId: string }>
  | Readonly<{ kind: "runs"; count: number }>;

export interface UnlockRule {
  readonly id: string;
  readonly condition: UnlockCondition;
  readonly unlock: Readonly<{ characterId?: string; campaignId?: string; achievement?: string }>;
}

export interface ContentPack {
  readonly characters: readonly CharacterDefinition[];
  readonly skills: readonly SkillDefinition[];
  /** Display names for skills (SkillDefinition is engine data only). */
  readonly skillNames: Readonly<Record<string, string>>;
  readonly traits: readonly TraitDefinition[];
  readonly equipment: readonly EquipmentDefinition[];
  readonly items: readonly ItemDefinition[];
  readonly enemyGroups: readonly EnemyGroupDefinition[];
  readonly events: readonly EventDefinition[];
  readonly campaigns: readonly CampaignDefinition[];
  readonly unlocks: readonly UnlockRule[];
  readonly startingUnlocks: { readonly characters: readonly string[]; readonly campaigns: readonly string[] };
}

export interface MetaState {
  readonly version: 1;
  readonly unlockedCharacters: readonly string[];
  readonly unlockedCampaigns: readonly string[];
  readonly codex: { readonly characters: readonly string[]; readonly enemies: readonly string[]; readonly items: readonly string[] };
  readonly achievements: readonly string[];
  readonly runs: number;
  readonly clears: number;
  readonly bestDepth: Readonly<Record<string, number>>;
}
