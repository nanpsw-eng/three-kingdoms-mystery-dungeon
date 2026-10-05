import type { DamageKind } from "./damage.js";
import type { StatusType } from "./status.js";

export type AbilityTargetTeam = "self" | "ally" | "enemy";
export type AbilityTargetAccess = "self" | "front" | "any";
export type EffectRecipient = "actor" | "targets";
export type SkillKind = "active" | "ultimate";

export interface AbilityTargeting {
  readonly team: AbilityTargetTeam;
  readonly access: AbilityTargetAccess;
  readonly minTargets: number;
  readonly maxTargets: number;
}

export interface DamageEffectDefinition {
  readonly type: "damage";
  readonly recipient: EffectRecipient;
  readonly kind: DamageKind;
  readonly power: number;
  readonly modifier?: number;
  readonly critChance?: number;
  readonly critMultiplier?: number;
}

export interface HealEffectDefinition {
  readonly type: "heal";
  readonly recipient: EffectRecipient;
  readonly baseHeal: number;
  readonly modifier?: number;
}

export interface StatusEffectDefinition {
  readonly type: "status";
  readonly recipient: EffectRecipient;
  readonly statusType: StatusType;
  readonly durationRounds: number;
  readonly stacks?: number;
  readonly magnitude?: number;
}

export interface TimelineShiftEffectDefinition {
  readonly type: "timeline-shift";
  readonly recipient: EffectRecipient;
  readonly amount: number;
}

export interface EnergyEffectDefinition {
  readonly type: "energy";
  readonly recipient: EffectRecipient;
  readonly amount: number;
}

export interface FormationSwapEffectDefinition {
  readonly type: "formation-swap";
  readonly recipient: "targets";
}

export type EffectDefinition =
  | DamageEffectDefinition
  | HealEffectDefinition
  | StatusEffectDefinition
  | TimelineShiftEffectDefinition
  | EnergyEffectDefinition
  | FormationSwapEffectDefinition;

export interface SkillDefinition {
  readonly id: string;
  readonly kind: SkillKind;
  readonly energyCost: number;
  readonly targeting: AbilityTargeting;
  readonly effects: readonly EffectDefinition[];
  readonly actionSpeedModifier?: number;
}

export interface BattleItemDefinition {
  readonly id: string;
  readonly targeting: AbilityTargeting;
  readonly effects: readonly EffectDefinition[];
  readonly actionSpeedModifier?: number;
}

function assertNonEmptyId(label: string, value: string): void {
  if (value.trim().length === 0) throw new RangeError(`${label} must not be empty.`);
}

function assertPositiveFinite(label: string, value: number): void {
  if (!Number.isFinite(value) || value <= 0) throw new RangeError(`${label} must be a positive finite number.`);
}

function assertProbability(label: string, value: number): void {
  if (!Number.isFinite(value) || value < 0 || value > 1) throw new RangeError(`${label} must be between 0 and 1 inclusive.`);
}

export function validateTargeting(targeting: AbilityTargeting): void {
  if (!Number.isSafeInteger(targeting.minTargets) || !Number.isSafeInteger(targeting.maxTargets)) {
    throw new TypeError("Target counts must be safe integers.");
  }
  if (targeting.minTargets < 1 || targeting.maxTargets < targeting.minTargets || targeting.maxTargets > 5) {
    throw new RangeError("Target counts must satisfy 1 <= minTargets <= maxTargets <= 5.");
  }
  if (targeting.team === "self") {
    if (targeting.access !== "self" || targeting.minTargets !== 1 || targeting.maxTargets !== 1) {
      throw new RangeError("Self targeting requires access=self and exactly one target.");
    }
  } else if (targeting.access === "self") {
    throw new RangeError("Non-self targeting cannot use access=self.");
  }
}

export function validateEffect(effect: EffectDefinition): void {
  switch (effect.type) {
    case "damage":
      assertPositiveFinite("Damage effect power", effect.power);
      if (effect.modifier !== undefined) assertPositiveFinite("Damage effect modifier", effect.modifier);
      if (effect.critChance !== undefined) assertProbability("Damage critical chance", effect.critChance);
      if (effect.critMultiplier !== undefined) assertPositiveFinite("Damage critical multiplier", effect.critMultiplier);
      return;
    case "heal":
      assertPositiveFinite("Heal base", effect.baseHeal);
      if (effect.modifier !== undefined) assertPositiveFinite("Heal modifier", effect.modifier);
      return;
    case "status":
      if (!Number.isSafeInteger(effect.durationRounds) || effect.durationRounds <= 0) {
        throw new RangeError("Status duration must be a positive safe integer.");
      }
      if (effect.stacks !== undefined && (!Number.isSafeInteger(effect.stacks) || effect.stacks <= 0)) {
        throw new RangeError("Status stacks must be a positive safe integer.");
      }
      if (effect.magnitude !== undefined) assertPositiveFinite("Status magnitude", effect.magnitude);
      return;
    case "timeline-shift":
      if (!Number.isFinite(effect.amount) || effect.amount === 0) throw new RangeError("Timeline shift amount must be a non-zero finite number.");
      return;
    case "energy":
      if (!Number.isFinite(effect.amount) || effect.amount === 0) throw new RangeError("Energy effect amount must be a non-zero finite number.");
      return;
    case "formation-swap":
      return;
  }
}

function validateActionSpeedModifier(value: number | undefined): void {
  if (value !== undefined) assertPositiveFinite("Action speed modifier", value);
}

export function validateSkillDefinition(skill: SkillDefinition): void {
  assertNonEmptyId("Skill id", skill.id);
  if (!Number.isSafeInteger(skill.energyCost) || skill.energyCost < 0 || skill.energyCost > 100) {
    throw new RangeError("Skill energy cost must be a safe integer between 0 and 100.");
  }
  if (skill.kind === "ultimate" && skill.energyCost !== 100) {
    throw new RangeError("Ultimate baseline energy cost must be 100.");
  }
  if (skill.kind === "active" && skill.energyCost >= 100) {
    throw new RangeError("Active skill baseline energy cost must be below 100.");
  }
  validateTargeting(skill.targeting);
  if (skill.effects.length === 0) throw new RangeError("Skill must contain at least one effect.");
  for (const effect of skill.effects) validateEffect(effect);
  validateActionSpeedModifier(skill.actionSpeedModifier);
}

export function validateItemDefinition(item: BattleItemDefinition): void {
  assertNonEmptyId("Item id", item.id);
  validateTargeting(item.targeting);
  if (item.effects.length === 0) throw new RangeError("Item must contain at least one effect.");
  for (const effect of item.effects) validateEffect(effect);
  validateActionSpeedModifier(item.actionSpeedModifier);
}
