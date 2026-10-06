import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { MVP_CONTENT } from "../dist/content/index.js";

const manifest = JSON.parse(await readFile(new URL("../web/assets/manifest.json", import.meta.url), "utf8"));
const tiles = manifest.tileset;
const itemSource = await readFile(new URL("../src/content/items.ts", import.meta.url), "utf8");
const svg = await readFile(new URL("../web/assets/" + tiles.image, import.meta.url), "utf8");

test("ink atlas covers current item/equipment IDs and required map marks", () => {
  const itemBlock = itemSource.slice(itemSource.indexOf("export const ITEMS"), itemSource.indexOf("type E ="));
  const equipmentBlock = itemSource.slice(itemSource.indexOf("const ROWS: E[] = ["), itemSource.indexOf("\n];", itemSource.indexOf("const ROWS: E[] = [")));
  const itemIds = [...itemBlock.matchAll(/\bid:\s*"([^"]+)"/g)].map((match) => match[1]);
  const equipmentIds = [...equipmentBlock.matchAll(/^\s*\["([^"]+)"/gm)].map((match) => match[1]);
  assert.ok(itemIds.length > 0, "item IDs are parsed");
  assert.ok(equipmentIds.length > 0, "equipment IDs are parsed");

  const missing = [...new Set([...itemIds, ...equipmentIds])].filter((id) => !Object.hasOwn(tiles.map, "item-" + id));
  assert.deepEqual(missing, [], "every content item/equipment ID has a manifest tile");

  for (const key of ["floor", "corridor", "wall-cap", "wall-face", "stairs", "gate", "doorway", "trap", "sorcery", "recruit", "event", "player", "enemy", "chest", "pot", "fog", "item-unknown-item"]) {
    assert.ok(Object.hasOwn(tiles.map, key), "manifest includes " + key);
  }

  const viewBox = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  assert.ok(viewBox, "atlas has a fixed cell-grid viewBox");
  const cols = Number(viewBox[1]) / tiles.tile;
  const rows = Number(viewBox[2]) / tiles.tile;
  for (const [name, cells] of Object.entries(tiles.map)) {
    for (const [x, y] of cells) {
      assert.ok(x >= 0 && y >= 0 && x < cols && y < rows, name + " cell is inside the atlas");
    }
  }
});


test("native portraits load with stable character ids", async () => {
  for (const character of MVP_CONTENT.characters) assert.ok(manifest.nativePortraits.includes(character.id), character.id + " has its own native portrait");
  for (const id of manifest.nativePortraits) {
    const image = await readFile(new URL("../web/assets/portraits/" + id + ".webp", import.meta.url));
    assert.ok(image.byteLength > 10_000, id + " portrait master is present");
    assert.equal(image.subarray(0, 4).toString("ascii"), "RIFF");
    assert.equal(image.subarray(8, 12).toString("ascii"), "WEBP");
  }
});


test("ruler full-body illustrations and exploration tokens have fallback-safe manifest assets", async () => {
  for (const character of MVP_CONTENT.characters) assert.ok(manifest.fullBodyIllustrations.includes(character.id), character.id + " has its own full-body master");
  for (const character of MVP_CONTENT.characters) assert.ok(manifest.tokens.includes(character.id), character.id + " has its own exploration token");
  for (const id of manifest.fullBodyIllustrations) {
    const image = await readFile(new URL("../web/assets/portraits/" + id + "-full.webp", import.meta.url));
    assert.ok(image.byteLength > 10_000, id + " full-body illustration is present");
    assert.equal(image.subarray(8, 12).toString("ascii"), "WEBP");
  }
  for (const id of manifest.tokens) {
    const svgToken = await readFile(new URL("../web/assets/tokens/" + id + ".svg", import.meta.url), "utf8");
    assert.match(svgToken, /<svg\b/);
    assert.match(svgToken, /viewBox="0 0 64 64"/);
  }
});


test("Yellow Turban map tokens are connected to stable enemy aliases", async () => {
  const assetsSource = await readFile(new URL("../web/src/assets.ts", import.meta.url), "utf8");
  for (const [name, id] of [["황건 창병", "yt-spear"], ["황건 궁병", "yt-archer"], ["황건 기병", "yt-raider"], ["황건 술사", "yt-sorcerer"], ["태평도 신도", "yt-chanter"], ["장보", "boss-zhang-bao"], ["장량", "boss-zhang-liang"], ["장각", "boss-zhang-jiao"]]) {
    assert.match(assetsSource, new RegExp('"' + name + '"\\s*:\\s*"' + id + '"'));
    assert.ok(manifest.tokens.includes(id), id + " is available to map rendering");
  }
});

test("all shipped enemy display names resolve to native art without historical identity substitution", async () => {
  const plan = JSON.parse(await readFile(new URL("../docs/art/PRODUCTION_ART_PLAN.json", import.meta.url), "utf8"));
  const bindings = await readFile(new URL("../web/src/art-bindings.ts", import.meta.url), "utf8");
  for (const name of new Set(MVP_CONTENT.enemyGroups.flatMap(group => group.units.map(unit => unit.name)))) {
    const id = plan.unitBindings[name];
    assert.ok(id, name + " has a stable visual identity");
    assert.ok(manifest.tokens.includes(id), name + " has a native map token");
    const portrait = manifest.sharedPortraits?.[id] ?? id;
    assert.ok(manifest.nativePortraits.includes(portrait), name + " has a native portrait or explicit ordinary-unit master");
    assert.ok(bindings.includes(JSON.stringify(name) + ": " + JSON.stringify(id)), name + " runtime binding matches the production plan");
  }
  for (const character of MVP_CONTENT.characters) assert.equal(plan.unitBindings[character.name], character.id, character.name + " uses its own identity");
});
