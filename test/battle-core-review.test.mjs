import assert from "node:assert/strict";
import test from "node:test";
import { BattleEngine } from "../dist/battle/battle.js";
import { chooseSmartCommand } from "../dist/battle/auto.js";
import { simulateSmartBattle } from "../dist/battle/simulation.js";
import { representativeDefinition, REPRESENTATIVE_SKILLS } from "./fixtures/representative-5v5.mjs";

const MAX_ACTIONS = 300;

function runSmart(seed) {
  const b = new BattleEngine(representativeDefinition(seed));
  const commands = []; const effectTypes = new Set(); const commandTypes = new Set();
  while (b.outcome === "ongoing") {
    assert.ok(commands.length < MAX_ACTIONS, "soft lock: " + seed);
    const turn = b.nextTurn(); if (turn === null) break;
    const command = chooseSmartCommand(b); commands.push(command); commandTypes.add(command.type);
    for (const effect of b.execute(command).effects ?? []) if (effect.applied) effectTypes.add(effect.effectType);
  }
  return { outcome: b.outcome, hash: b.stateHash(), commands, effectTypes, commandTypes };
}

test("representative 5v5 fixture covers every implemented effect type and 5 units per side", () => {
  const types = new Set(REPRESENTATIVE_SKILLS.flatMap((skill) => skill.effects.map((effect) => effect.type)));
  assert.deepEqual([...types].sort(), ["cleanse", "damage", "energy", "formation-swap", "heal", "revive", "status", "timeline-shift"]);
  const snap = new BattleEngine(representativeDefinition("shape")).snapshot();
  assert.equal(snap.allyFormation.length, 5); assert.equal(snap.enemyFormation.length, 5);
});

const GOLDEN_5V5 = { seed: "rep-5v5-golden", outcome: "ally-victory", actions: 82, hash: "24100ca4" };

test("representative 5v5 Smart Auto battle is deterministic and matches golden result", () => {
  const first = runSmart(GOLDEN_5V5.seed); const second = runSmart(GOLDEN_5V5.seed);
  assert.equal(first.hash, second.hash); assert.deepEqual(first.commands, second.commands);
  assert.deepEqual(
    { outcome: first.outcome, actions: first.commands.length, hash: first.hash },
    { outcome: GOLDEN_5V5.outcome, actions: GOLDEN_5V5.actions, hash: GOLDEN_5V5.hash },
  );
  const sim = simulateSmartBattle(representativeDefinition(GOLDEN_5V5.seed), { maxActions: MAX_ACTIONS });
  assert.equal(sim.finalStateHash, first.hash); assert.equal(sim.actions, first.commands.length);
});

test("Manual replay of the Smart Auto command log reproduces the same state (shared command contract)", () => {
  const auto = runSmart("rep-5v5-manual-replay");
  const manual = new BattleEngine(representativeDefinition("rep-5v5-manual-replay"));
  for (const command of auto.commands) {
    const turn = manual.nextTurn(); assert.ok(turn); assert.equal(turn.actorId, command.actorId);
    manual.execute(command);
  }
  assert.equal(manual.outcome, auto.outcome); assert.equal(manual.stateHash(), auto.hash);
});

test("100 seeded representative 5v5 Smart Auto battles terminate and exercise core commands/effects", () => {
  const commandTypes = new Set(); const effectTypes = new Set();
  for (let index = 0; index < 100; index += 1) {
    const result = runSmart("rep-5v5-" + index);
    assert.ok(result.outcome === "ally-victory" || result.outcome === "enemy-victory", result.outcome);
    for (const type of result.commandTypes) commandTypes.add(type);
    for (const type of result.effectTypes) effectTypes.add(type);
  }
  for (const type of ["attack", "skill", "guard", "ultimate"]) assert.ok(commandTypes.has(type), "command unused: " + type);
  for (const type of ["damage", "status", "heal", "cleanse", "revive", "timeline-shift"]) assert.ok(effectTypes.has(type), "effect unused: " + type);
  // Smart Auto must never auto-use items or retreat (BATTLE_SPEC §10).
  assert.ok(!commandTypes.has("item") && !commandTypes.has("retreat"));
});
