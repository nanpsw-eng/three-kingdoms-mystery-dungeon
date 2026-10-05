import assert from "node:assert/strict";
import test from "node:test";
import { BattleEngine } from "../dist/battle/battle.js";
import { BASE_EVASION_CHANCE, SURPRISE_INITIAL_ACTION_DELAY_MODIFIER, SURPRISE_INITIAL_ENERGY } from "../dist/battle/balance.js";
import { simulateBasicAutoBattle, simulateSmartBattle } from "../dist/battle/simulation.js";
import { chooseSmartCommand } from "../dist/battle/auto.js";
import { validateSkillDefinition } from "../dist/battle/action.js";
import { ACTION_DELAY_BASE } from "../dist/battle/timeline.js";
import { representativeDefinition } from "./fixtures/representative-5v5.mjs";

function p(id, side, slot, stats, extra = {}) {
  return { unit: { id, side, stats }, slot, basicAttackReach: extra.reach ?? "melee", skillIds: extra.skillIds ?? [], ...(extra.entry === undefined ? {} : { entry: extra.entry }) };
}
const base = { maxHp: 100, atk: 100, def: 100, spd: 100, int: 100 };
const unitOf = (b, id) => b.snapshot().units.find((u) => u.id === id);
const readyAt = (b, id) => b.snapshot().timeline.find((e) => e.actorId === id)?.readyAt;

// ---------- B1. Battle entry state ----------

test("B1: default entry state is full HP and zero energy", () => {
  const b = new BattleEngine({ seed: "entry-default", participants: [p("a", "ally", "front-center", base), p("e", "enemy", "front-center", base)] });
  assert.deepEqual([unitOf(b, "a").hp, unitOf(b, "a").energy], [100, 0]);
});

test("B1: entry HP and energy carry into battle", () => {
  const b = new BattleEngine({ seed: "entry", participants: [
    p("a", "ally", "front-center", base, { entry: { hp: 37, energy: 60 } }),
    p("e", "enemy", "front-center", base, { entry: { hp: 80 } }),
  ] });
  assert.deepEqual([unitOf(b, "a").hp, unitOf(b, "a").energy], [37, 60]);
  assert.deepEqual([unitOf(b, "e").hp, unitOf(b, "e").energy], [80, 0]);
});

test("B1: HP 0 at entry starts KO, off formation and timeline, revivable into its slot", () => {
  const raise = { id: "raise", kind: "active", energyCost: 0, targeting: { team: "ally", access: "any", minTargets: 1, maxTargets: 1, state: "ko" }, effects: [{ type: "revive", recipient: "targets", hpRatio: 0.1 }] };
  const b = new BattleEngine({ seed: "entry-ko", skills: [raise], participants: [
    p("healer", "ally", "rear-left", { ...base, spd: 200 }, { reach: "ranged", skillIds: ["raise"] }),
    p("downed", "ally", "front-left", base, { entry: { hp: 0 } }),
    p("e", "enemy", "front-center", base),
  ] });
  const snap = b.snapshot();
  assert.equal(unitOf(b, "downed").knockedOut, true);
  assert.deepEqual(snap.koSlots, [{ unitId: "downed", slot: "front-left" }]);
  assert.ok(!snap.allyFormation.some((x) => x.unitId === "downed"));
  assert.ok(!snap.timeline.some((x) => x.actorId === "downed"));
  assert.equal(b.nextTurn()?.actorId, "healer");
  assert.deepEqual(b.legalAbilityTargets("healer", raise.targeting), ["downed"]);
  b.execute({ type: "skill", actorId: "healer", skillId: "raise", targetIds: ["downed"] });
  assert.ok(b.snapshot().allyFormation.some((x) => x.unitId === "downed" && x.slot === "front-left"));
  assert.equal(unitOf(b, "downed").hp, 10);
});

