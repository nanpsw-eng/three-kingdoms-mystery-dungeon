import assert from "node:assert/strict";
import test from "node:test";
import { BattleEngine } from "../dist/battle/battle.js";
import { chooseAllAttackCommand, chooseSmartCommand, RepeatAutoController } from "../dist/battle/auto.js";
import { simulateAutoBattle } from "../dist/battle/simulation.js";
import { validateSkillDefinition } from "../dist/battle/action.js";
import { representativeDefinition } from "./fixtures/representative-5v5.mjs";

function p(id, side, slot, stats, skillIds = [], extra = {}) {
  return { unit: { id, side, stats }, slot, basicAttackReach: extra.reach ?? "melee", skillIds, ...(extra.entry ? { entry: extra.entry } : {}) };
}
const base = { maxHp: 100, atk: 100, def: 100, spd: 100, int: 100 };
const one = (team, state) => ({ team, access: "any", minTargets: 1, maxTargets: 1, ...(state ? { state } : {}) });
const unitOf = (b, id) => b.snapshot().units.find((u) => u.id === id);
const statusesOf = (b, id) => b.snapshot().statuses.find((x) => x.unitId === id)?.statuses ?? [];

// ---------- Decisions D1/D2/D3/D5 ----------

test("D1: KO clears every status on the unit", () => {
  const hex = { id: "hex", kind: "active", energyCost: 0, targeting: one("enemy"), effects: [
    { type: "status", recipient: "targets", statusType: "poison", durationRounds: 3, magnitude: 2 },
    { type: "damage", recipient: "targets", kind: "physical", power: 5000, critChance: 0, evasionChance: 0 }] };
  const b = new BattleEngine({ seed: "d1", skills: [hex], participants: [p("a", "ally", "front-center", { ...base, spd: 200 }, ["hex"]), p("e", "enemy", "front-center", base), p("e2", "enemy", "front-left", base)] });
  b.nextTurn(); b.execute({ type: "skill", actorId: "a", skillId: "hex", targetIds: ["e"] });
  assert.equal(unitOf(b, "e").knockedOut, true); assert.deepEqual(statusesOf(b, "e"), []);
});

test("D2: revived unit returns with zero energy", () => {
  const raise = { id: "raise", kind: "active", energyCost: 0, targeting: one("ally", "ko"), effects: [{ type: "revive", recipient: "targets", hpRatio: 0.5 }] };
  const b = new BattleEngine({ seed: "d2", skills: [raise], participants: [
    p("h", "ally", "rear-left", { ...base, spd: 200 }, ["raise"], { reach: "ranged", entry: { energy: 50 } }),
    p("k", "ally", "front-left", base, [], { entry: { hp: 0, energy: 80 } }), p("e", "enemy", "front-center", base)] });
  b.nextTurn(); b.execute({ type: "skill", actorId: "h", skillId: "raise", targetIds: ["k"] });
  assert.equal(unitOf(b, "k").energy, 0); assert.equal(unitOf(b, "k").hp, 50);
});

test("D3: an evaded damage hit makes the rest of that action miss the same enemy target", () => {
  const sting = { id: "sting", kind: "active", energyCost: 0, targeting: one("enemy"), effects: [
    { type: "damage", recipient: "targets", kind: "physical", power: 20, evasionChance: 1 },
    { type: "status", recipient: "targets", statusType: "stun", durationRounds: 1 },
    { type: "energy", recipient: "actor", amount: 10 }] };
  const b = new BattleEngine({ seed: "d3", skills: [sting], participants: [p("a", "ally", "front-center", { ...base, spd: 200 }, ["sting"]), p("e", "enemy", "front-center", base)] });
  b.nextTurn(); const r = b.execute({ type: "skill", actorId: "a", skillId: "sting", targetIds: ["e"] });
  assert.deepEqual(r.effects.map((e) => [e.effectType, e.applied, e.evaded ?? false]), [["damage", false, true], ["status", false, true], ["energy", true, false]]);
  assert.deepEqual(statusesOf(b, "e"), []);
});

