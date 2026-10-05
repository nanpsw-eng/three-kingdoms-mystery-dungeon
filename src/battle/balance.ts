// Canonical balance seeds introduced from Phase 8 (BALANCE_SEED.md v0.1, NOT_VALIDATED).
// Older constants still live next to their modules; consolidation is backlog item N6.

/** Base evasion chance per damage instance (BATTLE_SPEC §6). */
export const BASE_EVASION_CHANCE = 0.03 as const;

/** Initial energy granted to every living unit of the surprising side (BALANCE_SEED Surprise). */
export const SURPRISE_INITIAL_ENERGY = 15 as const;

/** First-action delay multiplier for the surprising side (~20% timeline advantage). */
export const SURPRISE_INITIAL_ACTION_DELAY_MODIFIER = 0.8 as const;
