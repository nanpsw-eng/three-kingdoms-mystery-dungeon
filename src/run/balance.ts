// Canonical Run-layer balance seeds (BALANCE_SEED.md Growth/Economy, NOT_VALIDATED).

export const PARTY_LEVEL_CAP = 10 as const;
/** Cumulative EXP needed to reach level index+1 (index 0 = Lv.1). */
export const LEVEL_EXP_TABLE = [0, 30, 75, 135, 210, 300, 405, 525, 660, 810] as const;
export const TRAIT_LEVELS: readonly number[] = [2, 4, 6, 8, 10];
export const TRAIT_OPTIONS = 3 as const;
export const TRAIT_REROLLS_PER_RUN = 2 as const;
export const TRAIT_UNIQUE_SHARE = 0.75 as const;
export const TRAIT_RELATED_TAG_WEIGHT = 1.75 as const;

/** A-15: per-level growth over Lv.1 base stats. */
export const LEVEL_GROWTH: Readonly<Record<"maxHp" | "atk" | "def" | "spd" | "int", number>> = {
  maxHp: 0.05, atk: 0.04, def: 0.04, spd: 0.01, int: 0.04,
};

export const MAX_PARTY_SIZE = 5 as const;
export const MAX_RECRUITS_PER_RUN = 2 as const;
export const STARTING_GENERALS = 2 as const;
export const INVENTORY_SLOTS = 10 as const;
export const STARTING_GOLD = 30 as const;
/** A-23: starting supplies in the shared bag. */
export const STARTING_ITEMS: readonly string[] = ["herb", "herb", "bun"];
export const ENHANCE_CAP = 3 as const;
/** Each enhancement level adds this share of the base equipment stats (rounded, min +1). */
export const ENHANCE_STEP = 0.25 as const;
export const ENHANCE_COST_BASE = 40 as const;
export const IDENTIFY_COST = 15 as const;
export const SHOP_ITEM_OFFERS = 4 as const;
export const SHOP_EQUIPMENT_OFFERS = 2 as const;

/** A-18: sorcery formation grants engaged enemies initial energy. */
export const SORCERY_ENEMY_ENERGY = 30 as const;
/** Reinforcement enemies give reduced rewards (DUNGEON_SPEC §10). */
export const REINFORCEMENT_REWARD_RATIO = 0.5 as const;
/** A-17: safe zone heals all members and treats KO members to this HP ratio. */
export const SAFE_ZONE_HEAL_RATIO = 1 as const;
