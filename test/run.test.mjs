import assert from "node:assert/strict";
import test from "node:test";
import { RunEngine, applyRunToMeta, initialMeta, LEVEL_EXP_TABLE } from "../dist/run/index.js";
import { MVP_CONTENT } from "../dist/content/index.js";
import { runAutopilot } from "../dist/sim/index.js";
import { TEST_CONTENT, START, walkTo } from "./fixtures/run-content.mjs";

const objectOf = (run, kind) => run.dungeon.objects().find((o) => o.kind === kind);

test("run start validates ruler + 2 unlocked generals and campaign unlocks", () => {
  assert.throws(() => new RunEngine(MVP_CONTENT, { ...START, campaignId: "yellow-turban", generalIds: ["guan-yu"] }), /exactly 2/);
  assert.throws(() => new RunEngine(MVP_CONTENT, { ...START, campaignId: "yellow-turban", generalIds: ["guan-yu", "zhuge-liang"] }), /locked/);
  assert.throws(() => new RunEngine(MVP_CONTENT, { ...START, campaignId: "yellow-turban", rulerId: "guan-yu" }), /Not a ruler/);
  assert.throws(() => new RunEngine(MVP_CONTENT, { ...START, campaignId: "hulao-gate" }), /locked/);
  const run = new RunEngine(MVP_CONTENT, { ...START, campaignId: "yellow-turban" });
  assert.deepEqual([run.phase, run.level, run.gold, run.food, run.party().length, run.depth], ["dungeon", 1, 30, 100, 3, 1]);
  const slots = run.party().map((m) => m.slot);
  assert.equal(new Set(slots).size, 3);
});

test("objects: item pickup, event choice with EXP → level 2 trait picks for every member, reroll", () => {
  const run = new RunEngine(TEST_CONTENT, START);
  walkTo(run, objectOf(run, "item").pos);
  assert.ok(run.inventory().some((e) => e.kind === "item" && e.itemId === "herb"));
  walkTo(run, objectOf(run, "event").pos);
  assert.equal(run.phase, "event");
  const events = run.act({ type: "event-choice", index: 0 });
  assert.ok(events.some((e) => e.type === "level-up" && e.level === 2));
  assert.equal(run.exp, 40); assert.ok(run.exp >= LEVEL_EXP_TABLE[1]);
  assert.equal(run.phase, "trait-choice");
  const choices = run.pending().filter((p) => p.kind === "trait");
  assert.deepEqual(choices.map((c) => c.characterId).sort(), ["guan-yu", "liu-bei", "zhang-fei"]);
  for (const c of choices) { assert.equal(c.options.length, 3); assert.equal(new Set(c.options).size, 3); }
  const before = run.pending()[0].options;
  run.act({ type: "reroll-traits" });
  assert.equal(run.rerolls, 1);
  assert.equal(run.pending()[0].options.length, 3);
  const guanBefore = run.party().find((m) => m.characterId === run.pending()[0].characterId).stats;
  const pick = run.pending()[0];
  run.act({ type: "choose-trait", traitId: pick.options[0] });
  assert.ok(run.party().find((m) => m.characterId === pick.characterId).traits.includes(pick.options[0]));
  assert.notDeepEqual(before, null); assert.ok(guanBefore.maxHp > 0);
  run.act({ type: "reroll-traits" });
  assert.throws(() => run.act({ type: "reroll-traits" }), /No trait rerolls/);
});

test("recruit offer joins at the shared party level with catch-up trait picks", () => {
  const run = new RunEngine(TEST_CONTENT, START);
  walkTo(run, objectOf(run, "event").pos);
  run.act({ type: "event-choice", index: 0 });
  while (run.phase === "trait-choice") run.act({ type: "choose-trait", traitId: run.pending()[0].options[0] });
  walkTo(run, objectOf(run, "recruit").pos);
  assert.equal(run.phase, "recruit");
  const candidate = run.pending()[0].characterId;
  run.act({ type: "recruit", accept: true });
  assert.equal(run.party().length, 4);
  assert.equal(run.phase, "trait-choice");
  assert.equal(run.pending()[0].characterId, candidate);
  assert.equal(run.party().find((m) => m.characterId === candidate).hp, run.party().find((m) => m.characterId === candidate).maxHp);
});

