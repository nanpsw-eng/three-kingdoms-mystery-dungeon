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
const browser = await playwright.chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
// Fixed map seed makes the real keyboard encounter repeatable without altering game state.
await page.addInitScript(() => { Date.now = () => 1791373352662; });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e)));
const state = () => page.evaluate(() => window.__tkmd.state());
const tap = async (locator) => { if (await locator.count()) await locator.first().click({ timeout: 1500 }).catch(() => {}); };
const layouts = [];
const audit = async (screen) => {
  const metrics = await page.evaluate(() => ({
    width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
    smallTargets: [...document.querySelectorAll("button:not(:disabled)")].map((b) => ({ label: b.textContent, width: b.getBoundingClientRect().width, height: b.getBoundingClientRect().height })).filter((b) => b.width > 0 && b.height > 0 && (b.width < 44 || b.height < 44)),
    brokenImages: [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.src),
  }));
  layouts.push({ screen, ...metrics });
};

await page.goto(base, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: out + "/01-title.png", fullPage: true });
await audit("title");
await tap(page.getByRole("button", { name: "관우" }));
await tap(page.getByRole("button", { name: "장비" }));
await tap(page.getByRole("button", { name: "원정 시작" }));
for (let i = 0; i < 10 && (await state()).phase === "scene"; i += 1) await tap(page.getByRole("button", { name: "건너뛰기" }));
await page.screenshot({ path: out + "/02-dungeon.png", fullPage: true });
await audit("dungeon");

const KEY = { "0,-1": "8", "0,1": "2", "-1,0": "4", "1,0": "6", "-1,-1": "7", "1,-1": "9", "-1,1": "1", "1,1": "3" };
let steps = 0;
for (; steps < 400; steps += 1) {
  const s = await state();
  if (s.phase === "battle") break;
  if (await page.locator(".modal").count()) { await tap(page.locator(".modal .choice, .modal button.primary")); continue; }
  if (s.phase !== "dungeon") { await tap(page.getByRole("button", { name: "출발" })); continue; }
  if (s.enemies.length > 0) {
    const e = [...s.enemies].sort((a, b) => Math.max(Math.abs(a.dx), Math.abs(a.dy)) - Math.max(Math.abs(b.dx), Math.abs(b.dy)))[0];
    await page.keyboard.press(({n:"8",ne:"9",e:"6",se:"3",s:"2",sw:"1",w:"4",nw:"7"})[e.approach] ?? "5");
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
  await audit("battle");
  await tap(page.getByRole("button", { name: "공격" }));
  await tap(page.locator(".unit.targetable"));
  await tap(page.getByRole("button", { name: "공격 실행" }));
  await tap(page.getByRole("button", { name: /^자동 전투 설정/ }));
  await tap(page.getByRole("button", { name: "스마트" }));
  await tap(page.getByRole("button", { name: "×3" }));
  await tap(page.getByRole("button", { name: "패널 닫기", exact: true }));
  for (let i = 0; i < 150 && (await state()).phase === "battle"; i += 1) await page.waitForTimeout(100);
  await page.screenshot({ path: out + "/04-after-battle.png", fullPage: true });
}
await tap(page.getByRole("button", { name: "더보기", exact: true }));
await tap(page.getByRole("button", { name: /가방/ }));
await page.screenshot({ path: out + "/05-bag.png", fullPage: true });
const final = await state();
await audit("bag");
const manifestAssets = await page.evaluate(async () => {
  const manifest = await fetch("assets/manifest.json").then((r) => r.json());
  const paths = [...new Set([...manifest.nativePortraits.map((id) => "portraits/" + id + ".webp"), ...manifest.fullBodyIllustrations.map((id) => "portraits/" + id + "-full.webp"), ...manifest.tokens.map((id) => "tokens/" + id + ".svg"), manifest.tileset.image, ...(manifest.surfaces ? [manifest.surfaces.image] : []), ...Object.values(manifest.paintings ?? {}).map(p => p.image), ...Object.values(manifest.tokenOverrides ?? {})])];
  // Bound decode concurrency: large full-body art can exhaust Chromium's decoder
  // when every atlas/portrait is requested simultaneously. Still verify every file.
  const decoded = new Array(paths.length); let next = 0;
  await Promise.all(Array.from({length:4},async()=>{
    while(next < paths.length){
      const index=next++,path=paths[index],image=new Image();image.src="assets/"+path;
      try{await image.decode();decoded[index]={path,decoded:true};}
      catch(error){decoded[index]={path,decoded:false,error:String(error)};}
    }
  }));
  return decoded;
});
const fallback = await browser.newPage({ viewport: { width: 390, height: 844 } });
const fallbackErrors = [];
fallback.on("pageerror", (e) => fallbackErrors.push(String(e)));
// Successful HTTP response with undecodable art exercises the image-onerror fallback.
for (const path of ["portraits/liu-bei.webp", "tokens/liu-bei.svg", "reference/liu-bei-bust-concept-v1.jpg", "reference/liu-bei-exploration-token-concept-v2.png"]) await fallback.route("**/assets/" + path, (route) => route.fulfill({ status: 200, contentType: "application/octet-stream", body: "missing asset" }));
await fallback.goto(base, { waitUntil: "networkidle" });
const portraitFallback = await fallback.locator(".title-row img").first().getAttribute("src");
await fallback.getByRole("button", { name: "관우" }).click();
await fallback.getByRole("button", { name: "장비" }).click();
await fallback.getByRole("button", { name: "원정 시작" }).click();
for (let i = 0; i < 10 && (await fallback.evaluate(() => window.__tkmd.state())).phase === "scene"; i += 1) await fallback.getByRole("button", { name: "건너뛰기" }).click();
await fallback.screenshot({ path: out + "/06-missing-art-fallback.png", fullPage: true });
const fallbackPassed = portraitFallback?.startsWith("data:image/") && (await fallback.evaluate(() => window.__tkmd.state())).phase === "dungeon" && fallbackErrors.length === 0;
const layoutPassed = layouts.every((s) => s.scrollWidth <= s.width && s.smallTargets.length === 0 && s.brokenImages.length === 0);
console.log(JSON.stringify({ reachedBattle, steps, final, errors, layouts, manifestAssets, fallbackPassed, fallbackErrors }, null, 2));
await browser.close();
process.exit(errors.length === 0 && reachedBattle && layoutPassed && manifestAssets.every((a) => a.decoded) && fallbackPassed ? 0 : 1);
