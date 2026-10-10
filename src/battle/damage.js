import { BASE_CRIT_CHANCE, BASE_CRIT_MULTIPLIER, MAX_DAMAGE_VARIANCE, MIN_DAMAGE_VARIANCE } from "./balance.js";
export { BASE_CRIT_CHANCE, BASE_CRIT_MULTIPLIER, MAX_DAMAGE_VARIANCE, MIN_DAMAGE_VARIANCE };
function assertPositiveFinite(label, value) { if (!Number.isFinite(value) || value <= 0)
    throw new RangeError(`${label} must be a positive finite number.`); }
function assertProbability(label, value) { if (!Number.isFinite(value) || value < 0 || value > 1)
    throw new RangeError(`${label} must be between 0 and 1 inclusive.`); }
export function computeStrategyDefense(def, int) { assertPositiveFinite("DEF", def); assertPositiveFinite("INT", int); return def * 0.5 + int * 0.5; }
export function computeBaseDamage(skillPower, offense, defense, variance = 1, modifier = 1) { assertPositiveFinite("Skill power", skillPower); assertPositiveFinite("Offense", offense); assertPositiveFinite("Defense", defense); assertPositiveFinite("Variance", variance); assertPositiveFinite("Modifier", modifier); return skillPower * (offense / defense) ** 0.75 * variance * modifier; }
export function rollDamage(rng, input) {
    const modifier = input.modifier ?? 1;
    const critChance = input.critChance ?? BASE_CRIT_CHANCE;
    const critMultiplier = input.critMultiplier ?? BASE_CRIT_MULTIPLIER;
    assertProbability("Critical chance", critChance);
    assertPositiveFinite("Critical multiplier", critMultiplier);
    const effectiveDefense = input.kind === "physical" ? input.targetDef : computeStrategyDefense(input.targetDef, input.targetInt);
    const offense = input.kind === "physical" ? input.attackerAtk : input.attackerInt;
    const variance = MIN_DAMAGE_VARIANCE + rng.nextFloat() * (MAX_DAMAGE_VARIANCE - MIN_DAMAGE_VARIANCE);
    const critical = rng.chance(critChance);
    const rawDamage = computeBaseDamage(input.skillPower, offense, effectiveDefense, variance, modifier) * (critical ? critMultiplier : 1);
    return { kind: input.kind, damage: Math.max(1, Math.round(rawDamage)), critical, variance, effectiveDefense, rawDamage };
}
//# sourceMappingURL=damage.js.map