test("items: a healing item is consumed and spends one dungeon turn", () => {
  const run = new RunEngine(TEST_CONTENT, START);
  walkTo(run, objectOf(run, "item").pos);
  const herb = run.inventory().find((e) => e.kind === "item").uid;
  const turn = run.dungeon.turn;
  run.act({ type: "use-item", uid: herb, targetId: "liu-bei" });
  assert.equal(run.dungeon.turn, turn + 1);
  assert.equal(run.inventory().length, 0);
});

test("battle: manual mode waits for ally input, enemies act automatically, victory pays rewards and loot", () => {
  const run = new RunEngine(TEST_CONTENT, START);
  walkTo(run, run.dungeon.floor.stairs);
  run.act({ type: "dungeon", command: { type: "descend" } });
  assert.equal(run.depth, 2);
  const enemy = run.dungeon.enemies()[0];
  for (let i = 0; i < 300 && run.phase === "dungeon"; i++) {
    const dir = run.dungeon.travelDirection(enemy.pos) ?? run.dungeon.frontierDirection(true);
    run.act({ type: "dungeon", command: dir ? { type: "move", direction: dir } : { type: "wait" } });
  }
  assert.equal(run.phase, "battle");
  const active = run.battle.snapshot().activeTurn;
  assert.ok(active !== null && !active.actorId.includes("#"), "manual mode should stop on an ally turn");
  const target = run.battle.legalBasicTargets(active.actorId)[0];
  const events = run.act({ type: "battle", command: { type: "attack", actorId: active.actorId, targetId: target } });
  if (run.phase === "battle") events.push(...run.act({ type: "battle-mode", mode: "smart" }));
  const ended = events.find((e) => e.type === "battle-ended");
  assert.equal(ended.outcome, "victory");
  assert.deepEqual([ended.exp, ended.gold, ended.loot], [5, 7, ["fire-pot"]]);
  assert.equal(run.gold, 37);
  assert.ok(run.inventory().some((e) => e.kind === "item" && e.itemId === "fire-pot"));
  assert.equal(run.dungeon.enemies().length, 0);
});

