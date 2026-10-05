import type { AbilityTargeting, EffectDefinition, SkillDefinition } from "../battle/action.js";
import type { StatusType } from "../battle/status.js";

// Builders keep the content tables short. Powers follow BALANCE_SEED ranges:
// light 26-32, standard 32-38, heavy 38-44, ultimate 42-55, AoE per-target ×0.70-0.85.

export const enemyOne = (access: "front" | "any" = "any"): AbilityTargeting => ({ team: "enemy", access, minTargets: 1, maxTargets: 1 });
export const enemyUpTo = (max: number, access: "front" | "any" = "any"): AbilityTargeting => ({ team: "enemy", access, minTargets: 1, maxTargets: max });
export const allyOne = (state?: "ko" | "any"): AbilityTargeting => ({ team: "ally", access: "any", minTargets: 1, maxTargets: 1, ...(state ? { state } : {}) });
export const allyUpTo = (max: number, state?: "ko" | "any"): AbilityTargeting => ({ team: "ally", access: "any", minTargets: 1, maxTargets: max, ...(state ? { state } : {}) });
export const self: AbilityTargeting = { team: "self", access: "self", minTargets: 1, maxTargets: 1 };

export const physical = (power: number, extra: Partial<Extract<EffectDefinition, { type: "damage" }>> = {}): EffectDefinition =>
  ({ type: "damage", recipient: "targets", kind: "physical", power, ...extra });
export const strategy = (power: number, extra: Partial<Extract<EffectDefinition, { type: "damage" }>> = {}): EffectDefinition =>
  ({ type: "damage", recipient: "targets", kind: "strategy", power, ...extra });
export const status = (statusType: StatusType, durationRounds: number, extra: { stacks?: number; magnitude?: number } = {}): EffectDefinition =>
  ({ type: "status", recipient: "targets", statusType, durationRounds, ...extra });
export const heal = (baseHeal: number, recipient: "targets" | "actor" = "targets"): EffectDefinition => ({ type: "heal", recipient, baseHeal });
export const energy = (amount: number, recipient: "targets" | "actor" = "targets"): EffectDefinition => ({ type: "energy", recipient, amount });
export const shift = (amount: number, recipient: "targets" | "actor" = "targets"): EffectDefinition => ({ type: "timeline-shift", recipient, amount });
export const extraAction = (recipient: "targets" | "actor" = "actor", mode: "extra" | "interrupt" = "extra"): EffectDefinition => ({ type: "extra-action", recipient, mode });
export const cleanse = (statusTypes?: readonly StatusType[]): EffectDefinition => (statusTypes ? { type: "cleanse", recipient: "targets", statusTypes } : { type: "cleanse", recipient: "targets" });
export const revive = (hpRatio: number): EffectDefinition => ({ type: "revive", recipient: "targets", hpRatio });

export function active(id: string, energyCost: number, targeting: AbilityTargeting, effects: readonly EffectDefinition[]): SkillDefinition {
  return { id, kind: "active", energyCost, targeting, effects };
}
export function ultimate(id: string, targeting: AbilityTargeting, effects: readonly EffectDefinition[]): SkillDefinition {
  return { id, kind: "ultimate", energyCost: 100, targeting, effects };
}
