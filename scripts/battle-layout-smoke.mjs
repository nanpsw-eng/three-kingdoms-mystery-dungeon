// Real UI actions use isolated saves. The 5v5 adapter fixture tests layout, not a claimed completed run.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { representativeDefinition } from '../test/fixtures/representative-5v5.mjs';
const base=process.argv[2]??'http://localhost:8092',out=process.argv[3]??'battle-evidence';mkdirSync(out,{recursive:true});
const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:390,height:660},deviceScaleFactor:2});
await page.addInitScript(()=>{Date.now=()=>1791373352662;});
const errors=[],results=[];page.on('pageerror',e=>errors.push(String(e)));
const state=()=>page.evaluate(()=>window.__tkmd.state());
const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('tkmd.save.v1')));
const close=()=>page.getByRole('button',{name:'패널 닫기',exact:true}).click();
async function audit(label){
 const m=await page.evaluate(()=>{
  const rect=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right};};
  return {width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,
   controls:[...document.querySelectorAll('.battle-actions button,.battle-settings-row button,.modes button,.utility-bar button,.target-hint button')].map(el=>({name:el.textContent,...rect(el)})),
   units:[...document.querySelectorAll('.unit')].map(el=>({name:el.getAttribute('aria-label'),...rect(el)})),
   portraits:[...document.querySelectorAll('.unit-head img')].map(rect),
   clipped:[...document.querySelectorAll('.unit-hp,.unit-energy,.unit-meta')].filter(el=>el.scrollWidth>el.clientWidth+1).map(el=>el.textContent)};
 });
 assert.ok(m.scrollWidth<=m.width,label+' horizontal overflow');assert.ok(m.scrollHeight<=m.height+1,label+' viewport overflow');
 for(const c of m.controls)assert.ok(c.width>=44&&c.height>=44&&c.x>=0&&c.y>=0&&c.right<=m.width+1&&c.bottom<=m.height+1,label+' control '+c.name);
 assert.ok(m.portraits.every(x=>x.width>=36&&x.height>=46),label+' readable portraits');
 assert.deepEqual(m.clipped,[],label+' resources clipped');results.push({label,...m});
}
try{
 await page.goto(base,{waitUntil:'networkidle'});await page.locator('button.pick').filter({hasText:'관우'}).click();await page.locator('button.pick').filter({hasText:'장비'}).click();await page.getByRole('button',{name:'원정 시작',exact:true}).click();
 for(let i=0;i<12&&(await state()).phase==='scene';i++)await page.getByRole('button',{name:'건너뛰기',exact:true}).click();
 const keys={'0,-1':'8','0,1':'2','-1,0':'4','1,0':'6','-1,-1':'7','1,-1':'9','-1,1':'1','1,1':'3'};
 for(let i=0;i<400&&(await state()).phase!=='battle';i++){
  const s=await state();if(await page.locator('.modal').count()){await page.locator('.modal .choice,.modal button.primary').first().click();continue;}
  if(s.phase!=='dungeon'){await page.getByRole('button',{name:'출발',exact:true}).click();continue;}
  if(s.enemies.length){const e=s.enemies.sort((a,b)=>Math.max(Math.abs(a.dx),Math.abs(a.dy))-Math.max(Math.abs(b.dx),Math.abs(b.dy)))[0];await page.keyboard.press(keys[`${Math.sign(e.dx)},${Math.sign(e.dy)}`]);}
  else{await page.keyboard.press('Enter');if((await state()).turn===s.turn)await page.keyboard.press(['6','2','4','8','3','9'][i%6]);}
 }
 assert.equal((await state()).phase,'battle');
 for(const [width,height]of [[320,568],[360,640],[390,660],[390,844],[412,740],[768,1024],[844,390]]){await page.setViewportSize({width,height});await page.waitForTimeout(150);await audit(`battle-${width}x${height}`);}
 await page.setViewportSize({width:390,height:660});await page.waitForTimeout(100);await page.screenshot({path:out+'/battle-390x660.png'});
 const before=await saved();
 await page.getByRole('button',{name:'기술',exact:true}).click();assert.ok(await page.locator('.skill-option').count());assert.ok(await page.locator('.skill-option button:disabled').count());
 assert.ok(await page.getByText(/기력 \d+ 부족/).count());await page.screenshot({path:out+'/battle-skills.png'});await close();assert.deepEqual(await saved(),before,'reading skills consumes no action');
 await page.getByRole('button',{name:'물품',exact:true}).click();assert.ok(await page.getByRole('heading',{name:'전투 물품',exact:true}).isVisible());await close();assert.deepEqual(await saved(),before);
 await page.getByRole('button',{name:'전술',exact:true}).click();await page.getByRole('button',{name:'진형',exact:true}).click();
 assert.equal(await page.locator('.battle-side.ally [data-slot]').count(),5,'five legal formation slots');
 assert.equal(await page.locator('.battle-side.ally [data-slot="rear-center"]').count(),0);
 await audit('formation-selection');await page.getByRole('button',{name:'취소',exact:true}).click();assert.deepEqual(await saved(),before,'cancel is free');
 await page.getByRole('button',{name:'공격',exact:true}).click();await audit('attack-selection');await page.locator('.unit.targetable').first().click();
 assert.deepEqual(await saved(),before,'target selection consumes no action');
 for(const [width,height] of [[320,568],[390,660],[844,390]]) { await page.setViewportSize({width,height});await page.waitForTimeout(100);await audit(`attack-confirmation-${width}x${height}`); }
 await page.setViewportSize({width:390,height:660});await page.waitForTimeout(100);await page.screenshot({path:out+'/battle-confirmation.png'});
 await page.getByRole('button',{name:'취소',exact:true}).click();assert.deepEqual(await saved(),before,'attack cancel is free');
 await page.getByRole('button',{name:'공격',exact:true}).click();await page.locator('.unit.targetable').first().click();
 await page.getByRole('button',{name:'공격 실행',exact:true}).click();
 const after=await saved();assert.equal(after.log.at(-1).command.type,'attack');
 // Build genuine energy through guard commands, then select an available skill through the new sheet.
 let used=false;
 for(let i=0;i<24&&(await state()).phase==='battle';i++){
  await page.getByRole('button',{name:'기술',exact:true}).click();
  const available=page.locator('.skill-option button:not(:disabled)');
  if(await available.count()){
   const old=await saved();await available.first().click();
   if(await page.locator('.target-hint').count()){
    if(await page.locator('.unit.targetable').count() && !await page.locator('.unit.selected').count()) await page.locator('.unit.targetable').first().click();
    const execute=page.getByRole('button',{name:'실행',exact:true});if(await execute.count())await execute.click();
   }
   const next=await saved();assert.equal(next.log.length,old.log.length+1);assert.ok(['skill','ultimate'].includes(next.log.at(-1).command.type));used=true;break;
  }
  await close();await page.getByRole('button',{name:'전술',exact:true}).click();await page.getByRole('button',{name:'방어',exact:true}).click();
 }
 assert.ok(used,'actual skill can be selected and executed');
 // Real presentation adapter on canonical representative 5v5 snapshot, in a separate isolated page.
 const fixture=await browser.newPage({viewport:{width:390,height:660}});fixture.on('pageerror',e=>errors.push(String(e)));await fixture.goto(base,{waitUntil:'networkidle'});
 const definition=representativeDefinition('battle-ui-stage3');
 const installFixture=()=>fixture.evaluate(async definition=>{
  const {BattleEngine,MVP_CONTENT}=await import('./src/index.js');const {battleField}=await import('./web/src/battle-ui.js');
  const {nativeAssetPortrait}=await import('./web/src/assets.js');
  const battle=new BattleEngine(definition),snapshot=battle.snapshot();
  const names=new Map(MVP_CONTENT.characters.map(c=>[c.id,c.name]));const app=document.querySelector('#app');app.dataset.screen='battle';
  const field=battleField({snapshot,name:id=>names.get(id)??id,portrait:id=>{const img=document.createElement('img');img.className='native-portrait';img.src=nativeAssetPortrait(id);return img;},legal:new Set(),selected:new Set(),hit:new Set(),healed:new Set(),formationPicking:false,onUnit:()=>{},onSlot:()=>{}});
  app.replaceChildren(field);
 },definition);
 await installFixture();
 assert.equal(await fixture.locator('.unit').count(),10);
 for(const side of ['ally','enemy']){assert.equal(await fixture.locator(`.battle-side.${side} [data-slot^="front"]`).count(),3);assert.equal(await fixture.locator(`.battle-side.${side} [data-slot^="rear"]`).count(),2);}
 for(const [width,height]of [[360,640],[390,660],[844,390]]){
  await fixture.setViewportSize({width,height});await fixture.waitForTimeout(100);await installFixture();
  const m=await fixture.locator('.field').evaluate(el=>({overflow:document.documentElement.scrollWidth>innerWidth,units:el.querySelectorAll('.unit').length,clipped:[...el.querySelectorAll('.unit-hp,.unit-energy,.unit-meta')].filter(x=>x.scrollWidth>x.clientWidth+1).map(x=>x.textContent)}));
  assert.equal(m.units,10);assert.ok(!m.overflow);assert.deepEqual(m.clipped,[]);results.push({label:`5v5-adapter-${width}x${height}`,...m});
 }
 await fixture.setViewportSize({width:390,height:844});await fixture.waitForTimeout(100);await installFixture();await fixture.screenshot({path:out+'/battle-5v5-adapter.png'});
 assert.deepEqual(errors,[]);writeFileSync(out+'/battle-layout-result.json',JSON.stringify({passed:true,results,actualSkillUsed:used,errors},null,2));console.log('PASS: battle controls, command sheets, actual skill and 5v5 presentation adapter');
}finally{await browser.close();}
