// Integration evidence in isolated test storage. Never mutates a player's production save.
import {chromium} from 'playwright';
import {mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const base=process.argv[2]??'http://localhost:8092',out=process.argv[3]??'visual-evidence';mkdirSync(out,{recursive:true});
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(String(e)));
const result={};
try{
 await page.goto(base,{waitUntil:'networkidle'});
 result.references=await page.evaluate(async()=>{
  const {assetPainting,assetToken,nativeAssetPortrait,fullBodyIllustration}=await import('./web/src/assets.js');
  const m=await fetch('assets/manifest.json').then(r=>r.json());
  return {paintings:Object.keys(m.paintings).filter(k=>!assetPainting(k)),rulers:['liu-bei','cao-cao','sun-quan'].map(id=>({id,source:assetToken(id)?.src,ratio:assetToken(id).naturalWidth/assetToken(id).naturalHeight,portrait:nativeAssetPortrait(id)?.startsWith('data:image/'),full:fullBodyIllustration(id)?.startsWith('data:image/')}))};
 });
 assert.deepEqual(result.references.paintings,[]);assert.ok(result.references.rulers.every(x=>x.source.includes('exploration-token-concept-v2.png')&&x.portrait&&x.full&&x.ratio!==1));
 await page.evaluate(async()=>{
  const {MVP_CONTENT:c,initialMeta}=await import('./src/index.js');
  localStorage.setItem('tkmd.meta.v1',JSON.stringify({...initialMeta(c),unlockedCharacters:c.characters.map(x=>x.id),unlockedCampaigns:c.campaigns.map(x=>x.id),codex:{characters:c.characters.map(x=>x.id),enemies:c.enemyGroups.map(x=>x.id),items:[...c.items,...c.equipment].map(x=>x.id)},achievements:c.unlocks.map(x=>x.unlock.achievement).filter(Boolean)}));
  localStorage.removeItem('tkmd.save.v1');
 });
 await page.reload({waitUntil:'networkidle'});await page.getByRole('button',{name:'도감 · 업적 보기',exact:true}).click();
 for(const label of ['보스','업적','물품']){
  await page.getByRole('button',{name:new RegExp('^'+label+' ')}).click();
  await page.locator('.codex').evaluate(async el=>{await Promise.all([...el.querySelectorAll('img')].map(i=>i.decode()));});
  result[label]=await page.locator('.codex').evaluate(el=>({images:el.querySelectorAll('img').length,seals:el.querySelectorAll('.achievement-seal.earned').length,overflow:document.documentElement.scrollWidth>innerWidth,broken:[...el.querySelectorAll('img')].filter(i=>!i.naturalWidth).length}));
  assert.ok(!result[label].overflow&&!result[label].broken);assert.ok(label==='업적'?result[label].seals>0:result[label].images>0);
  await page.screenshot({path:out+'/concept-codex-'+({'보스':'bosses','업적':'achievements','물품':'items'}[label])+'.png'});
 }
 await page.getByRole('button',{name:'닫기',exact:true}).click();
 await page.locator('.campaign-details summary').click();
 await page.getByRole('button',{name:/190 반동탁연합/}).click();await page.locator('button.pick').filter({hasText:'관우'}).click();await page.locator('button.pick').filter({hasText:'장비'}).click();await page.getByRole('button',{name:'원정 시작',exact:true}).click();
 assert.ok(await page.locator('.story-backdrop').count()>0);await page.locator('.story-backdrop').evaluate(i=>i.decode());await page.screenshot({path:out+'/concept-story.png'});
 result.story={backdrop:true,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)};assert.ok(!result.story.overflow);
 // Real renderer with an exact-cell fixture containing every integrated object.
 result.map=await page.evaluate(async()=>{
  const {drawMap}=await import('./web/src/map.js'),{assetPainting,assetToken}=await import('./web/src/assets.js');
  const {fieldSprite}=await import('./web/src/field-art.js');
  const calls=new Set();const original=CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage=function(image,...args){for(const key of ['stairs','gate','trap','sorcery','chest','pot','fog','environment']){const p=assetPainting('map:'+key);if(p&&image===p.image&&args[0]===p.sx&&args[1]===p.sy&&args[2]===p.width&&args[3]===p.height)calls.add(key)};for(const key of ['stairs','gate','trap','treasure','sword','rice','liu-bei']){const p=fieldSprite(key);if(p&&image===p.image&&args[0]===p.sx&&args[1]===p.sy&&args[2]===p.width&&args[3]===p.height)calls.add('mini:'+key)};return original.call(this,image,...args);};
  const canvas=document.createElement('canvas');canvas.style.cssText='width:390px;height:390px';document.body.replaceChildren(canvas);
  const tile=p=>p.x<0||p.x>14||p.y<0||p.y>14?undefined:p.x===0||p.x===14||p.y===0||p.y===14?'wall':p.x===4&&p.y===4?'gate':'room';
  const d={position:{x:7,y:7},facing:'s',floor:{stairs:{x:3,y:4},modifier:'fog'},tile,isExplored:p=>tile(p)!==undefined,isVisible:p=>p.x<11,
   revealedTraps:()=>[{pos:{x:5,y:4},type:'pit'}],objects:()=>[{kind:'sorcery',pos:{x:6,y:4}},{kind:'item',contentId:'iron-sword',pos:{x:8,y:4}},{kind:'item',contentId:'bun',pos:{x:9,y:4}}],visibleEnemies:()=>[]};
  try{drawMap(canvas,d,{playerKey:'liu-bei',enemyKey:()=>''});const cell=canvas.width/15, pixels=canvas.getContext('2d').getImageData(6*cell,4*cell,cell,cell).data;let sorceryInk=0;for(let i=0;i<pixels.length;i+=4)if(pixels[i]>pixels[i+1]*1.5&&pixels[i]>pixels[i+2]*1.5)sorceryInk++;return {calls:[...calls],sorceryInk,tokenSource:assetToken('liu-bei').src};}finally{CanvasRenderingContext2D.prototype.drawImage=original;}
 });
 assert.ok(result.map.sorceryInk>15,'sorcery remains a distinct vermilion seal');
 assert.ok(['mini:stairs','mini:gate','mini:trap','mini:sword','mini:rice','mini:liu-bei','fog','environment'].every(k=>result.map.calls.includes(k)));await page.screenshot({path:out+'/concept-map-objects.png'});
 await page.emulateMedia({reducedMotion:'reduce'});
 // No inaccessible motion: CSS effects respect the system preference.
 await page.evaluate(()=>{const n=document.createElement('div');n.className='unit healed guarded';n.innerHTML='<span class="tag" data-status="confusion">혼란</span>';document.body.append(n);});
 result.reducedMotion=await page.locator('.unit').evaluate(el=>getComputedStyle(el,'::before').animationName==='none');assert.ok(result.reducedMotion);
 assert.deepEqual(errors,[]);result.passed=true;
}catch(e){result.passed=false;result.failure=String(e);throw e;}finally{writeFileSync(out+'/concept-integration-result.json',JSON.stringify({...result,errors},null,2));await browser.close();}
