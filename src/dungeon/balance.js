// Canonical dungeon balance seeds (DUNGEON_SPEC v0.1 / BALANCE_SEED.md, NOT_VALIDATED).
// Generation (DUNGEON_SPEC §2)
export const FLOOR_WIDTH = 48;
export const FLOOR_HEIGHT = 34;
export const MIN_ROOMS = 5;
export const MAX_ROOMS = 9;
export const ROOM_MIN_SIZE = 4;
export const ROOM_MAX_WIDTH = 9;
export const ROOM_MAX_HEIGHT = 7;
export const COMPACT_ROOM_MAX_WIDTH = 6;
export const COMPACT_ROOM_MAX_HEIGHT = 6;
export const ROOM_PADDING = 2;
export const EXTRA_EDGE_CHANCE = 0.15;
export const MAX_EXTRA_EDGES = 2;
export const MAX_DEAD_ENDS = 2;
// Vision / detection (DUNGEON_SPEC §3, §5)
export const CORRIDOR_VISION_RADIUS = 1;
export const ENEMY_DETECTION_RANGE = 3;
export const ALERT_ENGAGE_COOLDOWN_TURNS = 3;
export const SEARCH_STATE_TURNS = 5;
// Food / recovery (DUNGEON_SPEC §7-8)
export const FOOD_MAX = 100;
export const FOOD_TICK_TURNS = 10;
export const NATURAL_RECOVERY_TURNS = 3;
export const NATURAL_RECOVERY_RATIO = 0.01;
/** A-11: starvation damage per recovery tick when food is 0 (can KO). */
export const STARVATION_DAMAGE_RATIO = 0.02;
// Danger / reinforcement (DUNGEON_SPEC §9-10)
export const DANGER_CAUTION_TURN = 150;
export const DANGER_HIGH_TURN = 300;
export const REINFORCEMENT_CHECK_TURNS = 25;
export const REINFORCEMENT_CHANCE_CAUTION = 0.25;
export const REINFORCEMENT_CHANCE_HIGH = 0.5;
export const REINFORCEMENT_EXTRA_CAP = 3;
export const DANGER_PATROL_HUNT_CHANCE = 0.3;
// Traps (DUNGEON_SPEC §11) — A-10: trap damage cannot KO (min 1 HP)
export const TRAP_DAMAGE_RATIO = {
    rockfall: 0.1,
    "poison-needle": 0.08,
    "fire-circle": 0.12,
    pit: 0.05,
};
export const PIT_STUCK_TURNS = 2;
export const FOOD_LOSS_AMOUNT = 10;
export const CONFUSION_TRAP_TURNS = 5;
export const ENEMY_TRAP_HP_LOSS = 0.15;
// Secret areas (DUNGEON_SPEC §12) — ~2-4 per 15F run
export const DEFAULT_SECRET_ROOM_CHANCE = 0.2;
// Auto explore stop thresholds (DUNGEON_SPEC §14)
export const AUTO_LOW_HP_RATIO = 0.3;
export const AUTO_LOW_FOOD = 10;
//# sourceMappingURL=balance.js.map