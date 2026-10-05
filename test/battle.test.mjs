import assert from "node:assert/strict";
import test from "node:test";

import {
  BattleEngine,
  GUARD_DAMAGE_MULTIPLIER,
} from "../dist/battle/battle.js";

function unit(id, side, slot, stats, basicAttackReach = "melee") {
  return {
    unit: { id, side, stats },
    slot,
    basicAttackReach,
  };
}

const baseStats = { maxHp: 100, atk: 100, def: 100, spd: 100, int: 100 };

function standardBattle(seed = "battle-basic") {
  return new BattleEngine({
    seed,
    participants: [
      unit("guan-yu", "ally", "front-center", { ...baseStats, atk: 116, spd: 110 }),
      unit("huang-zhong", "ally", "rear-left", { ...baseStats, atk: 113, spd: 90 }, "ranged"),
      unit("enemy-front", "enemy", "front-center", { ...baseStats, spd: 80 }),
      unit("enemy-rear", "enemy", "rear-left", { ...baseStats, maxHp: 50, def: 70, spd: 70 }),
    ],
  });
}

test("melee basic attacks cannot target rear while enemy front survives", () => {
  const battle = standardBattle();
  const turn = battle.nextTurn();
  assert.equal(turn?.actorId, "guan-yu");
  assert.deepEqual(battle.legalBasicTargets("guan-yu"), ["enemy-front"]);
  assert.throws(
    () => battle.execute({ type: "attack", actorId: "guan-yu", targetId: "enemy-rear" }),
    /Illegal basic attack target/,
  );
});

test("ranged basic attacks can target rear units", () => {
  const battle = new BattleEngine({
    seed: "ranged",
    participants: [
      unit("huang-zhong", "ally", "rear-left", { ...baseStats, spd: 120 }, "ranged"),
      unit("front", "enemy", "front-center", { ...baseStats, spd: 80 }),
      unit("rear", "enemy", "rear-left", { ...baseStats, spd: 70 }),
    ],
  });
  assert.equal(battle.nextTurn()?.actorId, "huang-zhong");
  assert.deepEqual(battle.legalBasicTargets("huang-zhong"), ["front", "rear"]);
  const result = battle.execute({ type: "attack", actorId: "huang-zhong", targetId: "rear" });
  assert.ok((result.damage ?? 0) > 0);
});

test("rear becomes exposed after the front row collapses", () => {
  const battle = new BattleEngine({
    seed: "front-collapse",
    participants: [
      unit("ally", "ally", "front-center", { ...baseStats, atk: 500, spd: 120 }),
      unit("front", "enemy", "front-center", { ...baseStats, maxHp: 10, def: 50, spd: 70 }),
      unit("rear", "enemy", "rear-left", { ...baseStats, spd: 60 }),
    ],
  });

  assert.equal(battle.nextTurn()?.actorId, "ally");
  const result = battle.execute({ type: "attack", actorId: "ally", targetId: "front" });
  assert.equal(result.targetKo, true);
  assert.deepEqual(battle.legalBasicTargets("ally"), ["rear"]);
});

test("guard grants energy and reduces the next incoming damage until the next normal turn", () => {
  const defended = new BattleEngine({
    seed: "guard-seed",
    participants: [
      unit("guarder", "ally", "front-center", { ...baseStats, spd: 120 }),
      unit("attacker", "enemy", "front-center", { ...baseStats, atk: 120, spd: 100 }),
    ],
  });
  assert.equal(defended.nextTurn()?.actorId, "guarder");
  defended.execute({ type: "guard", actorId: "guarder" });
  assert.equal(defended.snapshot().units.find((u) => u.id === "guarder")?.energy, 20);
  assert.equal(defended.nextTurn()?.actorId, "attacker");
  const defendedHit = defended.execute({ type: "attack", actorId: "attacker", targetId: "guarder" });

  const plain = new BattleEngine({
    seed: "guard-seed",
    participants: [
      unit("guarder", "ally", "front-center", { ...baseStats, spd: 120 }),
      unit("attacker", "enemy", "front-center", { ...baseStats, atk: 120, spd: 100 }),
    ],
  });
  assert.equal(plain.nextTurn()?.actorId, "guarder");
  plain.execute({ type: "formation", actorId: "guarder", targetSlot: "front-center" });
  assert.equal(plain.nextTurn()?.actorId, "attacker");
  const plainHit = plain.execute({ type: "attack", actorId: "attacker", targetId: "guarder" });

  assert.equal(GUARD_DAMAGE_MULTIPLIER, 0.7);
  assert.ok((defendedHit.damage ?? Infinity) < (plainHit.damage ?? 0));
});

test("formation command swaps occupied slots and consumes the actor action", () => {
  const battle = new BattleEngine({
    seed: "formation",
    participants: [
      unit("fast", "ally", "front-left", { ...baseStats, spd: 120 }),
      unit("slow", "ally", "rear-left", { ...baseStats, spd: 80 }),
      unit("enemy", "enemy", "front-center", { ...baseStats, spd: 70 }),
    ],
  });
  assert.equal(battle.nextTurn()?.actorId, "fast");
  battle.execute({ type: "formation", actorId: "fast", targetSlot: "rear-left" });
  const formation = battle.snapshot().allyFormation;
  assert.deepEqual(formation, [
    { slot: "front-left", unitId: "slow" },
    { slot: "rear-left", unitId: "fast" },
  ]);
  assert.notEqual(battle.nextTurn()?.actorId, "fast");
});

test("KO removes the unit from formation and timeline and resolves victory", () => {
  const battle = new BattleEngine({
    seed: "victory",
    participants: [
      unit("ally", "ally", "front-center", { ...baseStats, atk: 500, spd: 120 }),
      unit("enemy", "enemy", "front-center", { ...baseStats, maxHp: 10, def: 50, spd: 80 }),
    ],
  });
  assert.equal(battle.nextTurn()?.actorId, "ally");
  const result = battle.execute({ type: "attack", actorId: "ally", targetId: "enemy" });
  assert.equal(result.outcome, "ally-victory");
  assert.equal(battle.outcome, "ally-victory");
  assert.deepEqual(battle.snapshot().enemyFormation, []);
  assert.equal(battle.nextTurn(), null);
});

test("same seed and same command sequence produce the same final state hash", () => {
  const play = () => {
    const battle = new BattleEngine({
      seed: "replay-001",
      participants: [
        unit("ally", "ally", "front-center", { ...baseStats, atk: 120, spd: 120 }),
        unit("enemy", "enemy", "front-center", { ...baseStats, maxHp: 200, spd: 100 }),
      ],
    });

    for (let steps = 0; steps < 4; steps += 1) {
      const turn = battle.nextTurn();
      assert.ok(turn);
      const targetId = turn.actorId === "ally" ? "enemy" : "ally";
      battle.execute({ type: "attack", actorId: turn.actorId, targetId });
    }
    return battle.stateHash();
  };

  assert.equal(play(), play());
});
