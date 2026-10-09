// Isolated real camera controls + production renderer fixture, not a fabricated gameplay run.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
const base=process.argv[2]??'http://localhost:8092',out=process.argv[3]??'field-evidence';mkdirSync(out,{recursive:true});
const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));
await page.addInitScript(()=>{Date.now=()=>1791373352662;});
const state=()=>page.evaluate(()=>window.__tkmd.state());
const mapReady=radius=>page.waitForFunction(radius=>{const c=document.querySelector("#map");return c?.dataset.viewRadius===String(radius)&&c.width===c.height&&c.width>0;},radius);
try {
 await page.goto(base,{waitUntil:'networkidle'});
 await page.locator('button.pick').filter({hasText:'관우'}).click();await page.locator('button.pick').filter({hasText:'장비'}).click();await page.getByRole('button',{name:'원정 시작',exact:true}).click();
 for(let i=0;i<12&&(await state()).phase==='scene';i++)await page.getByRole('button',{name:'건너뛰기',exact:true}).click();
 assert.equal((await state()).phase,'dungeon');
 const before=await state(),oldSave=await page.evaluate(()=>localStorage.getItem('tkmd.save.v1'));
 await mapReady(4);assert.equal(await page.locator('#map').getAttribute('data-view-radius'),'4');
 await page.getByRole('button',{name:'넓게 보기',exact:true}).click();
 await mapReady(7);assert.equal(await page.locator('#map').getAttribute('data-view-radius'),'7');
 await page.getByRole('button',{name:'크게 보기',exact:true}).click();await mapReady(4);
 assert.deepEqual(await state(),before);assert.equal(await page.evaluate(()=>localStorage.getItem('tkmd.save.v1')),oldSave,'camera changes consume no action');
 const camera=[];
 for(const [width,height]of [[320,568],[390,844],[844,390]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(150);
  const m=await page.locator('.map-zoom-button').evaluate(el=>{const r=el.getBoundingClientRect();return {width:r.width,height:r.height,x:r.x,y:r.y,right:r.right,bottom:r.bottom,overflow:document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight+1};});
  assert.ok(m.width>=44&&m.height>=44&&!m.overflow&&m.x>=0&&m.y>=0&&m.right<=width&&m.bottom<=height);
  const hit=await page.evaluate(async()=>{const {tileAt}=await import('./web/src/map.js');const canvas=document.querySelector('#map'),r=canvas.getBoundingClientRect();return [4,7].map(radius=>{canvas.dataset.viewRadius=String(radius);const cell=r.width/(radius*2+1);return {center:tileAt(canvas,{position:{x:40,y:30}},r.x+r.width/2,r.y+r.height/2),offset:tileAt(canvas,{position:{x:40,y:30}},r.x+r.width/2+2*cell,r.y+r.height/2-cell)};});});
  assert.deepEqual(hit,[{center:{x:40,y:30},offset:{x:42,y:29}},{center:{x:40,y:30},offset:{x:42,y:29}}]);camera.push({width,height,...m});
 }
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(150);await page.screenshot({path:out+'/field-real-start.png'});
 const result=await page.evaluate(async()=>{
  const {drawMap}=await import('./web/src/map.js'),{fieldSprite,fieldItem,fieldUnit}=await import('./web/src/field-art.js');
  const {MVP_CONTENT}=await import('./src/index.js');
  const {ENEMY_ASSET_IDS}=await import('./web/src/assets.js');
  const keys=['liu-bei','cao-cao','sun-quan','recruit','spear-unit','archer-unit','cavalry-unit','mage-unit','guard-unit','boss-unit','rice','medicine','herb','scroll','chest','sword','spear','bow','fan','armor','treasure','gate','stairs','trap','regular-spear','regular-archer','southern-warrior','southern-archer'];
  const missing=keys.filter(k=>!fieldSprite(k)),unmapped=[...MVP_CONTENT.items,...MVP_CONTENT.equipment].filter(i=>!fieldSprite(fieldItem(i.id))).map(i=>i.id);
  const missingEnemies=MVP_CONTENT.enemyGroups.flatMap(g=>g.units).filter(u=>!fieldSprite(fieldUnit(ENEMY_ASSET_IDS[u.name]??u.name))).map(u=>u.name);
  const atlas=fieldSprite('liu-bei').image,probe=document.createElement('canvas');probe.width=atlas.naturalWidth;probe.height=atlas.naturalHeight;
  const pc=probe.getContext('2d');pc.drawImage(atlas,0,0);const alpha=pc.getImageData(0,0,probe.width,probe.height).data;
  let transparent=0;for(let i=3;i<alpha.length;i+=4)if(alpha[i]<10)transparent++;
  const sprites=keys.map(key=>({key,...Object.fromEntries(Object.entries(fieldSprite(key)).filter(([k])=>k!=='image'))}));
  const canvas=document.querySelector('#map');
  const tile=p=>Math.abs(p.x)>4||Math.abs(p.y)>4?'wall':p.x===0&&p.y===-4?'gate':'room';
  const fixture={position:{x:0,y:0},facing:'s',floor:{stairs:{x:0,y:-3}},tile,isExplored:p=>Math.abs(p.x)<=5&&Math.abs(p.y)<=5,isVisible:()=>true,
   revealedTraps:()=>[{pos:{x:3,y:3},type:'poison-needle'}],objects:()=>[{kind:'recruit',pos:{x:-3,y:-2}},{kind:'item',contentId:'bun',pos:{x:-3,y:2}},{kind:'item',contentId:'herb',pos:{x:-1,y:3}},{kind:'item',contentId:'elixir',pos:{x:1,y:3}},{kind:'item',contentId:'iron-sword',pos:{x:3,y:2}}],
   visibleEnemies:()=>[{pos:{x:2,y:-2},groupId:'spear',boss:false,state:'IDLE'},{pos:{x:3,y:-1},groupId:'archer',boss:false,state:'ALERT'},{pos:{x:-3,y:0},groupId:'mage',boss:true,state:'IDLE'},{pos:{x:2,y:1},groupId:'regular',boss:false,state:'IDLE'},{pos:{x:-2,y:1},groupId:'southern',boss:false,state:'IDLE'}]};
  const draw=()=>drawMap(canvas,fixture,{playerKey:'liu-bei',enemyKey:id=>({spear:'yt-spear',archer:'yt-archer',mage:'boss-zhang-jiao',regular:'enemy-hebei-infantry',southern:'enemy-nanman-archer'})[id],radius:4});
  draw();const first=canvas.toDataURL();draw();const stable=first===canvas.toDataURL();
  return {missing,unmapped,missingEnemies,sprites,transparentFraction:transparent/(alpha.length/4),stable};
 });
 assert.deepEqual(result.missing,[]);assert.deepEqual(result.unmapped,[]);assert.deepEqual(result.missingEnemies,[]);assert.ok(result.transparentFraction>.25&&result.stable);
 assert.ok(result.sprites.every(s=>s.width>25&&s.height>25));
 await page.screenshot({path:out+'/field-renderer-fixture.png'});
 // A missing atlas must leave the real game playable, retaining readable role markers.
 const fallback=await browser.newPage({viewport:{width:390,height:660}});fallback.on('pageerror',e=>errors.push(String(e)));
 await fallback.route('**/assets/modern/characters-v1.webp',r=>r.fulfill({status:404,body:''}));await fallback.route('**/assets/field/ink-miniatures-v1.webp',r=>r.fulfill({status:404,body:''}));await fallback.goto(base,{waitUntil:'networkidle'});
 assert.equal(await fallback.evaluate(async()=>{const {fieldSprite}=await import('./web/src/field-art.js');return !!fieldSprite('liu-bei');}),false);
 await fallback.locator('button.pick').filter({hasText:'관우'}).click();await fallback.locator('button.pick').filter({hasText:'장비'}).click();await fallback.getByRole('button',{name:'원정 시작',exact:true}).click();
 for(let i=0;i<12&&await fallback.evaluate(()=>window.__tkmd.state().phase)==='scene';i++)await fallback.getByRole('button',{name:'건너뛰기',exact:true}).click();
 assert.equal(await fallback.evaluate(()=>window.__tkmd.state().phase),'dungeon');await fallback.getByRole('button',{name:'대기',exact:true}).click();
 assert.equal(await fallback.evaluate(()=>window.__tkmd.state().turn),1);assert.deepEqual(errors,[]);
 writeFileSync(out+'/field-miniature-result.json',JSON.stringify({passed:true,camera,...result,fallbackPassed:true,errors},null,2));
 console.log('PASS: shared modern field figures and items, content coverage, camera, hit coordinates, renderer and fallback');
} finally { await browser.close(); }
