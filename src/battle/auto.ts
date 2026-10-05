import type {
  AbilityTargeting,
  DamageEffectDefinition,
  EffectDefinition,
  SkillDefinition,
} from "./action.js";
import {
  BASIC_ATTACK_ENERGY,
  BASIC_ATTACK_POWER,
  GUARD_DAMAGE_MULTIPLIER,
  type BattleCommand,
  type BattleEngine,
  type BattleSnapshot,
} from "./battle.js";
import { computeBaseDamage, computeStrategyDefense } from "./damage.js";
import type { StatusType } from "./status.js";

type UnitSnapshot = BattleSnapshot["units"][number];

export interface BasicSmartAutoPolicy {
  readonly lowHpGuardThreshold: number;
}

export interface SmartAutoPolicy extends BasicSmartAutoPolicy {
  readonly ultimateOverkillPenalty: number;
  readonly energyCostWeight: number;
}

export const DEFAULT_BASIC_SMART_AUTO_POLICY: BasicSmartAutoPolicy = Object.freeze({
  lowHpGuardThreshold: 0.25,
});

export const DEFAULT_SMART_AUTO_POLICY: SmartAutoPolicy = Object.freeze({
  lowHpGuardThreshold: 0.25,
  ultimateOverkillPenalty: 1.5,
  energyCostWeight: 0.12,
});

interface ScoredCommand {
  readonly command: BattleCommand;
  readonly score: number;
  readonly tieKey: string;
}

function assertPolicy(policy: BasicSmartAutoPolicy): void {
  if (
    !Number.isFinite(policy.lowHpGuardThreshold) ||
    policy.lowHpGuardThreshold < 0 ||
    policy.lowHpGuardThreshold > 1
  ) throw new RangeError("lowHpGuardThreshold must be between 0 and 1 inclusive.");
}

function assertSmartPolicy(policy: SmartAutoPolicy): void {
  assertPolicy(policy);
  if (!Number.isFinite(policy.ultimateOverkillPenalty) || policy.ultimateOverkillPenalty < 0)
    throw new RangeError("ultimateOverkillPenalty must be a non-negative finite number.");
  if (!Number.isFinite(policy.energyCostWeight) || policy.energyCostWeight < 0)
    throw new RangeError("energyCostWeight must be a non-negative finite number.");
}

function statusOf(snapshot: BattleSnapshot, unitId: string, type: StatusType) {
  return snapshot.statuses
    .find((entry) => entry.unitId === unitId)
    ?.statuses.find((status) => status.type === type);
}

function unitOf(snapshot: BattleSnapshot, id: string): UnitSnapshot {
  const unit = snapshot.units.find((candidate) => candidate.id === id);
  if (unit === undefined) throw new Error("Unknown Smart Auto unit: " + id);
  return unit;
}

function combinations<T>(values: readonly T[], min: number, max: number): T[][] {
  const output: T[][] = [];
  const pick: T[] = [];
  const walk = (start: number): void => {
    if (pick.length >= min && pick.length <= max) output.push([...pick]);
    if (pick.length === max) return;
    for (let index = start; index < values.length; index += 1) {
      const value = values[index];
      if (value === undefined) continue;
      pick.push(value);
      walk(index + 1);
      pick.pop();
    }
  };
  walk(0);
  return output;
}

function statusUtility(type: StatusType): number {
  switch (type) {
    case "stun": return 32;
    case "confusion": return 22;
    case "taunt": return 16;
    case "defense-down": return 20;
    case "timeline-delay": return 16;
    case "burn":
    case "poison":
    case "bleed": return 12;
  }
}

function relationScore(actor: UnitSnapshot, target: UnitSnapshot, value: number): number {
  return actor.side === target.side ? value : -value;
}

