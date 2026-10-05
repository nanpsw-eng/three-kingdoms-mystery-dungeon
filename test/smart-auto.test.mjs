import assert from "node:assert/strict";
import test from "node:test";

import { chooseSmartCommand } from "../dist/battle/auto.js";
import { BattleEngine } from "../dist/battle/battle.js";
import { simulateSmartBattle } from "../dist/battle/simulation.js";

function p(id, side, slot, stats, reach = "melee", skillIds = []) {
  return { unit: { id, side, stats }, slot, basicAttackReach: reach, skillIds };
}

const base = { maxHp: 100, atk: 100, def: 100, spd: 100, int: 100 };
const charge = {
  id: "charge",
  kind: "active",
  energyCost: 0,
  targeting: { team: "self", access: "self", minTargets: 1, maxTargets: 1 },
  effects: [{ type: "energy", recipient: "actor", amount: 100 }],
  actionSpeedModifier: 0.1,
};
const ultimate = {
  id: "ultimate-strike",
  kind: "ultimate",
  energyCost: 100,
  targeting: { team: "enemy", access: "any", minTargets: 1, maxTargets: 1 },
  effects: [{ type: "damage", recipient: "targets", kind: "physical", power: 50, critChance: 0 }],
};

test("Smart Auto avoids wasteful ultimate when a basic attack is already lethal", () => {
  const battle = new BattleEngine({
    seed: "auto-ult-overkill",
    skills: [charge, ultimate],
    participants: [
      p("actor", "ally", "front-center", { ...base, atk: 120, spd: 120 }, "melee", ["charge", "ultimate-strike"]),
      p("enemy", "enemy", "front-center", { ...base, maxHp: 15, def: 100, spd: 20 }),
    ],
  });
  assert.equal(battle.nextTurn()?.actorId, "actor");
  battle.execute({ type: "skill", actorId: "actor", skillId: "charge", targetIds: ["actor"] });
  assert.equal(battle.nextTurn()?.actorId, "actor");
  assert.deepEqual(chooseSmartCommand(battle), {
    type: "attack", actorId: "actor", targetId: "enemy",
  });
});

test("Smart Auto uses an ultimate when its value clearly exceeds a basic attack", () => {
  const battle = new BattleEngine({
    seed: "auto-ult-value",
    skills: [charge, ultimate],
    participants: [
      p("actor", "ally", "front-center", { ...base, atk: 120, spd: 120 }, "melee", ["charge", "ultimate-strike"]),
      p("enemy", "enemy", "front-center", { ...base, maxHp: 300, def: 100, spd: 20 }),
    ],
  });
  assert.equal(battle.nextTurn()?.actorId, "actor");
  battle.execute({ type: "skill", actorId: "actor", skillId: "charge", targetIds: ["actor"] });
  assert.equal(battle.nextTurn()?.actorId, "actor");
  assert.deepEqual(chooseSmartCommand(battle), {
    type: "ultimate", actorId: "actor", skillId: "ultimate-strike", targetIds: ["enemy"],
  });
});

test("Smart Auto prioritizes useful healing on a damaged ally", () => {
  const heal = {
    id: "heal",
    kind: "active",
    energyCost: 0,
    targeting: { team: "ally", access: "any", minTargets: 1, maxTargets: 1 },
    effects: [{ type: "heal", recipient: "targets", baseHeal: 40 }],
  };
  const battle = new BattleEngine({
    seed: "auto-heal",
    skills: [heal],
    participants: [
      p("healer", "ally", "rear-left", { ...base, int: 120, spd: 120 }, "ranged", ["heal"]),
      p("ally", "ally", "front-center", { ...base, spd: 80 }),
      p("enemy", "enemy", "front-center", { ...base, atk: 180, spd: 130 }),
    ],
  });
  assert.equal(battle.nextTurn()?.actorId, "enemy");
  battle.execute({ type: "attack", actorId: "enemy", targetId: "ally" });
  assert.equal(battle.nextTurn()?.actorId, "healer");
  assert.deepEqual(chooseSmartCommand(battle), {
    type: "skill", actorId: "healer", skillId: "heal", targetIds: ["ally"],
  });
});

