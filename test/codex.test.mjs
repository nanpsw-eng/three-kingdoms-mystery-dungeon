import assert from "node:assert/strict";
import test from "node:test";
import { MVP_CONTENT, buildCodex, CHARACTER_NOTES } from "../dist/content/index.js";
import { applyRunToMeta, initialMeta } from "../dist/run/index.js";

test("도감: every playable character has a 정사 note and an unlock hint", () => {
  const view = buildCodex(MVP_CONTENT, initialMeta(MVP_CONTENT));
  assert.equal(view.characters.length, MVP_CONTENT.characters.length);
  for (const c of view.characters) {
    assert.ok(CHARACTER_NOTES[c.id]?.length > 20, "note for " + c.id);
    assert.ok(c.hint.length > 0, "hint for " + c.id);
  }
  assert.equal(Object.keys(CHARACTER_NOTES).filter((id) => !MVP_CONTENT.characters.some((c) => c.id === id)).length, 0);
  const lu = view.characters.find((c) => c.id === "lu-bu");
  assert.equal(lu.unlocked, false);
  assert.match(lu.hint, /등용/);
  assert.equal(lu.campaign, "반동탁연합");
});

test("도감: bosses (incl. later phases) are listed by campaign order; achievements track meta", () => {
  let meta = initialMeta(MVP_CONTENT);
  let view = buildCodex(MVP_CONTENT, meta);
  assert.equal(view.bosses.length, MVP_CONTENT.enemyGroups.filter((g) => g.boss).length);
  assert.ok(view.bosses.every((b) => !b.defeated));
  assert.deepEqual(view.bosses.slice(0, 3).map((b) => b.campaign), ["황건적의 난", "황건적의 난", "황건적의 난"]);
  assert.equal(view.bosses.at(-1).campaign, "북벌");
  assert.ok(view.bosses.some((b) => b.id === "boss-mh-4"), "middle phase of a chain is listed");
  assert.ok(view.achievements.length >= 16 && view.achievements.every((a) => !a.earned));
  meta = applyRunToMeta(meta, { campaignId: "yellow-turban", cleared: true, depthReached: 15, defeatedGroups: ["boss-zhang-bao"], recruited: [], itemsSeen: ["bun"], level: 9, turns: 1, battles: 1, renown: 0 }, MVP_CONTENT);
  view = buildCodex(MVP_CONTENT, meta);
  assert.ok(view.bosses.find((b) => b.id === "boss-zhang-bao").defeated);
  assert.ok(view.achievements.find((a) => a.name === "장보 격파").earned);
  assert.ok(view.items.find((i) => i.id === "bun").seen);
  assert.ok(view.characters.find((c) => c.id === "zhuge-liang").unlocked);
});
