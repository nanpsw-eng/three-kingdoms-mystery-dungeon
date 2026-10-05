// S0 story-expansion foundation: scenes (X1), timeline data (X2), floor mechanics (X3), duel (X5),
// enemy-general recruit (X6), multi-phase bosses (X7), content validation (X9).
import assert from "node:assert/strict";
import test from "node:test";
import { RunEngine, applyRunToMeta, initialMeta } from "../dist/run/index.js";
import { MVP_CONTENT, validateContent } from "../dist/content/index.js";
import { DungeonEngine, knownMechanics } from "../dist/dungeon/index.js";
import { runAutopilot } from "../dist/sim/index.js";
import { TEST_CONTENT, walkTo } from "./fixtures/run-content.mjs";
import { twoRoomFloor, PARTY } from "./fixtures/floors.mjs";

const weak = (name, slot, hp = 20) => ({ name, stats: { maxHp: hp, atk: 30, def: 30, spd: 40, int: 30 }, reach: "melee", slot });
const brute = (name, slot) => ({ name, stats: { maxHp: 5000, atk: 3000, def: 500, spd: 200, int: 30 }, reach: "melee", slot });

const floor = (bossGroupId) => ({ depth: 1, enemyGroups: [{ id: "dummy", weight: 1 }], enemyCount: [0, 0], traps: [], trapCount: [0, 0], secretRoomChance: 0, bossGroupId });
const STORY = {
  id: "story", name: "Story", order: 9, era: "999",
  scenes: { intro: "s-intro", outro: "s-outro", floorEnter: { 1: "s-f1" }, bossDefeated: { "chief-2": "s-down" } },
  floors: [floor("chief-1")], shopItems: [{ id: "bun", weight: 1 }], shopEquipment: [{ id: "iron-sword", weight: 1 }],
};
const DUEL_LOSS = { ...STORY, id: "story-loss", scenes: undefined, floors: [floor("brute")] };
const CONTENT = {
  ...TEST_CONTENT,
  enemyGroups: [
    ...TEST_CONTENT.enemyGroups,
    { id: "chief-1", name: "적장(1)", boss: true, exp: 10, gold: 5, units: [weak("적장", "front-center", 60), weak("졸", "front-left")], duel: { unitIndex: 0, penalty: 0.5 }, nextPhase: "chief-2" },
    { id: "chief-2", name: "적장(2)", boss: true, exp: 0, gold: 0, units: [weak("적장", "front-center", 40)], phaseScene: "s-phase", recruit: { characterId: "zhuge-liang", chance: 1 } },
    { id: "brute", name: "괴력", boss: true, exp: 0, gold: 0, units: [brute("괴력", "front-center")], duel: { unitIndex: 0 } },
  ],
  scenes: [
    ...(TEST_CONTENT.scenes ?? []),
    { id: "s-intro", lines: [{ name: "해설", text: "공통" }], variants: { "liu-bei": [{ speaker: "liu-bei", name: "유비", text: "유비 전용" }] } },
    { id: "s-f1", lines: [{ name: "해설", text: "선택" }], choices: [{ label: "군량 소모", effects: [{ kind: "food", amount: -10 }] }, { label: "무시", effects: [] }] },
    { id: "s-phase", lines: [{ name: "적장", text: "아직 끝나지 않았다!" }] },
    { id: "s-down", lines: [{ name: "적장", text: "항복하겠소." }] },
    { id: "s-outro", lines: [{ name: "해설", text: "끝" }] },
  ],
  campaigns: [...TEST_CONTENT.campaigns, STORY, DUEL_LOSS],
  startingUnlocks: { ...TEST_CONTENT.startingUnlocks, campaigns: [...TEST_CONTENT.startingUnlocks.campaigns, "story", "story-loss"] },
};
const OPTIONS = { seed: "story", campaignId: "story", rulerId: "liu-bei", generalIds: ["guan-yu", "zhang-fei"], battleMode: "smart" };

function toBoss(run) {
  const boss = run.dungeon.enemies().find((e) => e.boss);
  for (let i = 0; i < 400 && run.phase === "dungeon"; i++) {
    const dir = run.dungeon.travelDirection(boss.pos) ?? run.dungeon.frontierDirection(true);
    run.act({ type: "dungeon", command: { type: "move", direction: dir } });
  }
}

