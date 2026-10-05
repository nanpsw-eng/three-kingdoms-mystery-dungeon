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
import { BASE_EVASION_CHANCE } from "./balance.js";
import { computeBaseDamage, computeStrategyDefense } from "./damage.js";
import { MAX_ENERGY } from "./unit.js";
import type { StatusType } from "./status.js";

type UnitSnapshot = BattleSnapshot["units"][number];

export interface BasicSmartAutoPolicy {
  readonly lowHpGuardThreshold: number;
}

export interface SmartAutoPolicy extends BasicSmartAutoPolicy {
  readonly ultimateOverkillPenalty: number;
  readonly energyCostWeight: number;
  /** Extra per-energy penalty on active skills while the actor still has an ultimate to charge. */
  readonly ultimateReserveWeight: number;
}

export const DEFAULT_BASIC_SMART_AUTO_POLICY: BasicSmartAutoPolicy = Object.freeze({
  lowHpGuardThreshold: 0.25,
});

export const DEFAULT_SMART_AUTO_POLICY: SmartAutoPolicy = Object.freeze({
  lowHpGuardThreshold: 0.25,
  ultimateOverkillPenalty: 1.5,
  energyCostWeight: 0.12,
  ultimateReserveWeight: 0.3,
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
  if (!Number.isFinite(policy.ultimateReserveWeight) || policy.ultimateReserveWeight < 0)
    throw new RangeError("ultimateReserveWeight must be a non-negative finite number.");
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

const DOT_STATUSES: ReadonlySet<StatusType> = new Set(["poison", "burn", "bleed"]);

// Removing a DOT is worth at least the damage it would still deal.
function cleanseValue(status: { type: StatusType; stacks: number; magnitude: number; remainingRounds: number }): number {
  const utility = statusUtility(status.type) * 0.8;
  if (!DOT_STATUSES.has(status.type)) return utility;
  const remainingDamage = Math.max(1, Math.round(status.magnitude * status.stacks)) * status.remainingRounds;
  return Math.max(utility, remainingDamage * 1.2);
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
  const hitChance = 1 - (effect.evasionChance ?? BASE_EVASION_CHANCE);
  const guardMultiplier = snapshot.guarding.includes(target.id)
    ? GUARD_DAMAGE_MULTIPLIER
    : 1;
  return computeBaseDamage(
    effect.power,
    offense,
    defense,
    1,
    (effect.modifier ?? 1) * guardMultiplier,
  ) * expectedCritFactor * hitChance;
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
    case "cleanse": {
      const entry = snapshot.statuses.find((candidate) => candidate.unitId === target.id);
      const removed = (entry?.statuses ?? []).filter(
        (status) => effect.statusTypes === undefined || effect.statusTypes.includes(status.type),
      );
      const raw = removed.reduce((sum, status) => sum + cleanseValue(status), 0);
      return relationScore(actor, target, raw);
    }
    case "extra-action":
      return relationScore(actor, target, effect.mode === "interrupt" ? 30 : 26);
    case "revive": {
      if (!target.knockedOut) return 0;
      const hp = Math.max(1, Math.round(target.stats.maxHp * effect.hpRatio));
      return relationScore(actor, target, 40 + hp * 0.5);
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
  const revived = new Set<string>();
  for (const effect of skill.effects) {
    for (const targetId of targetsForEffect(actor.id, targetIds, effect)) {
      const target = unitOf(snapshot, targetId);
      // Mirror the engine: only revive affects KO units; later effects see the revived unit.
      if (target.knockedOut && effect.type !== "revive" && !revived.has(targetId)) continue;
      score += effectScore(actor, target, effect, snapshot);
      if (effect.type === "revive" && target.knockedOut) revived.add(targetId);
    }
  }
  score -= skill.energyCost * policy.energyCostWeight;
  if (skill.kind === "active" && ownsUltimate(battle, actor.id)) score -= skill.energyCost * policy.ultimateReserveWeight;
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

function ownsUltimate(battle: BattleEngine, actorId: string): boolean {
  return battle.ownedSkills(actorId).some((skill) => skill.kind === "ultimate");
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

// Guard's energy gain is wasted at full energy; refusing low-HP guard there bounds
// consecutive guards (<= 5) and prevents mutual-guard soft locks.
function canGuardForValue(actor: UnitSnapshot): boolean {
  return actor.energy < MAX_ENERGY;
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
    canGuardForValue(actor) &&
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
  const guardScore = canGuardForValue(actor) && hpRatio <= policy.lowHpGuardThreshold
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

/** "All Attack" mode: always the best-scored legal basic attack (guard only when none exists). */
export function chooseAllAttackCommand(battle: BattleEngine): BattleCommand {
  const snapshot = battle.snapshot();
  const active = snapshot.activeTurn;
  if (active === null) throw new Error("Auto requires an active turn.");
  const basic = basicCandidates(battle);
  sortCandidates(basic);
  return basic[0]?.command ?? { type: "guard", actorId: active.actorId };
}

/**
 * "Repeat" mode: replays each actor's last recorded command, re-targeting when the old
 * targets became illegal and falling back to All Attack when the command cannot repeat.
 * Items, retreat and formation moves are never repeated.
 */
export class RepeatAutoController {
  readonly #last = new Map<string, BattleCommand>();
  readonly #policy: SmartAutoPolicy;

  constructor(policy: SmartAutoPolicy = DEFAULT_SMART_AUTO_POLICY) {
    assertSmartPolicy(policy);
    this.#policy = policy;
  }

  record(command: BattleCommand): void {
    this.#last.set(command.actorId, command);
  }

  choose(battle: BattleEngine): BattleCommand {
    const snapshot = battle.snapshot();
    const active = snapshot.activeTurn;
    if (active === null) throw new Error("Auto requires an active turn.");
    const last = this.#last.get(active.actorId);
    const command = last === undefined ? chooseAllAttackCommand(battle) : this.#repeat(battle, last);
    this.record(command);
    return command;
  }

  #repeat(battle: BattleEngine, last: BattleCommand): BattleCommand {
    switch (last.type) {
      case "guard":
        return { type: "guard", actorId: last.actorId };
      case "skill":
      case "ultimate": {
        const actor = unitOf(battle.snapshot(), last.actorId);
        const skill = battle.ownedSkills(actor.id).find((candidate) => candidate.id === last.skillId);
        if (skill !== undefined && actor.energy >= skill.energyCost) {
          const legal = battle.legalAbilityTargets(actor.id, skill.targeting);
          if (last.targetIds.every((id) => legal.includes(id))) return last;
          const options = skillCandidates(battle, this.#policy).filter(
            (candidate) => (candidate.command.type === "skill" || candidate.command.type === "ultimate") && candidate.command.skillId === skill.id,
          );
          sortCandidates(options);
          if (options[0] !== undefined) return options[0].command;
        }
        return chooseAllAttackCommand(battle);
      }
      default:
        return chooseAllAttackCommand(battle);
    }
  }
}
