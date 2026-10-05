import assert from "node:assert/strict";
import test from "node:test";

import { BattleEngine } from "../dist/battle/battle.js";

function p(id, side, slot, stats, reach = "melee", skillIds = []) {
  return { unit: { id, side, stats }, slot, basicAttackReach: reach, skillIds };
}

const base = { maxHp: 100, atk: 100, def: 100, spd: 100, int: 100 };

function statusSkill(id, statusType, durationRounds, magnitude, stacks) {
  return {
    id,
    kind: "active",
    energyCost: 0,
    targeting: { team: "enemy", access: "any", minTargets: 1, maxTargets: 1 },
    effects: [{
      type: "status",
      recipient: "targets",
      statusType,
      durationRounds,
      ...(magnitude === undefined ? {} : { magnitude }),
      ...(stacks === undefined ? {} : { stacks }),
    }],
  };
}

test("DOT applies at the start of each affected normal turn and duration ticks after action", () => {
  const burn = statusSkill("burn", "burn", 2, 5, 2);
  const battle = new BattleEngine({
    seed: "runtime-burn",
    skills: [burn],
    participants: [
      p("caster", "ally", "rear-left", { ...base, spd: 120 }, "ranged", ["burn"]),
      p("target", "enemy", "front-center", { ...base, spd: 100 }),
    ],
  });

  assert.equal(battle.nextTurn()?.actorId, "caster");
  battle.execute({ type: "skill", actorId: "caster", skillId: "burn", targetIds: ["target"] });

  assert.equal(battle.nextTurn()?.actorId, "target");
  assert.equal(battle.snapshot().units.find((u) => u.id === "target")?.hp, 90);
  assert.equal(battle.snapshot().statuses.find((s) => s.unitId === "target")?.statuses[0]?.remainingRounds, 2);
  battle.execute({ type: "guard", actorId: "target" });
  assert.equal(battle.snapshot().statuses.find((s) => s.unitId === "target")?.statuses[0]?.remainingRounds, 1);

  assert.equal(battle.nextTurn()?.actorId, "caster");
  battle.execute({ type: "guard", actorId: "caster" });
  assert.equal(battle.nextTurn()?.actorId, "target");
  assert.equal(battle.snapshot().units.find((u) => u.id === "target")?.hp, 80);
  battle.execute({ type: "guard", actorId: "target" });
  assert.equal(battle.snapshot().statuses.find((s) => s.unitId === "target")?.statuses.length, 0);
});

test("stun consumes one normal action and expires deterministically", () => {
  const stun = statusSkill("stun", "stun", 1);
  const battle = new BattleEngine({
    seed: "runtime-stun",
    skills: [stun],
    participants: [
      p("caster", "ally", "front-center", { ...base, spd: 120 }, "melee", ["stun"]),
      p("target", "enemy", "front-center", { ...base, spd: 100 }),
    ],
  });

  assert.equal(battle.nextTurn()?.actorId, "caster");
  battle.execute({ type: "skill", actorId: "caster", skillId: "stun", targetIds: ["target"] });

  const afterSkip = battle.nextTurn();
  assert.equal(afterSkip?.actorId, "caster");
  assert.equal(battle.snapshot().statuses.find((s) => s.unitId === "target")?.statuses.length, 0);
  assert.equal(battle.snapshot().timeline.find((e) => e.actorId === "target")?.readyAt, 200);
});

test("confusion auto-resolves a deterministic basic attack and consumes the turn", () => {
  const confusion = statusSkill("confusion", "confusion", 1);
  const battle = new BattleEngine({
    seed: "runtime-confusion",
    skills: [confusion],
    participants: [
      p("caster", "ally", "front-center", { ...base, spd: 120 }, "melee", ["confusion"]),
      p("target", "enemy", "front-center", { ...base, spd: 100 }),
    ],
  });

  assert.equal(battle.nextTurn()?.actorId, "caster");
  battle.execute({ type: "skill", actorId: "caster", skillId: "confusion", targetIds: ["target"] });
  const hpBefore = battle.snapshot().units.find((u) => u.id === "caster")?.hp ?? 0;

  const next = battle.nextTurn();
  assert.equal(next?.actorId, "caster");
  const snapshot = battle.snapshot();
  assert.ok((snapshot.units.find((u) => u.id === "caster")?.hp ?? hpBefore) < hpBefore);
  assert.equal(snapshot.units.find((u) => u.id === "target")?.energy, 18);
  assert.equal(snapshot.statuses.find((s) => s.unitId === "target")?.statuses.length, 0);
});

test("timeline-delay status shifts the next normal action before expiring", () => {
  const delay = statusSkill("slow", "timeline-delay", 1, 50);
  const battle = new BattleEngine({
    seed: "runtime-delay",
    skills: [delay],
    participants: [
      p("caster", "ally", "front-center", { ...base, spd: 120 }, "melee", ["slow"]),
      p("target", "enemy", "front-center", { ...base, spd: 100 }),
    ],
  });

  assert.equal(battle.nextTurn()?.actorId, "caster");
  battle.execute({ type: "skill", actorId: "caster", skillId: "slow", targetIds: ["target"] });
  assert.equal(battle.nextTurn()?.actorId, "target");
  battle.execute({ type: "guard", actorId: "target" });

  const snapshot = battle.snapshot();
  assert.equal(snapshot.timeline.find((e) => e.actorId === "target")?.readyAt, 250);
  assert.equal(snapshot.statuses.find((s) => s.unitId === "target")?.statuses.length, 0);
});

test("lethal DOT resolves battle before returning a dead actor turn", () => {
  const poison = statusSkill("poison", "poison", 1, 200, 1);
  const battle = new BattleEngine({
    seed: "runtime-dot-ko",
    skills: [poison],
    participants: [
      p("caster", "ally", "front-center", { ...base, spd: 120 }, "melee", ["poison"]),
      p("target", "enemy", "front-center", { ...base, maxHp: 50, spd: 100 }),
    ],
  });

  assert.equal(battle.nextTurn()?.actorId, "caster");
  battle.execute({ type: "skill", actorId: "caster", skillId: "poison", targetIds: ["target"] });
  assert.equal(battle.nextTurn(), null);
  assert.equal(battle.outcome, "ally-victory");
  assert.deepEqual(battle.snapshot().enemyFormation, []);
});
