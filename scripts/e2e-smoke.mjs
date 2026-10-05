#!/usr/bin/env node
// Optional UI smoke test (needs a Playwright install; not a repo dependency).
// Usage: npm run build:web && PORT=8091 npm run serve & node scripts/e2e-smoke.mjs http://localhost:8091 <outDir>
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:8091";
const out = process.argv[3] ?? "e2e-out";
mkdirSync(out, { recursive: true });
let playwright;
try { playwright = createRequire(import.meta.url)("playwright"); }
catch { playwright = createRequire(execSync("npm root -g").toString().trim() + "/")("playwright"); }
const browser = await playwright.chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e)));
const state = () => page.evaluate(() => window.__tkmd.state());
const tap = async (locator) => { if (await locator.count()) await locator.first().click({ timeout: 1500 }).catch(() => {}); };

await page.goto(base);
await page.screenshot({ path: out + "/01-title.png", fullPage: true });
await tap(page.getByRole("button", { name: "관우" }));
await tap(page.getByRole("button", { name: "장비" }));
await tap(page.getByRole("button", { name: "원정 시작" }));
await page.screenshot({ path: out + "/02-dungeon.png", fullPage: true });

const KEY = { "0,-1": "8", "0,1": "2", "-1,0": "4", "1,0": "6", "-1,-1": "7", "1,-1": "9", "-1,1": "1", "1,1": "3" };
let steps = 0;
for (; steps < 400; steps += 1) {
  const s = await state();
  if (s.phase === "battle") break;
  if (await page.locator(".modal").count()) { await tap(page.locator(".modal .choice, .modal button.primary")); continue; }
  if (s.phase !== "dungeon") { await tap(page.getByRole("button", { name: "출발" })); continue; }
  if (s.enemies.length > 0) {
    const e = [...s.enemies].sort((a, b) => Math.max(Math.abs(a.dx), Math.abs(a.dy)) - Math.max(Math.abs(b.dx), Math.abs(b.dy)))[0];
    await page.keyboard.press(KEY[`${Math.sign(e.dx)},${Math.sign(e.dy)}`]);
    continue;
  }
  const before = s.turn;
  await page.keyboard.press("Enter");
  const after = await state();
  if (after.phase === "dungeon" && after.turn === before) await page.keyboard.press(["6", "2", "4", "8", "3", "9"][steps % 6]);
}
const reachedBattle = (await state()).phase === "battle";
if (reachedBattle) {
  await page.screenshot({ path: out + "/03-battle.png", fullPage: true });
  await tap(page.getByRole("button", { name: "공격" }));
  await tap(page.locator(".unit.targetable"));
  await tap(page.getByRole("button", { name: "스마트" }));
  await tap(page.getByRole("button", { name: "×3" }));
  for (let i = 0; i < 150 && (await state()).phase === "battle"; i += 1) await page.waitForTimeout(100);
  await page.screenshot({ path: out + "/04-after-battle.png", fullPage: true });
}
await tap(page.getByRole("button", { name: /가방/ }));
await page.screenshot({ path: out + "/05-bag.png", fullPage: true });
const final = await state();
console.log(JSON.stringify({ reachedBattle, steps, final, errors }, null, 2));
await browser.close();
process.exit(errors.length === 0 && reachedBattle ? 0 : 1);