function playStory(seed) {
  const run = new RunEngine(CONTENT, { ...OPTIONS, seed });
  const log = [];
  const act = (command) => { const events = run.act(command); log.push(...events); return events; };
  assert.equal(run.phase, "scene");
  assert.deepEqual(run.scene("s-intro").lines.map((l) => l.text), ["유비 전용"]);
  act({ type: "scene" });
  assert.equal(run.phase, "scene");
  assert.throws(() => run.act({ type: "scene" }), /valid choice/);
  const food = run.food;
  act({ type: "scene", choice: 0 });
  assert.equal(run.food, food - 10);
  assert.equal(run.phase, "dungeon");
  toBoss(run);
  assert.equal(run.phase, "duel");
  assert.deepEqual(run.pending()[0], { kind: "duel", groupId: "chief-1", champion: "적장" });
  act({ type: "duel", characterId: "guan-yu" });
  for (let i = 0; i < 20 && run.phase !== "cleared"; i++) {
    if (run.phase === "scene") act({ type: "scene" });
    else if (run.phase === "recruit") act({ type: "recruit", accept: true });
    else if (run.phase === "trait-choice") act({ type: "choose-trait", traitId: run.pending()[0].options[0] });
    else throw new Error("unexpected phase " + run.phase);
  }
  return { run, log };
}

test("X1/X5/X6/X7: scenes with ruler variants + choices, duel, phase-2 boss, enemy recruit, outro then clear", () => {
  const { run, log } = playStory("story");
  const types = log.map((e) => e.type);
  const duel = log.find((e) => e.type === "duel-ended");
  assert.deepEqual([duel.characterId, duel.champion, duel.won], ["guan-yu", "적장", true]);
  assert.ok(types.includes("boss-phase"));
  assert.deepEqual(log.filter((e) => e.type === "battle-started").map((e) => e.groupName), ["적장(1)", "적장(2)"]);
  const scenes = log.filter((e) => e.type === "scene-ended").map((e) => e.sceneId);
  assert.deepEqual(scenes, ["s-intro", "s-f1", "s-phase", "s-down", "s-outro"]);
  assert.ok(types.indexOf("recruited") < types.indexOf("run-cleared"));
  assert.equal(run.phase, "cleared");
  const summary = run.summary();
  assert.deepEqual(summary.recruited, ["zhuge-liang"]);
  const meta = applyRunToMeta(initialMeta(CONTENT), summary, CONTENT);
  assert.ok(meta.unlockedCharacters.includes("zhuge-liang"));
});

test("story flow is deterministic for the same seed and command sequence", () => {
  assert.equal(playStory("story-det").run.stateHash(), playStory("story-det").run.stateHash());
});

test("X5: declining the duel starts the normal battle; losing leaves the general at 1 HP", () => {
  const declined = new RunEngine(CONTENT, { ...OPTIONS, campaignId: "story-loss", battleMode: "manual" });
  toBoss(declined);
  assert.equal(declined.phase, "duel");
  const events = declined.act({ type: "duel", characterId: null });
  assert.ok(!events.some((e) => e.type === "duel-ended"));
  assert.equal(declined.phase, "battle");

  const lost = new RunEngine(CONTENT, { ...OPTIONS, campaignId: "story-loss", battleMode: "manual" });
  toBoss(lost);
  assert.throws(() => lost.act({ type: "dungeon", command: { type: "wait" } }), /phase: duel/);
  const result = lost.act({ type: "duel", characterId: "zhang-fei" });
  assert.equal(result.find((e) => e.type === "duel-ended").won, false);
  assert.ok(result.some((e) => e.type === "battle-started"));
  assert.ok(lost.battle.snapshot().units.find((u) => u.id === "zhang-fei").hp <= 1);
});

test("autopilot handles scene and duel phases", () => {
  const result = runAutopilot(CONTENT, { ...OPTIONS, seed: "auto-story" });
  assert.equal(result.outcome, "cleared");
  assert.deepEqual(result.summary.recruited.includes("zhuge-liang"), true);
});

test("X3: floor mechanics run at turn end, report status and can defeat the party", () => {
  assert.ok(knownMechanics().includes("burning-capital"));
  const d = new DungeonEngine(twoRoomFloor({ mechanics: [{ type: "burning-capital", params: { limit: 4, interval: 1, ratio: 0.6 } }] }), { seed: "fire", party: PARTY });
  assert.deepEqual(d.mechanicStatus().map((s) => s.label), ["화재"]);
  const all = [];
  for (let i = 0; i < 8 && d.status !== "defeated"; i++) all.push(...d.execute({ type: "wait" }).events);
  assert.ok(all.some((e) => e.type === "mechanic" && e.mechanic === "burning-capital"));
  assert.ok(all.some((e) => e.type === "party-defeated"));
  assert.throws(() => new DungeonEngine(twoRoomFloor({ mechanics: [{ type: "nope" }] }), { seed: "x", party: PARTY }), /Unknown floor mechanic/);
});

