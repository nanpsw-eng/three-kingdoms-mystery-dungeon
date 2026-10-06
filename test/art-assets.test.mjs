import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

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
  assert.deepEqual(manifest.nativePortraits, ["liu-bei", "cao-cao", "sun-quan", "guan-yu", "zhang-fei", "zhao-yun", "huang-zhong", "zhuge-liang", "zhang-liao", "xiahou-dun", "jia-xu", "taishi-ci", "zhou-yu", "gan-ning"]);
  for (const id of manifest.nativePortraits) {
    const image = await readFile(new URL("../web/assets/portraits/" + id + ".webp", import.meta.url));
    assert.ok(image.byteLength > 10_000, id + " portrait master is present");
    assert.equal(image.subarray(0, 4).toString("ascii"), "RIFF");
    assert.equal(image.subarray(8, 12).toString("ascii"), "WEBP");
  }
});


test("ruler full-body illustrations and exploration tokens have fallback-safe manifest assets", async () => {
  assert.deepEqual(manifest.fullBodyIllustrations, ["liu-bei", "cao-cao", "sun-quan", "guan-yu", "zhang-fei", "zhao-yun", "huang-zhong", "zhuge-liang", "zhang-liao", "xiahou-dun", "jia-xu", "taishi-ci", "zhou-yu", "gan-ning"]);
  assert.deepEqual(manifest.tokens, ["liu-bei", "cao-cao", "sun-quan", "guan-yu", "zhang-fei", "zhao-yun", "huang-zhong", "zhuge-liang", "zhang-liao", "xiahou-dun", "jia-xu", "taishi-ci", "zhou-yu", "gan-ning"]);
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
