import type { SeededRng } from "../core/rng.js";

export const BASE_CRIT_CHANCE = 0.05 as const;
export const BASE_CRIT_MULTIPLIER = 1.5 as const;
export const MIN_DAMAGE_VARIANCE = 0.95 as const;
export const MAX_DAMAGE_VARIANCE = 1.05 as const;
export type DamageKind = "physical" | "strategy";
export interface DamageRollInput { readonly kind: DamageKind; readonly skillPower: number; readonly attackerAtk: number; readonly attackerInt: number; readonly targetDef: number; readonly targetInt: number; readonly modifier?: number; readonly critChance?: number; readonly critMultiplier?: number; }
export interface DamageRollResult { readonly kind: DamageKind; readonly damage: number; readonly critical: boolean; readonly variance: number; readonly effectiveDefense: number; readonly rawDamage: number; }
function assertPositiveFinite(label: string, value: number): void { if (!Number.isFinite(value) || value <= 0) throw new RangeError(`${label} must be a positive finite number.`); }
function assertProbability(label: string, value: number): void { if (!Number.isFinite(value) || value < 0 || value > 1) throw new RangeError(`${label} must be between 0 and 1 inclusive.`); }
export function computeStrategyDefense(def: number, int: number): number { assertPositiveFinite("DEF", def); assertPositiveFinite("INT", int); return def * 0.5 + int * 0.5; }
export function computeBaseDamage(skillPower: number, offense: number, defense: number, variance = 1, modifier = 1): number { assertPositiveFinite("Skill power", skillPower); assertPositiveFinite("Offense", offense); assertPositiveFinite("Defense", defense); assertPositiveFinite("Variance", variance); assertPositiveFinite("Modifier", modifier); return skillPower * (offense / defense) ** 0.75 * variance * modifier; }
export function rollDamage(rng: SeededRng, input: DamageRollInput): DamageRollResult {
  const modifier = input.modifier ?? 1;
  const critChance = input.critChance ?? BASE_CRIT_CHANCE;
  const critMultiplier = input.critMultiplier ?? BASE_CRIT_MULTIPLIER;
  assertProbability("Critical chance", critChance); assertPositiveFinite("Critical multiplier", critMultiplier);
  const effectiveDefense = input.kind === "physical" ? input.targetDef : computeStrategyDefense(input.targetDef, input.targetInt);
  const offense = input.kind === "physical" ? input.attackerAtk : input.attackerInt;
  const variance = MIN_DAMAGE_VARIANCE + rng.nextFloat() * (MAX_DAMAGE_VARIANCE - MIN_DAMAGE_VARIANCE);
  const critical = rng.chance(critChance);
  const rawDamage = computeBaseDamage(input.skillPower, offense, effectiveDefense, variance, modifier) * (critical ? critMultiplier : 1);
  return { kind: input.kind, damage: Math.max(1, Math.round(rawDamage)), critical, variance, effectiveDefense, rawDamage };
}