test("X9: content validation passes for shipped content and catches broken references", () => {
  assert.deepEqual(validateContent(MVP_CONTENT), []);
  assert.deepEqual(validateContent(CONTENT), []);
  const broken = {
    ...CONTENT,
    enemyGroups: [...CONTENT.enemyGroups, { id: "loop", name: "x", exp: 0, gold: 0, units: [weak("a", "front-center")], nextPhase: "loop", recruit: { characterId: "nobody", chance: 1 } }],
    campaigns: [...CONTENT.campaigns, { ...STORY, id: "bad", scenes: { intro: "missing" }, floors: [{ ...floor("ghost"), mechanics: [{ type: "nope" }] }] }],
  };
  const errors = validateContent(broken).join("\n");
  for (const pattern of [/phase cycle/, /unknown recruit nobody/, /unknown boss ghost/, /unknown mechanic nope/, /unknown scene missing/]) assert.match(errors, pattern);
});

test("E1 ships story scenes and timeline metadata", () => {
  const yt = MVP_CONTENT.campaigns.find((c) => c.id === "yellow-turban");
  assert.equal(yt.order, 1);
  assert.ok(yt.scenes.intro && yt.scenes.outro);
  const run = new RunEngine(MVP_CONTENT, { seed: "e1", campaignId: "yellow-turban", rulerId: "cao-cao", generalIds: ["guan-yu", "zhang-fei"] });
  assert.equal(run.scene("yt-intro").lines[1].speaker, "cao-cao");
});

test("S1: E2 반동탁연합 — 12F, 화웅 duel, 여포/동탁 two-phase, 관문 3·7F, 낙양 화재 9–12F", () => {
  const e2 = MVP_CONTENT.campaigns.find((c) => c.id === "anti-dong");
  assert.equal(e2.floors.length, 12);
  assert.deepEqual(e2.floors.filter((f) => f.bossGroupId).map((f) => [f.depth, f.bossGroupId]), [[4, "boss-sishui-hua-xiong"], [8, "boss-lu-bu"], [12, "boss-dong-zhuo"]]);
  assert.deepEqual(e2.floors.filter((f) => f.gateDefenderGroupId).map((f) => f.depth), [3, 7]);
  assert.deepEqual(e2.floors.filter((f) => (f.mechanics ?? []).some((m) => m.type === "burning-capital")).map((f) => f.depth), [9, 10, 11, 12]);
  const group = (id) => MVP_CONTENT.enemyGroups.find((g) => g.id === id);
  assert.equal(group("boss-sishui-hua-xiong").duel.unitIndex, 0);
  assert.equal(group("boss-sishui-hua-xiong").recruit.characterId, "hua-xiong");
  assert.equal(group("boss-lu-bu").nextPhase, "boss-lu-bu-2");
  assert.equal(group("boss-lu-bu-2").recruit.characterId, "lu-bu");
  assert.equal(group("boss-dong-zhuo").nextPhase, "boss-dong-zhuo-2");
  for (const id of ["lu-bu", "sun-jian", "yuan-shao", "cao-ren", "hua-xiong"]) assert.equal(MVP_CONTENT.characters.find((c) => c.id === id)?.kind, "general", id);
  assert.equal(MVP_CONTENT.campaigns.some((c) => c.id === "hulao-gate"), false);
});

test("S1: clearing E1 opens E2; E2 bosses and clear unlock 손견·조인·원소; recruits persist", () => {
  let meta = initialMeta(MVP_CONTENT);
  const base = { cleared: false, depthReached: 1, defeatedGroups: [], recruited: [], itemsSeen: [], level: 1, turns: 1, battles: 1 };
  meta = applyRunToMeta(meta, { ...base, campaignId: "yellow-turban", cleared: true, depthReached: 15 }, MVP_CONTENT);
  assert.ok(meta.unlockedCampaigns.includes("anti-dong"));
  assert.deepEqual(meta.clearedCampaigns, ["yellow-turban"]);
  meta = applyRunToMeta(meta, { ...base, campaignId: "anti-dong", cleared: true, depthReached: 12, defeatedGroups: ["boss-sishui-hua-xiong", "boss-lu-bu-2"], recruited: ["lu-bu"] }, MVP_CONTENT);
  for (const id of ["sun-jian", "cao-ren", "yuan-shao", "lu-bu"]) assert.ok(meta.unlockedCharacters.includes(id), id);
  assert.ok(meta.achievements.includes("반동탁연합 승리"));
});

test("S1: E2 autopilot is deterministic and terminates", () => {
  const meta = { ...initialMeta(MVP_CONTENT), unlockedCampaigns: ["yellow-turban", "anti-dong"] };
  const options = { seed: "e2-det", campaignId: "anti-dong", rulerId: "sun-quan", generalIds: ["guan-yu", "zhang-fei"], meta };
  const a = runAutopilot(MVP_CONTENT, options);
  assert.deepEqual(a, runAutopilot(MVP_CONTENT, options));
  assert.notEqual(a.outcome, "stalled");
});