function expectedDamage(
  actor: UnitSnapshot,
  target: UnitSnapshot,
  effect: DamageEffectDefinition,
  snapshot: BattleSnapshot,
): number {
  const defenseDown = statusOf(snapshot, target.id, "defense-down")?.magnitude ?? 0;
  const targetDef = Math.max(1, target.stats.def * Math.max(0.05, 1 - defenseDown));
  const defense = effect.kind === "physical"
    ? targetDef
    : computeStrategyDefense(targetDef, target.stats.int);
  const offense = effect.kind === "physical" ? actor.stats.atk : actor.stats.int;
  const critChance = effect.critChance ?? 0.05;
  const critMultiplier = effect.critMultiplier ?? 1.5;
  const expectedCritFactor = 1 + critChance * (critMultiplier - 1);
  const guardMultiplier = snapshot.guarding.includes(target.id)
    ? GUARD_DAMAGE_MULTIPLIER
    : 1;
  return computeBaseDamage(
    effect.power,
    offense,
    defense,
    1,
    (effect.modifier ?? 1) * guardMultiplier,
  ) * expectedCritFactor;
}

function effectScore(
  actor: UnitSnapshot,
  target: UnitSnapshot,
  effect: EffectDefinition,
  snapshot: BattleSnapshot,
): number {
  switch (effect.type) {
    case "damage": {
      const damage = expectedDamage(actor, target, effect, snapshot);
      const dealt = Math.min(damage, target.hp);
      const lethal = damage >= target.hp;
      const overkill = Math.max(0, damage - target.hp);
      const raw = dealt + (lethal ? 35 : 0) - overkill * 0.35;
      return actor.side === target.side ? -raw : raw;
    }
    case "heal": {
      const missing = Math.max(0, target.stats.maxHp - target.hp);
      const heal = Math.min(
        missing,
        effect.baseHeal * (actor.stats.int / 100) * (effect.modifier ?? 1),
      );
      return relationScore(actor, target, heal * 1.25);
    }
    case "status": {
      const existing = statusOf(snapshot, target.id, effect.statusType);
      const utility = statusUtility(effect.statusType);
      const raw = existing === undefined ? utility : utility * 0.35;
      return actor.side === target.side ? -raw : raw;
    }
    case "timeline-shift": {
      const useful =
        (actor.side === target.side && effect.amount < 0) ||
        (actor.side !== target.side && effect.amount > 0);
      return useful ? Math.abs(effect.amount) * 0.25 : -Math.abs(effect.amount) * 0.2;
    }
    case "energy": {
      const actual = effect.amount > 0
        ? Math.min(100 - target.energy, effect.amount)
        : Math.min(target.energy, -effect.amount);
      const useful =
        (actor.side === target.side && effect.amount > 0) ||
        (actor.side !== target.side && effect.amount < 0);
      return useful ? actual * 0.3 : -actual * 0.25;
    }
    case "formation-swap": {
      if (actor.side !== target.side) return -20;
      const actorRatio = actor.hp / actor.stats.maxHp;
      const targetRatio = target.hp / target.stats.maxHp;
      return actorRatio < 0.4 && targetRatio > actorRatio ? 14 : 2;
    }
  }
}

function targetsForEffect(
  actorId: string,
  targetIds: readonly string[],
  effect: EffectDefinition,
): readonly string[] {
  return effect.recipient === "actor" ? [actorId] : targetIds;
}

function scoreSkill(
  battle: BattleEngine,
  skill: SkillDefinition,
  targetIds: readonly string[],
  policy: SmartAutoPolicy,
): number {
  const snapshot = battle.snapshot();
  const active = snapshot.activeTurn;
  if (active === null) throw new Error("Smart Auto requires an active turn.");
  const actor = unitOf(snapshot, active.actorId);
  let score = 0;
  for (const effect of skill.effects) {
    for (const targetId of targetsForEffect(actor.id, targetIds, effect)) {
      score += effectScore(actor, unitOf(snapshot, targetId), effect, snapshot);
    }
  }
  score -= skill.energyCost * policy.energyCostWeight;
  if (skill.kind === "ultimate" && targetIds.length === 1) {
    const targetId = targetIds[0];
    if (targetId !== undefined) {
      const target = unitOf(snapshot, targetId);
      const expected = skill.effects
        .filter((effect): effect is DamageEffectDefinition => effect.type === "damage")
        .reduce((sum, effect) => sum + expectedDamage(actor, target, effect, snapshot), 0);
      score -= Math.max(0, expected - target.hp) * policy.ultimateOverkillPenalty;
    }
  }
  return score;
}