test("D5: ally loadout is limited to 3 actives + 1 ultimate; enemies are not limited", () => {
  const s = (id, kind = "active") => ({ id, kind, energyCost: kind === "ultimate" ? 100 : 10, targeting: one("enemy"), effects: [{ type: "damage", recipient: "targets", kind: "physical", power: 20 }] });
  const skills = [s("a1"), s("a2"), s("a3"), s("a4"), s("u1", "ultimate"), s("u2", "ultimate")];
  const mk = (allySkills, enemySkills = []) => () => new BattleEngine({ seed: "d5", skills, participants: [p("a", "ally", "front-center", base, allySkills), p("e", "enemy", "front-center", base, enemySkills)] });
  assert.doesNotThrow(mk(["a1", "a2", "a3", "u1"], ["a1", "a2", "a3", "a4", "u1", "u2"]));
  assert.throws(mk(["a1", "a2", "a3", "a4"]), /Ally loadout/);
  assert.throws(mk(["u1", "u2"]), /Ally loadout/);
});

// ---------- N2 extra-action / interrupt ----------

test("N2: extra-action grants the recipient the very next action; interrupt beats it", () => {
  const rush = { id: "rush", kind: "active", energyCost: 10, targeting: { team: "self", access: "self", minTargets: 1, maxTargets: 1 }, effects: [{ type: "extra-action", recipient: "actor" }] };
  const order = { id: "order", kind: "active", energyCost: 10, targeting: one("ally"), effects: [{ type: "extra-action", recipient: "targets", mode: "interrupt" }] };
  const b = new BattleEngine({ seed: "n2", skills: [rush, order], participants: [
    p("z", "ally", "front-center", { ...base, spd: 200 }, ["rush"], { entry: { energy: 50 } }),
    p("c", "ally", "rear-left", { ...base, spd: 50 }, ["order"], { reach: "ranged" }),
    p("e", "enemy", "front-center", { ...base, spd: 150 })] });
  assert.equal(b.nextTurn().actorId, "z");
  const r = b.execute({ type: "skill", actorId: "z", skillId: "rush", targetIds: ["z"] });
  assert.deepEqual(r.effects, [{ effectType: "extra-action", targetId: "z", applied: true }]);
  const extra = b.nextTurn(); assert.deepEqual([extra.actorId, extra.kind], ["z", "extra"]);
  b.execute({ type: "attack", actorId: "z", targetId: "e" });
  assert.equal(unitOf(b, "z").energy, 40 + 18);
  assert.throws(() => validateSkillDefinition({ ...rush, energyCost: 0 }), /must cost energy/);
});

test("N2: interrupt mode schedules a priority action for an ally", () => {
  const order = { id: "order", kind: "active", energyCost: 10, targeting: one("ally"), effects: [{ type: "extra-action", recipient: "targets", mode: "interrupt" }] };
  const b = new BattleEngine({ seed: "n2i", skills: [order], participants: [
    p("c", "ally", "rear-left", { ...base, spd: 200 }, ["order"], { reach: "ranged", entry: { energy: 20 } }),
    p("g", "ally", "front-center", { ...base, spd: 50 }),
    p("e", "enemy", "front-center", { ...base, spd: 150 })] });
  b.nextTurn(); b.execute({ type: "skill", actorId: "c", skillId: "order", targetIds: ["g"] });
  const t = b.nextTurn(); assert.deepEqual([t.actorId, t.kind], ["g", "interrupt"]);
});

// ---------- N1 All Attack / Repeat ----------

test("N1: All Attack only issues basic attacks and finishes the 5v5 fixture deterministically", () => {
  const types = new Set();
  const chooser = (b) => { const c = chooseAllAttackCommand(b); types.add(c.type); return c; };
  const first = simulateAutoBattle(representativeDefinition("all-attack"), chooser, { maxActions: 400 });
  const second = simulateAutoBattle(representativeDefinition("all-attack"), chooseAllAttackCommand, { maxActions: 400 });
  assert.deepEqual(first, second); assert.deepEqual([...types], ["attack"]);
});