test("B1: invalid entry state is rejected", () => {
  const mk = (entry, others = []) => () => new BattleEngine({ seed: "bad", participants: [p("a", "ally", "front-center", base, { entry }), p("e", "enemy", "front-center", base), ...others] });
  assert.throws(mk({ hp: 101 }), /Entry HP/);
  assert.throws(mk({ hp: -1 }), /Entry HP/);
  assert.throws(mk({ hp: 10.5 }), /Entry HP/);
  assert.throws(mk({ energy: 101 }), /Entry energy/);
  assert.throws(mk({ hp: 0 }), /at least one living unit per side: ally/);
  assert.throws(mk({ hp: 0 }, [p("b", "ally", "front-center", base)]), /slot already occupied/);
});

// ---------- B2. Surprise ----------

test("B2: surprising side gets initial energy and a ~20% earlier first action", () => {
  const def = (surprise) => ({ seed: "surprise", ...(surprise === undefined ? {} : { surprise }), participants: [
    p("a", "ally", "front-center", base, { entry: { energy: 90 } }),
    p("a2", "ally", "front-left", base, { entry: { hp: 0 } }),
    p("a3", "ally", "front-right", base),
    p("e", "enemy", "front-center", base),
  ] });
  const plain = new BattleEngine(def());
  const ambush = new BattleEngine(def("ally"));
  assert.equal(SURPRISE_INITIAL_ENERGY, 15); assert.equal(SURPRISE_INITIAL_ACTION_DELAY_MODIFIER, 0.8);
  assert.equal(unitOf(plain, "a3").energy, 0);
  assert.equal(unitOf(ambush, "a3").energy, 15);
  assert.equal(unitOf(ambush, "a").energy, 100);          // 90 + 15 clamped
  assert.equal(unitOf(ambush, "a2").energy, 0);           // KO at entry gets no bonus
  assert.equal(unitOf(ambush, "e").energy, 0);
  assert.equal(readyAt(plain, "a3"), ACTION_DELAY_BASE / 100);
  assert.equal(readyAt(ambush, "a3"), (ACTION_DELAY_BASE / 100) * 0.8);
  assert.equal(readyAt(ambush, "e"), ACTION_DELAY_BASE / 100);
  // equal SPD: every ambushing ally acts before the enemy
  const order = []; for (let i = 0; i < 3; i++) { const t = ambush.nextTurn(); order.push(t.actorId); ambush.execute({ type: "guard", actorId: t.actorId }); }
  assert.deepEqual(order.slice(0, 2).sort(), ["a", "a3"]); assert.equal(order[2], "e");
});

test("B2: enemy surprise mirrors the bonus; invalid value rejected", () => {
  const b = new BattleEngine({ seed: "ambushed", surprise: "enemy", participants: [p("a", "ally", "front-center", base), p("e", "enemy", "front-center", base)] });
  assert.equal(unitOf(b, "e").energy, 15); assert.equal(unitOf(b, "a").energy, 0);
  assert.equal(b.nextTurn()?.actorId, "e");
  assert.throws(() => new BattleEngine({ seed: "x", surprise: "both", participants: [p("a", "ally", "front-center", base), p("e", "enemy", "front-center", base)] }), /surprise/);
});

// ---------- B3. Evasion ----------

function duel(effect, seed = "evasion") {
  const s = { id: "s", kind: "active", energyCost: 0, targeting: { team: "enemy", access: "any", minTargets: 1, maxTargets: 1 }, effects: [effect] };
  const b = new BattleEngine({ seed, skills: [s], participants: [p("a", "ally", "front-center", { ...base, spd: 200 }, { skillIds: ["s"] }), p("e", "enemy", "front-center", base)] });
  b.nextTurn(); return b;
}