function skillCandidates(battle: BattleEngine, policy: SmartAutoPolicy): ScoredCommand[] {
  const snapshot = battle.snapshot();
  const active = snapshot.activeTurn;
  if (active === null) throw new Error("Smart Auto requires an active turn.");
  const actor = unitOf(snapshot, active.actorId);
  const output: ScoredCommand[] = [];
  for (const skill of battle.ownedSkills(actor.id)) {
    if (actor.energy < skill.energyCost) continue;
    const legal = battle.legalAbilityTargets(actor.id, skill.targeting);
    for (const targetIds of combinations(
      legal,
      skill.targeting.minTargets,
      skill.targeting.maxTargets,
    )) {
      const command: BattleCommand = skill.kind === "ultimate"
        ? { type: "ultimate", actorId: actor.id, skillId: skill.id, targetIds }
        : { type: "skill", actorId: actor.id, skillId: skill.id, targetIds };
      output.push({
        command,
        score: scoreSkill(battle, skill, targetIds, policy),
        tieKey: "1:" + skill.id + ":" + targetIds.join(","),
      });
    }
  }
  return output;
}

function basicCandidates(battle: BattleEngine): ScoredCommand[] {
  const snapshot = battle.snapshot();
  const active = snapshot.activeTurn;
  if (active === null) throw new Error("Smart Auto requires an active turn.");
  const actor = unitOf(snapshot, active.actorId);
  const effect: DamageEffectDefinition = {
    type: "damage",
    recipient: "targets",
    kind: "physical",
    power: BASIC_ATTACK_POWER,
  };
  return battle.legalBasicTargets(actor.id).map((targetId) => {
    const target = unitOf(snapshot, targetId);
    const damage = expectedDamage(actor, target, effect, snapshot);
    const dealt = Math.min(damage, target.hp);
    const overkill = Math.max(0, damage - target.hp);
    const command: BattleCommand = { type: "attack", actorId: actor.id, targetId };
    return {
      command,
      score:
        dealt +
        (damage >= target.hp ? 35 : 0) -
        overkill * 0.35 +
        BASIC_ATTACK_ENERGY * 0.1,
      tieKey: "0:" + targetId,
    };
  });
}

function sortCandidates(candidates: ScoredCommand[]): void {
  candidates.sort(
    (left, right) =>
      right.score - left.score || left.tieKey.localeCompare(right.tieKey),
  );
}

export function chooseBasicSmartCommand(
  battle: BattleEngine,
  policy: BasicSmartAutoPolicy = DEFAULT_BASIC_SMART_AUTO_POLICY,
): BattleCommand {
  assertPolicy(policy);
  const snapshot = battle.snapshot();
  const active = snapshot.activeTurn;
  if (active === null) throw new Error("Smart Auto requires an active turn.");
  const actor = unitOf(snapshot, active.actorId);
  const basic = basicCandidates(battle);
  sortCandidates(basic);
  const hpRatio = actor.hp / actor.stats.maxHp;
  if (
    hpRatio <= policy.lowHpGuardThreshold &&
    !basic.some((candidate) => candidate.score >= 35)
  ) return { type: "guard", actorId: actor.id };
  return basic[0]?.command ?? { type: "guard", actorId: actor.id };
}

export function chooseSmartCommand(
  battle: BattleEngine,
  policy: SmartAutoPolicy = DEFAULT_SMART_AUTO_POLICY,
): BattleCommand {
  assertSmartPolicy(policy);
  const snapshot = battle.snapshot();
  const active = snapshot.activeTurn;
  if (active === null) throw new Error("Smart Auto requires an active turn.");
  const actor = unitOf(snapshot, active.actorId);
  const candidates = [
    ...basicCandidates(battle),
    ...skillCandidates(battle, policy),
  ];
  const hpRatio = actor.hp / actor.stats.maxHp;
  const guardScore = hpRatio <= policy.lowHpGuardThreshold
    ? 28 + (1 - hpRatio) * 30
    : 1;
  candidates.push({
    command: { type: "guard", actorId: actor.id },
    score: guardScore,
    tieKey: "9:guard",
  });
  sortCandidates(candidates);
  return candidates[0]?.command ?? { type: "guard", actorId: actor.id };
}