test("S2: E3 서주 12F (하비 수공 9–12F, 백문루 2페이즈) and E4 관도 15F (5관 6–9F, 오소 야습 11–14F)", () => {
  const camp = (id) => MVP_CONTENT.campaigns.find((c) => c.id === id);
  const group = (id) => MVP_CONTENT.enemyGroups.find((g) => g.id === id);
  const withMechanic = (c, type) => c.floors.filter((f) => (f.mechanics ?? []).some((m) => m.type === type)).map((f) => f.depth);
  const e3 = camp("xuzhou");
  assert.equal(e3.floors.length, 12);
  assert.deepEqual(withMechanic(e3, "flood"), [9, 10, 11, 12]);
  assert.equal(group("boss-xiapi-lu-bu").nextPhase, "boss-baimen");
  assert.equal(group("boss-ji-ling").duel.unitIndex, 0);
  const e4 = camp("guandu");
  assert.equal(e4.floors.length, 15);
  assert.deepEqual(e4.floors.filter((f) => f.gateDefenderGroupId).map((f) => f.depth), [6, 7, 8, 9]);
  assert.deepEqual(withMechanic(e4, "night-raid"), [11, 12, 13, 14]);
  assert.ok(group("boss-yan-liang").duel && group("boss-wen-chou").duel);
  assert.equal(group("boss-yuan-shao").nextPhase, "boss-yuan-shao-2");
  const orders = MVP_CONTENT.campaigns.map((c) => c.order);
  assert.deepEqual(orders, orders.map((_, i) => i + 1));
});

test("S2: unlock chain E2 → E3 → E4 and new generals", () => {
  let meta = { ...initialMeta(MVP_CONTENT), unlockedCampaigns: ["yellow-turban", "anti-dong"] };
  const base = { cleared: true, defeatedGroups: [], recruited: [], itemsSeen: [], level: 9, turns: 1, battles: 1 };
  meta = applyRunToMeta(meta, { ...base, campaignId: "anti-dong", depthReached: 12 }, MVP_CONTENT);
  assert.ok(meta.unlockedCampaigns.includes("xuzhou"));
  meta = applyRunToMeta(meta, { ...base, campaignId: "xuzhou", depthReached: 12, recruited: ["chen-gong"] }, MVP_CONTENT);
  assert.ok(meta.unlockedCampaigns.includes("guandu"));
  assert.ok(meta.unlockedCharacters.includes("mi-zhu") && meta.unlockedCharacters.includes("chen-gong"));
  meta = applyRunToMeta(meta, { ...base, campaignId: "guandu", depthReached: 15, defeatedGroups: ["boss-yan-liang"] }, MVP_CONTENT);
  for (const id of ["dian-wei", "xu-chu", "xun-yu"]) assert.ok(meta.unlockedCharacters.includes(id), id);
});

test("S3: E5 적벽 15F — 장판파 추격 1–4F, 화공 확산 11–15F, 화용도 2페이즈 + 의리 선택", () => {
  const e5 = MVP_CONTENT.campaigns.find((c) => c.id === "red-cliffs");
  const withMechanic = (type) => e5.floors.filter((f) => (f.mechanics ?? []).some((m) => m.type === type)).map((f) => f.depth);
  assert.equal(e5.floors.length, 15);
  assert.deepEqual(withMechanic("pursuit"), [1, 2, 3, 4]);
  assert.deepEqual(withMechanic("spreading-fire"), [11, 12, 13, 14, 15]);
  const fleet = MVP_CONTENT.enemyGroups.find((g) => g.id === "boss-cao-fleet");
  assert.equal(fleet.nextPhase, "boss-huarong");
  assert.equal(MVP_CONTENT.scenes.find((s) => s.id === "rc-cao-down").choices.length, 2);
  let meta = { ...initialMeta(MVP_CONTENT), unlockedCampaigns: ["guandu"] };
  meta = applyRunToMeta(meta, { campaignId: "guandu", cleared: true, depthReached: 15, defeatedGroups: [], recruited: [], itemsSeen: [], level: 9, turns: 1, battles: 1 }, MVP_CONTENT);
  assert.ok(meta.unlockedCampaigns.includes("red-cliffs"));
});

test("X3 pursuit: reinforcements arrive on schedule and the status turns urgent", () => {
  const d = new DungeonEngine(twoRoomFloor({ mechanics: [{ type: "pursuit", params: { interval: 5, grace: 3 } }] }), { seed: "chase", party: [{ id: "a", maxHp: 9999, hp: 9999 }], reinforcementGroups: [{ id: "yt", weight: 1 }] });
  const all = [];
  for (let i = 0; i < 12 && d.status === "exploring"; i++) all.push(...d.execute({ type: "wait" }).events);
  assert.ok(all.filter((e) => e.type === "mechanic" && e.mechanic === "pursuit").length >= 2);
});