test("N1: Repeat replays the last command per actor and re-targets when needed", () => {
  const strike = { id: "strike", kind: "active", energyCost: 0, targeting: one("enemy"), effects: [{ type: "damage", recipient: "targets", kind: "physical", power: 30, evasionChance: 0 }] };
  const b = new BattleEngine({ seed: "repeat", skills: [strike], participants: [
    p("a", "ally", "front-center", { ...base, atk: 300, spd: 300 }, ["strike"]),
    p("e1", "enemy", "front-left", { ...base, maxHp: 40 }), p("e2", "enemy", "front-right", { ...base, maxHp: 400 })] });
  const repeat = new RepeatAutoController();
  b.nextTurn(); const manual = { type: "skill", actorId: "a", skillId: "strike", targetIds: ["e1"] };
  repeat.record(manual); b.execute(manual);
  assert.equal(unitOf(b, "e1").knockedOut, true);
  while (b.nextTurn().actorId !== "a") b.execute(chooseSmartCommand(b));
  assert.deepEqual(repeat.choose(b), { type: "skill", actorId: "a", skillId: "strike", targetIds: ["e2"] });
});

test("N1: Repeat with no history falls back to All Attack and runs the 5v5 fixture to completion", () => {
  const repeat = new RepeatAutoController();
  const result = simulateAutoBattle(representativeDefinition("repeat-5v5"), (b) => repeat.choose(b), { maxActions: 400 });
  assert.ok(["ally-victory", "enemy-victory"].includes(result.outcome));
});

// ---------- N3 Smart Auto ----------

test("N3: Smart Auto values cleansing a heavy DOT by its remaining damage", () => {
  const plague = { id: "plague", kind: "active", energyCost: 0, targeting: one("enemy"), effects: [{ type: "status", recipient: "targets", statusType: "poison", durationRounds: 5, stacks: 3, magnitude: 6 }] };
  const detox = { id: "detox", kind: "active", energyCost: 20, targeting: one("ally"), effects: [{ type: "cleanse", recipient: "targets", statusTypes: ["poison"] }] };
  const b = new BattleEngine({ seed: "n3", skills: [plague, detox], participants: [
    p("h", "ally", "rear-left", { ...base, spd: 200 }, ["detox"], { reach: "ranged", entry: { energy: 40 } }),
    p("t", "ally", "front-center", base),
    p("e", "enemy", "front-center", { ...base, def: 300, spd: 300 }, ["plague"])] });
  b.nextTurn(); b.execute({ type: "skill", actorId: "e", skillId: "plague", targetIds: ["t"] });
  while (b.nextTurn().actorId !== "h") b.execute({ type: "guard", actorId: b.snapshot().activeTurn.actorId });
  assert.deepEqual(chooseSmartCommand(b), { type: "skill", actorId: "h", skillId: "detox", targetIds: ["t"] });
});

test("N3: Smart Auto saves energy for an owned ultimate instead of spending on a marginal active", () => {
  const poke = { id: "poke", kind: "active", energyCost: 40, targeting: one("enemy"), effects: [{ type: "damage", recipient: "targets", kind: "physical", power: 30 }] };
  const ult = { id: "ult", kind: "ultimate", energyCost: 100, targeting: one("enemy"), effects: [{ type: "damage", recipient: "targets", kind: "physical", power: 50 }] };
  const mk = (skillIds) => { const b = new BattleEngine({ seed: "n3u", skills: [poke, ult], participants: [p("a", "ally", "front-center", { ...base, spd: 200 }, skillIds, { entry: { energy: 60 } }), p("e", "enemy", "front-center", { ...base, maxHp: 1000 })] }); b.nextTurn(); return chooseSmartCommand(b); };
  assert.equal(mk(["poke"]).type, "skill");
  assert.equal(mk(["poke", "ult"]).type, "attack");
});
