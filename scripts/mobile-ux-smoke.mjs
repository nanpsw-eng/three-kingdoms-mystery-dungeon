import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const base = process.argv[2] ?? 'http://localhost:8092';
const out = process.argv[3] ?? 'visual-evidence';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 660 }, deviceScaleFactor: 2 });
// Keep encounter routing deterministic without changing the production RNG.
await page.addInitScript(() => { Date.now = () => 1791373352662; });
const errors = [], results = [];
page.on('pageerror', e => errors.push(String(e)));
const state = () => page.evaluate(() => window.__tkmd.state());
const close = () => page.getByRole('button', { name: '패널 닫기', exact: true }).click();
const audit = async label => {
  const result = await page.evaluate(() => {
    const rect = el => { const r = el.getBoundingClientRect(); return { x:r.x, y:r.y, width:r.width, height:r.height, bottom:r.bottom }; };
    return { width:innerWidth, height:innerHeight, scrollWidth:document.documentElement.scrollWidth,
      controls:[...document.querySelectorAll('.dungeon-controls button, .utility-bar button, .modes button')].map(el => ({ label:el.textContent, ...rect(el) })),
      map:document.querySelector('#map') ? rect(document.querySelector('#map')) : null };
  });
  assert.ok(result.scrollWidth <= result.width, label + ' horizontal overflow');
  for (const c of result.controls) {
    assert.ok(c.width >= 44 && c.height >= 44, label + ' target: ' + c.label);
    assert.ok(c.y >= 0 && c.bottom <= result.height + 1, label + ' unreachable: ' + c.label);
  }
  if (result.map) assert.ok(Math.abs(result.map.width - result.map.height) < 1, 'square map');
  results.push({ label, ...result });
};
try {
  await page.goto(base, { waitUntil:'networkidle' });
  await page.getByRole('button', { name:'도감 · 업적 보기', exact:true }).click();
  await page.locator('.codex-entry').filter({ hasText:'유비' }).first().click();
  await page.locator('.fullbody-illustration').first().evaluate(img => img.decode());
  const headerY = await page.locator('.codex-header').evaluate(el => el.getBoundingClientRect().y);
  await page.locator('.codex-body').evaluate(el => { el.scrollTop = el.scrollHeight; });
  assert.equal(await page.locator('.codex-header').evaluate(el => el.getBoundingClientRect().y), headerY);
  await page.getByRole('button', { name:'닫기', exact:true }).click();
  await page.getByRole('button', { name:'관우' }).click();
  await page.getByRole('button', { name:'장비' }).click();
  await page.getByRole('button', { name:'원정 시작', exact:true }).click();
  for (let i=0; i<12 && (await state()).phase==='scene'; i++) await page.getByRole('button', { name:'건너뛰기', exact:true }).click();
  assert.equal((await state()).phase, 'dungeon');
  for (const [width,height] of [[360,640],[390,660],[390,844],[412,740],[768,1024]]) {
    await page.setViewportSize({width,height});
    await page.waitForTimeout(200);
    await audit(`dungeon-${width}x${height}`);
  }
  await page.setViewportSize({width:390,height:660});
  await page.waitForTimeout(200);
  await page.screenshot({path:out+'/mobile-ux-dungeon.png'});
  const before = await state();
  await page.getByRole('button', {name:'대기',exact:true}).click();
  assert.equal((await state()).turn, before.turn + 1, 'touch wait advances turn');
  await page.getByRole('button', {name:'부대',exact:true}).click();
  const bodies = page.locator('.fullbody-illustration');
  assert.equal(await bodies.count(), 3);
  await bodies.evaluateAll(async imgs => { await Promise.all(imgs.map(img => img.decode())); });
  await page.screenshot({path:out+'/mobile-ux-party.png'});
  await page.locator('.sheet').evaluate(el => { el.scrollTop = el.scrollHeight; });
  const closeRect = await page.getByRole('button', {name:'패널 닫기',exact:true}).boundingBox();
  assert.ok(closeRect.y >= 0 && closeRect.y + closeRect.height <= 660, 'close stays within viewport after scrolling');
  await close();
  await page.getByRole('button', {name:'도움말',exact:true}).click();
  await page.screenshot({path:out+'/mobile-ux-help.png'});
  await close();
  const keys = {'0,-1':'8','0,1':'2','-1,0':'4','1,0':'6','-1,-1':'7','1,-1':'9','-1,1':'1','1,1':'3'};
  for(let i=0;i<400 && (await state()).phase!=='battle';i++) {
    const s = await state();
    if(await page.locator('.modal').count()) { await page.locator('.modal .choice, .modal button.primary').first().click(); continue; }
    if(s.phase!=='dungeon') { await page.getByRole('button',{name:'출발',exact:true}).click(); continue; }
    if(s.enemies.length) {
      const e=s.enemies.sort((a,b)=>Math.max(Math.abs(a.dx),Math.abs(a.dy))-Math.max(Math.abs(b.dx),Math.abs(b.dy)))[0];
      await page.keyboard.press(keys[`${Math.sign(e.dx)},${Math.sign(e.dy)}`]);
    } else {
      await page.keyboard.press('Enter');
      if((await state()).turn===s.turn) await page.keyboard.press(['6','2','4','8','3','9'][i%6]);
    }
  }
  assert.equal((await state()).phase,'battle');
  await audit('battle-390x660');
  await page.getByRole('button',{name:'공격',exact:true}).click();
  await audit('battle-target-selection');
  await page.screenshot({path:out+'/mobile-ux-battle.png'});
  await page.locator('.unit.targetable').first().click();
  await page.getByRole('button',{name:'스마트',exact:true}).click();
  await page.getByRole('button',{name:'도움말',exact:true}).click();
  const saveKey = await page.evaluate(() => Object.keys(localStorage).find(k => k.includes('save')));
  assert.ok(saveKey, 'save exists');
  const paused = await page.evaluate(key => localStorage.getItem(key), saveKey);
  await page.waitForTimeout(1200);
  assert.equal(await page.evaluate(key => localStorage.getItem(key),saveKey),paused,'reading pauses automatic battle');
  await close();
  await page.getByRole('button',{name:'×3',exact:true}).click();
  for(let i=0;i<180 && (await state()).phase==='battle';i++) await page.waitForTimeout(100);
  assert.notEqual((await state()).phase,'battle','automatic battle resumes and finishes');
  const savedState = await state();
  await page.reload({waitUntil:'networkidle'});
  await page.getByRole('button',{name:'이어하기',exact:true}).click();
  assert.deepEqual(await state(), savedState, 'save and reload preserve progress');
  assert.deepEqual(errors,[]);
  writeFileSync(out+'/mobile-ux-result.json',JSON.stringify({passed:true,results,errors},null,2));
} finally { await browser.close(); }