test("safe zone heals, sells, enhances, then the final boss clears the run and meta unlocks apply", () => {
  const run = new RunEngine(TEST_CONTENT, { ...START, battleMode: "smart" });
  walkTo(run, objectOf(run, "event").pos);
  run.act({ type: "event-choice", index: 0 }); // +100 gold
  while (run.phase === "trait-choice") run.act({ type: "choose-trait", traitId: run.pending()[0].options[0] });
  walkTo(run, run.dungeon.floor.stairs);
  run.act({ type: "dungeon", command: { type: "descend" } });
  for (let i = 0; i < 400 && run.phase !== "safe-zone"; i++) {
    if (run.phase !== "dungeon") break;
    const d = run.dungeon;
    const enemy = d.enemies()[0];
    const goal = enemy ? enemy.pos : d.floor.stairs;
    if (!enemy && d.position.x === goal.x && d.position.y === goal.y) { run.act({ type: "dungeon", command: { type: "descend" } }); continue; }
    const dir = d.travelDirection(goal) ?? d.frontierDirection(true);
    run.act({ type: "dungeon", command: dir ? { type: "move", direction: dir } : { type: "wait" } });
  }
  assert.equal(run.phase, "safe-zone");
  assert.ok(run.party().every((m) => m.hp === m.maxHp));
  const gold = run.gold;
  run.act({ type: "shop-buy", offerIndex: run.shop().findIndex((o) => o.contentId === "iron-sword") });
  assert.equal(run.gold, gold - 40);
  const sword = run.inventory().find((e) => e.kind === "equipment");
  run.act({ type: "equip", characterId: "guan-yu", uid: sword.uid });
  const atk = run.party().find((m) => m.characterId === "guan-yu").stats.atk;
  run.act({ type: "enhance", characterId: "guan-yu", slot: "weapon" });
  assert.ok(run.party().find((m) => m.characterId === "guan-yu").stats.atk > atk);
  run.act({ type: "leave-safe-zone" });
  assert.equal(run.depth, 3);
  const boss = run.dungeon.enemies().find((e) => e.boss);
  for (let i = 0; i < 400 && run.phase === "dungeon"; i++) {
    const dir = run.dungeon.travelDirection(boss.pos) ?? run.dungeon.frontierDirection(true);
    run.act({ type: "dungeon", command: dir ? { type: "move", direction: dir } : { type: "wait" } });
  }
  assert.equal(run.phase, "cleared");
  assert.throws(() => run.act({ type: "dungeon", command: { type: "wait" } }), /Run has ended/);
  const summary = run.summary();
  assert.equal(summary.cleared, true);
  const meta = applyRunToMeta(initialMeta(MVP_CONTENT), { ...summary, campaignId: "yellow-turban", depthReached: 15 }, MVP_CONTENT);
  assert.ok(meta.unlockedCampaigns.includes("hulao-gate"));
  assert.ok(meta.unlockedCharacters.includes("zhuge-liang") && meta.unlockedCharacters.includes("zhao-yun") && meta.unlockedCharacters.includes("jia-xu"));
  assert.deepEqual([meta.runs, meta.clears], [1, 1]);
});

test("victory returns KO members at 10% max HP (BATTLE_SPEC §11)", () => {
  const run = new RunEngine(TEST_CONTENT, { ...START, campaignId: "test-ko", battleMode: "smart" });
  const enemy = run.dungeon.enemies()[0];
  let ended = null;
  for (let i = 0; i < 300 && !ended; i++) {
    const dir = run.dungeon.travelDirection(enemy.pos) ?? run.dungeon.frontierDirection(true);
    ended = run.act({ type: "dungeon", command: dir ? { type: "move", direction: dir } : { type: "wait" } }).find((e) => e.type === "battle-ended") ?? null;
  }
  assert.equal(ended.outcome, "victory");
  const downed = run.party().filter((m) => m.hp === Math.round(m.maxHp * 0.1));
  assert.ok(downed.length >= 1, JSON.stringify(run.party().map((m) => [m.hp, m.maxHp])));
});

test("meta progression never carries run resources and counts runs", () => {
  let meta = initialMeta(MVP_CONTENT);
  assert.deepEqual(meta.unlockedCampaigns, ["yellow-turban"]);
  const summary = { campaignId: "yellow-turban", cleared: false, depthReached: 3, defeatedGroups: ["yt-rabble"], recruited: [], itemsSeen: ["bun"], level: 4, turns: 300, battles: 5 };
  for (let i = 0; i < 3; i++) meta = applyRunToMeta(meta, summary, MVP_CONTENT);
  assert.equal(meta.runs, 3);
  assert.ok(meta.unlockedCharacters.includes("zhou-yu"));
  assert.ok(!meta.unlockedCharacters.includes("zhao-yun"));
  assert.deepEqual(meta.codex.enemies, ["yt-rabble"]);
  assert.equal("gold" in meta || "level" in meta, false);
});

test("FR-001: autopilot runs are deterministic for the same seed", () => {
  const options = { seed: "det", campaignId: "yellow-turban", rulerId: "cao-cao", generalIds: ["zhang-liao", "xiahou-dun"] };
  const a = runAutopilot(MVP_CONTENT, options);
  const b = runAutopilot(MVP_CONTENT, options);
  assert.deepEqual(a, b);
  assert.notEqual(a.outcome, "stalled");
});
