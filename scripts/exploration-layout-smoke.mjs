// Isolated browser storage; validates real navigation, turn contract and responsive exploration.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
const base = process.argv[2] ?? 'http://localhost:8092', out = process.argv[3] ?? 'exploration-evidence';
mkdirSync(out, {recursive:true});
const browser = await chromium.launch();
const page = await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
await page.addInitScript(() => { Date.now = () => 1791373352662; });
const errors=[], results=[];
page.on('pageerror',e=>errors.push(String(e)));
const state=()=>page.evaluate(()=>window.__tkmd.state());
const close=()=>page.getByRole('button',{name:'패널 닫기',exact:true}).click();
async function audit(label, expectedMembers = 3) {
 const metrics=await page.evaluate(()=>{
  const rect=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right};};
  const map=document.querySelector('#map');
  const controls=[...document.querySelectorAll('.dungeon-controls button,.exploration-menu-button,.map-guide-button')].map(el=>({label:el.textContent,...rect(el)}));
  return {width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,
   map:rect(map),sections:[...document.querySelector('#app').children].map(el=>({name:el.className,...rect(el)})),controls,portraits:[...document.querySelectorAll('.expedition-party img')].map(rect),
   parties:[...document.querySelectorAll('.member')].map(el=>({text:el.innerText,...rect(el)})),
   clipped:[...document.querySelectorAll('.expedition-title,.expedition-stats span,.member-info')].filter(el=>el.scrollWidth>el.clientWidth+1).map(el=>el.textContent)};
 });
 if(metrics.scrollHeight>metrics.height+1 || metrics.map.width<180) {
  writeFileSync(out+'/exploration-layout-failure.json',JSON.stringify({label,...metrics},null,2));
  await page.screenshot({path:out+'/exploration-layout-failure.png',fullPage:true});
 }
 assert.ok(metrics.scrollWidth<=metrics.width,label+' horizontal overflow');
 assert.ok(metrics.scrollHeight<=metrics.height+1,label+' viewport overflow');
 assert.ok(metrics.map.width>=180&&Math.abs(metrics.map.width-metrics.map.height)<1,label+' readable square map');
 for(const c of metrics.controls) assert.ok(c.width>=44&&c.height>=44&&c.x>=0&&c.y>=0&&c.right<=metrics.width+1&&c.bottom<=metrics.height+1,label+' control '+c.label);
 assert.ok(metrics.portraits.every(x=>x.width>=28&&x.height>=28),label+' portraits visible');
 assert.equal(metrics.parties.length,0,label+' party details stay folded');
 assert.equal(await page.locator('.field-legend,.utility-bar').count(),0,label+' no permanent legend or menu row');
 if(metrics.width<metrics.height)assert.ok(metrics.map.width>=metrics.width-1,label+' map fills portrait width');
 assert.deepEqual(metrics.clipped,[],label+' text clipping');
 results.push({label,...metrics});
}
try {
 await page.goto(base,{waitUntil:'networkidle'});
 await page.locator('button.pick').filter({hasText:'관우'}).click();
 await page.locator('button.pick').filter({hasText:'장비'}).click();
 await page.getByRole('button',{name:'원정 시작',exact:true}).click();
 for(let i=0;i<12&&(await state()).phase==='scene';i++)await page.getByRole('button',{name:'건너뛰기',exact:true}).click();
 assert.equal((await state()).phase,'dungeon');
 for(const [width,height] of [[320,568],[360,640],[390,660],[390,844],[412,740],[768,1024],[844,390]]) {
  await page.setViewportSize({width,height});await page.waitForTimeout(150);
  await audit(`${width}x${height}`);
  if(width===390||width===844)await page.screenshot({path:`${out}/exploration-${width}x${height}.png`});
 }
 await page.setViewportSize({width:390,height:660});
 assert.equal(await page.locator('.pad [data-direction]').count(),8,'all eight directions remain available');
 assert.equal(await page.getByRole('button',{name:'계단 내려가기',exact:true}).isDisabled(),true,'stairs require standing on stairs');
 // Long mechanic labels must keep the full-width map and controls usable.
 for(const [width,height] of [[360,640],[390,660],[844,390]]){
  // Resize triggers a full real-screen render; install the fixture after it settles.
  await page.setViewportSize({width,height});await page.waitForTimeout(150);
  await page.evaluate(()=>{
  const condition=document.createElement('div');condition.className='expedition-conditions';
  condition.innerHTML='<span class="urgent">火 · 火勢 증가 3턴 · 물길 개방까지 2턴</span>';
  document.querySelector('.exploration-header').append(condition);
  });
  await page.waitForTimeout(100);
  assert.equal(await page.locator('.expedition-conditions').count(),1);
  await audit(`mechanic-layout-${width}x${height}`);
 }
 await page.reload({waitUntil:'networkidle'});await page.getByRole('button',{name:'이어하기',exact:true}).click();
 await page.setViewportSize({width:390,height:660});
 const before=await state();
 await page.getByRole('button',{name:'더보기',exact:true}).click();
 await page.getByRole('button',{name:'지도 안내',exact:true}).click();
 assert.ok(await page.getByRole('heading',{name:'탐험 지도 안내'}).isVisible());
 assert.ok(await page.getByText('상자 / 항아리 / 약 주머니',{exact:true}).isVisible());
 await page.locator('.sheet').evaluate(el=>{el.scrollTop=el.scrollHeight;});
 const closeBox=await page.getByRole('button',{name:'패널 닫기',exact:true}).boundingBox();
 assert.ok(closeBox.y>=0&&closeBox.y+closeBox.height<=660);
 await close();assert.deepEqual(await state(),before,'reading legend consumes no turn');
 for(const label of ['부대','상태','기록','도움말']){
  await page.getByRole('button',{name:'더보기',exact:true}).click();
  await page.getByRole('button',{name:label,exact:true}).click();assert.ok(await page.locator('.sheet').isVisible());await close();
  assert.deepEqual(await state(),before,label+' consumes no turn');
 }
 await page.getByRole('button',{name:'더보기',exact:true}).click();
 await page.getByRole('button',{name:/^가방 /}).click();await close();assert.deepEqual(await state(),before);
 await page.getByRole('button',{name:'대기',exact:true}).click();assert.equal((await state()).turn,before.turn+1);
 await page.getByRole('button',{name:'함정 찾기',exact:true}).click();assert.equal((await state()).turn,before.turn+2);
 // Exact save restoration uses the same replay contract as production.
 const saved=await state();await page.reload({waitUntil:'networkidle'});
 await page.getByRole('button',{name:'이어하기',exact:true}).click();assert.deepEqual(await state(),saved);
 assert.deepEqual(errors,[]);
 writeFileSync(out+'/exploration-layout-result.json',JSON.stringify({passed:true,results,errors},null,2));
 console.log('PASS: exploration viewports, guide, controls, turns and save restoration');
} finally {await browser.close();}