test("B3: evaded damage deals nothing, grants no hit energy and keeps the damage RNG stream untouched", () => {
  const b = duel({ type: "damage", recipient: "targets", kind: "physical", power: 30, evasionChance: 1 });
  const before = b.snapshot();
  const r = b.execute({ type: "skill", actorId: "a", skillId: "s", targetIds: ["e"] });
  assert.deepEqual(r.effects, [{ effectType: "damage", targetId: "e", applied: false, amount: 0, critical: false, targetKo: false, evaded: true }]);
  const after = b.snapshot();
  assert.equal(unitOf(b, "e").hp, 100); assert.equal(unitOf(b, "e").energy, 0);
  assert.deepEqual(after.rng, before.rng);
  assert.deepEqual(after.evasionRng, before.evasionRng); // chance(1) is a boundary: no randomness consumed
});

test("B3: evasion rolls use the dedicated evasion stream", () => {
  const b = duel({ type: "damage", recipient: "targets", kind: "physical", power: 30, evasionChance: 0.5 }, "stream");
  const before = b.snapshot();
  b.execute({ type: "skill", actorId: "a", skillId: "s", targetIds: ["e"] });
  const after = b.snapshot();
  assert.match(after.evasionRng.seedKey, /::evasion$/);
  assert.notEqual(after.evasionRng.state, before.evasionRng.state);
});

test("B3: evasionChance 0 never evades; invalid evasionChance rejected", () => {
  for (let i = 0; i < 20; i++) {
    const b = duel({ type: "damage", recipient: "targets", kind: "physical", power: 30, evasionChance: 0 }, "no-evade-" + i);
    const r = b.execute({ type: "skill", actorId: "a", skillId: "s", targetIds: ["e"] });
    assert.equal(r.effects[0].evaded, undefined); assert.ok(r.effects[0].amount > 0);
  }
  assert.throws(() => validateSkillDefinition({ id: "x", kind: "active", energyCost: 0, targeting: { team: "enemy", access: "any", minTargets: 1, maxTargets: 1 }, effects: [{ type: "damage", recipient: "targets", kind: "physical", power: 10, evasionChance: 1.5 }] }), /evasion chance/);
});

test("B3: base evasion rate over the 100-seed 5v5 batch stays near 3%", () => {
  let attempts = 0; let evaded = 0;
  for (let i = 0; i < 100; i++) {
    const b = new BattleEngine(representativeDefinition("rep-5v5-" + i));
    while (b.outcome === "ongoing") {
      if (b.nextTurn() === null) break;
      for (const e of b.execute(chooseSmartCommand(b)).effects) if (e.effectType === "damage") { attempts++; if (e.evaded) evaded++; }
    }
  }
  assert.equal(BASE_EVASION_CHANCE, 0.03);
  const rate = evaded / attempts; console.log("evasion batch: " + evaded + "/" + attempts + " = " + rate.toFixed(4));
  assert.ok(attempts > 4000, "attempts=" + attempts);
  assert.ok(rate > 0.02 && rate < 0.04, "rate=" + rate);
});

// ---------- Smart Auto anti-stall / N7 ----------

test("Smart Auto and basic auto do not soft lock when lone low-HP units would guard forever", () => {
  const def = (seed) => ({ seed, participants: [
    p("a", "ally", "front-center", { ...base, def: 400 }, { entry: { hp: 10 } }),
    p("e", "enemy", "front-center", { ...base, def: 400 }, { entry: { hp: 10 } }),
  ] });
  for (let i = 0; i < 10; i++) {
    assert.ok(["ally-victory", "enemy-victory"].includes(simulateSmartBattle(def("stall-" + i), { maxActions: 200 }).outcome));
    assert.ok(["ally-victory", "enemy-victory"].includes(simulateBasicAutoBattle(def("stall-b-" + i), { maxActions: 200 }).outcome));
  }
});

test("N7: boss battles reject retreat when retreatAllowed is false", () => {
  const b = new BattleEngine({ seed: "boss", retreatAllowed: false, participants: [p("a", "ally", "front-center", { ...base, spd: 200 }), p("boss", "enemy", "front-center", base)] });
  b.nextTurn();
  assert.throws(() => b.execute({ type: "retreat", actorId: "a" }), /Retreat is not allowed/);
  assert.equal(b.outcome, "ongoing");
});
