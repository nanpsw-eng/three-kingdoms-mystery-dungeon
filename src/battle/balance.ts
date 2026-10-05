// Canonical battle balance seeds (BALANCE_SEED.md v0.1, NOT_VALIDATED).
// Modules re-export these names for backward compatibility; change values only here.

// Timeline
export const ACTION_DELAY_BASE = 10_000 as const;

// Damage / critical / evasion (BATTLE_SPEC §5-6)
export const BASIC_ATTACK_POWER = 18 as const;
export const BASE_CRIT_CHANCE = 0.05 as const;
export const BASE_CRIT_MULTIPLIER = 1.5 as const;
export const MIN_DAMAGE_VARIANCE = 0.95 as const;
export const MAX_DAMAGE_VARIANCE = 1.05 as const;
export const BASE_EVASION_CHANCE = 0.03 as const;
export const GUARD_DAMAGE_MULTIPLIER = 0.7 as const;

// Energy (BATTLE_SPEC §7)
export const MAX_ENERGY = 100 as const;
export const BASIC_ATTACK_ENERGY = 18 as const;
export const HIT_RECEIVED_ENERGY = 8 as const;
export const GUARD_ENERGY = 20 as const;
export const KILL_ENERGY = 12 as const;
export const CRITICAL_ENERGY = 5 as const;

// Status (BATTLE_SPEC §8)
export const STACKABLE_STATUS_MAX = 3 as const;

// Loadout (BATTLE_SPEC §9: Active Skill 1~3 + Ultimate) — enforced for the ally side only.
export const MAX_ACTIVE_SKILLS_PER_ALLY = 3 as const;
export const MAX_ULTIMATES_PER_ALLY = 1 as const;

// Surprise (BATTLE_SPEC §13)
export const SURPRISE_INITIAL_ENERGY = 15 as const;
export const SURPRISE_INITIAL_ACTION_DELAY_MODIFIER = 0.8 as const;

// Post-battle KO recovery (BATTLE_SPEC §11) — applied by the Run layer.
export const POST_BATTLE_KO_RECOVERY_RATIO = 0.1 as const;
