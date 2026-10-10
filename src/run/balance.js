// Canonical Run-layer balance seeds (BALANCE_SEED.md Growth/Economy, NOT_VALIDATED).
export const PARTY_LEVEL_CAP = 10;
/** Cumulative EXP needed to reach level index+1 (index 0 = Lv.1). */
export const LEVEL_EXP_TABLE = [0, 30, 75, 135, 210, 300, 405, 525, 660, 810];
export const TRAIT_LEVELS = [2, 4, 6, 8, 10];
export const TRAIT_OPTIONS = 3;
export const TRAIT_REROLLS_PER_RUN = 2;
export const TRAIT_UNIQUE_SHARE = 0.75;
export const TRAIT_RELATED_TAG_WEIGHT = 1.75;
/** A-15: per-level growth over Lv.1 base stats. */
export const LEVEL_GROWTH = {
    maxHp: 0.05, atk: 0.04, def: 0.04, spd: 0.01, int: 0.04,
};
export const MAX_PARTY_SIZE = 5;
export const MAX_RECRUITS_PER_RUN = 2;
export const STARTING_GENERALS = 2;
export const INVENTORY_SLOTS = 10;
export const STARTING_GOLD = 30;
/** A-23: starting supplies in the shared bag. */
export const STARTING_ITEMS = ["herb", "herb", "bun"];
export const ENHANCE_CAP = 3;
/** Each enhancement level adds this share of the base equipment stats (rounded, min +1). */
export const ENHANCE_STEP = 0.25;
export const ENHANCE_COST_BASE = 40;
export const IDENTIFY_COST = 15;
export const SHOP_ITEM_OFFERS = 4;
export const SHOP_EQUIPMENT_OFFERS = 2;
/** A-18: sorcery formation grants engaged enemies initial energy. */
export const SORCERY_ENEMY_ENERGY = 30;
/** Reinforcement enemies give reduced rewards (DUNGEON_SPEC §10). */
export const REINFORCEMENT_REWARD_RATIO = 0.5;
/** A-17: safe zone heals all members and treats KO members to this HP ratio. */
export const SAFE_ZONE_HEAL_RATIO = 1;
/** X5 일기토: a defeated champion enters the main battle at (1 - penalty) of its HP. */
export const DUEL_DEFAULT_PENALTY = 0.5;
/** X5 일기토: losing the duel leaves your general at 1 HP and fires up the enemy (initial energy). */
export const DUEL_LOSS_ENEMY_ENERGY = 30;
/** X5 일기토: the champion's duel HP as a share of its max HP (a boss has ~3× a general's HP). */
export const DUEL_CHAMPION_HP_RATIO = 0.6;
/** X8 명성: clearing a campaign at renown r unlocks r+1, up to this level. */
export const RENOWN_MAX = 3;
/** X8 명성: enemy core stats +4% per renown level (sim: +10% dropped E1 from 35% to 3%). */
export const RENOWN_ENEMY_STEP = 0.04;
/** X8 명성: battle EXP/gold +15% per renown level. */
export const RENOWN_REWARD_STEP = 0.15;
//# sourceMappingURL=balance.js.map