test("Smart Auto can prefer a high-value control skill", () => {
  const stun = {
    id: "stun",
    kind: "active",
    energyCost: 0,
    targeting: { team: "enemy", access: "any", minTargets: 1, maxTargets: 1 },
    effects: [{ type: "status", recipient: "targets", statusType: "stun", durationRounds: 1 }],
  };
  const battle = new BattleEngine({
    seed: "auto-control",
    skills: [stun],
    participants: [
      p("actor", "ally", "front-center", { ...base, spd: 120 }, "melee", ["stun"]),
      p("enemy", "enemy", "front-center", { ...base, maxHp: 500, def: 200, spd: 100 }),
    ],
  });
  assert.equal(battle.nextTurn()?.actorId, "actor");
  assert.deepEqual(chooseSmartCommand(battle), {
    type: "skill", actorId: "actor", skillId: "stun", targetIds: ["enemy"],
  });
});

test("Smart Auto never auto-uses inventory items or retreat", () => {
  const item = {
    id: "potion",
    targeting: { team: "self", access: "self", minTargets: 1, maxTargets: 1 },
    effects: [{ type: "energy", recipient: "actor", amount: 100 }],
  };
  const battle = new BattleEngine({
    seed: "auto-no-item-retreat",
    items: [item],
    inventories: { ally: ["potion"] },
    retreatAllowed: true,
    participants: [
      p("actor", "ally", "front-center", { ...base, spd: 120 }),
      p("enemy", "enemy", "front-center", { ...base, spd: 80 }),
    ],
  });
  assert.equal(battle.nextTurn()?.actorId, "actor");
  const command = chooseSmartCommand(battle);
  assert.notEqual(command.type, "item");
  assert.notEqual(command.type, "retreat");
});

test("skill-aware Smart Auto simulation is deterministic", () => {
  const strike = {
    id: "strike",
    kind: "active",
    energyCost: 0,
    targeting: { team: "enemy", access: "any", minTargets: 1, maxTargets: 1 },
    effects: [{ type: "damage", recipient: "targets", kind: "physical", power: 28, critChance: 0 }],
  };
  const definition = (seed) => ({
    seed,
    skills: [strike],
    participants: [
      p("ally", "ally", "front-center", { ...base, atk: 110, spd: 105 }, "melee", ["strike"]),
      p("enemy", "enemy", "front-center", { ...base, atk: 108, spd: 102 }, "melee", ["strike"]),
    ],
  });
  assert.deepEqual(
    simulateSmartBattle(definition("smart-replay"), { maxActions: 200 }),
    simulateSmartBattle(definition("smart-replay"), { maxActions: 200 }),
  );
});

test("100 seeded skill-aware Smart Auto battles terminate without soft lock", () => {
  const strike = {
    id: "strike",
    kind: "active",
    energyCost: 0,
    targeting: { team: "enemy", access: "any", minTargets: 1, maxTargets: 1 },
    effects: [{ type: "damage", recipient: "targets", kind: "physical", power: 28, critChance: 0 }],
  };
  let maxActions = 0;
  for (let index = 0; index < 100; index += 1) {
    const result = simulateSmartBattle({
      seed: "smart-batch-" + index,
      skills: [strike],
      participants: [
        p("ally-front", "ally", "front-center", { ...base, atk: 110, def: 105, spd: 105 }, "melee", ["strike"]),
        p("ally-rear", "ally", "rear-left", { ...base, atk: 105, spd: 100 }, "ranged", ["strike"]),
        p("enemy-front", "enemy", "front-center", { ...base, atk: 108, def: 103, spd: 102 }, "melee", ["strike"]),
        p("enemy-rear", "enemy", "rear-left", { ...base, atk: 103, spd: 98 }, "ranged", ["strike"]),
      ],
    }, { maxActions: 500 });
    maxActions = Math.max(maxActions, result.actions);
    assert.notEqual(result.outcome, "ongoing");
  }
  assert.ok(maxActions < 500);
});
