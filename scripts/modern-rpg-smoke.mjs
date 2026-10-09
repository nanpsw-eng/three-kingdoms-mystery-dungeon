// Real production UI, isolated browser saves; no fixture changes to gameplay state.
import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
const base=process.argv[2]??"http://localhost:8092",out=process.argv[3]??"modern-evidence";mkdirSync(out,{recursive:true});
const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
const errors=[],result={};page.on("pageerror",e=>errors.push(String(e)));
const options={seed:"modern-input-check",campaignId:"yellow-turban",rulerId:"liu-bei",generalIds:["guan-yu","zhang-fei"],dungeonLayout:"compact-v2"};
const state=()=>page.evaluate(()=>window.__tkmd.state());
const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem("tkmd.save.v1")));
async function restore(opt=options){
 await page.evaluate(opt=>localStorage.setItem("tkmd.save.v1",JSON.stringify({version:1,options:opt,log:[{type:"scene"}]})),opt);
 await page.reload({waitUntil:"networkidle"});await page.getByRole("button",{name:"이어하기",exact:true}).click();
 assert.equal((await state()).phase,"dungeon");
}
const point=async(x,y)=>{const r=await page.locator(".thumb-pad").boundingBox();return {x:r.x+r.width/2+x*r.width/2,y:r.y+r.height/2+y*r.height/2};};
async function gesture(x,y,endX=x,endY=y){const a=await point(x,y),b=await point(endX,endY);await page.mouse.move(a.x,a.y);await page.mouse.down();await page.mouse.move(b.x,b.y);await page.mouse.up();}
try{
 await page.goto(base,{waitUntil:"networkidle"});
 result.assets=await page.evaluate(async()=>{
  const {fieldSprite,fieldUnit,fieldImageUrl,fieldItem}=await import("./web/src/field-art.js");
  const {MVP_CONTENT:c}=await import("./src/index.js"),{artKey}=await import("./web/src/story.js");
  const keys=["liu-bei","cao-cao","sun-quan","guan-yu","zhang-fei","zhao-yun","zhuge-liang","regular-spear","cavalry-unit","regular-archer","recruit","support-unit","spear-unit","archer-unit","mage-unit","boss-unit","rice","medicine","herb","scroll","chest","sword","spear","bow","fan","armor","treasure","gate","stairs","trap","torch","sorcery","terrain-floor","terrain-warm","terrain-wall-cap","terrain-wall-face"];
  const missing=keys.filter(k=>!fieldSprite(k));
  const characters=c.characters.filter(x=>!fieldImageUrl(x.id)||!fieldImageUrl(x.id,true)).map(x=>x.id);
  const enemies=c.enemyGroups.flatMap(g=>g.units).filter(x=>!fieldSprite(fieldUnit(artKey(x.name)))).map(x=>x.name);
  const items=[...c.items,...c.equipment].filter(x=>!fieldSprite(fieldItem(x.id))).map(x=>x.id);
  const badBounds=keys.filter(k=>{const s=fieldSprite(k);return !s||s.width<20||s.height<20||s.sx<0||s.sy<0||s.sx+s.width>s.image.naturalWidth||s.sy+s.height>s.image.naturalHeight;});
  return {missing,characters,enemies,items,badBounds,spriteCount:keys.length};
 });
 for(const k of ["missing","characters","enemies","items","badBounds"])assert.deepEqual(result.assets[k],[],k);
 await page.screenshot({path:out+"/modern-title.png",fullPage:true});
 const {dungeonLayout,...legacy}=options;
 await restore(legacy);assert.equal((await saved()).options.dungeonLayout,undefined,"old saves remain unversioned legacy");
 const old=await saved();await page.reload({waitUntil:"networkidle"});await page.getByRole("button",{name:"이어하기",exact:true}).click();assert.deepEqual(await saved(),old);
 await restore();assert.equal((await saved()).options.dungeonLayout,"compact-v2");assert.equal(await page.locator("#map").getAttribute("data-view-radius"),"4");
 result.camera=await page.evaluate(async()=>{const {mapOrigin,tileAt}=await import('./web/src/map.js');const c=document.querySelector('#map'),r=c.getBoundingClientRect();const d={position:{x:40,y:30},floor:{rooms:[{x:40,y:30,width:6,height:6}]}};return {origin:mapOrigin(d,4),center:tileAt(c,d,r.x+r.width/2,r.y+r.height/2),player:tileAt(c,d,r.x+r.width/9*1.5,r.y+r.height/9*1.5)};});
 assert.deepEqual(result.camera,{origin:{x:39,y:29},center:{x:43,y:33},player:{x:40,y:30}},"room framing and map touch share the same camera");
 const moves=[["n",0,-.7],["ne",.5,-.5],["e",.7,0],["se",.5,.5],["s",0,.7],["sw",-.5,.5],["w",-.7,0],["nw",-.5,-.5]];
 result.directions=[];
 for(const [direction,x,y] of moves){
  await restore();const before=await saved(),turn=(await state()).turn,a=await point(x,y);
  await page.mouse.move(a.x,a.y);await page.mouse.down();await page.waitForTimeout(250);
  assert.deepEqual(await saved(),before,"holding is free");await page.mouse.up();
  const after=await saved();assert.equal(after.log.length,before.log.length+1);assert.equal(after.log.at(-1).command.direction,direction);assert.equal((await state()).turn,turn+1);
  result.directions.push(direction);
 }
 await restore();const before=await saved();
 await gesture(0,-.7,0,0);assert.deepEqual(await saved(),before,"center release cancels");
 await gesture(0,-.7,1.5,0);assert.deepEqual(await saved(),before,"outside release cancels");
 await gesture(0,0);assert.deepEqual(await saved(),before,"center press is free");
 let a=await point(0,-.7);await page.mouse.move(a.x,a.y);await page.mouse.down();
 await page.locator(".thumb-pad").dispatchEvent("pointercancel",{pointerId:1});await page.mouse.up();assert.deepEqual(await saved(),before,"pointercancel is free");
 a=await point(0,-.7);await page.mouse.move(a.x,a.y);await page.mouse.down();await page.setViewportSize({width:360,height:640});await page.mouse.up();assert.deepEqual(await saved(),before,"resize aborts pending move");
 a=await point(0,-.7);await page.mouse.move(a.x,a.y);await page.mouse.down();
 await page.locator(".thumb-pad").dispatchEvent("pointerdown",{pointerId:99,isPrimary:false,button:0});await page.mouse.up();
 assert.equal((await saved()).log.length,before.log.length+1,"second pointer cannot add a move");
 await restore();const keyboardBefore=await saved();await page.locator('.pad [data-direction="n"]').focus();await page.keyboard.press("Enter");
 const keyboardAfter=await saved();assert.equal(keyboardAfter.log.length,keyboardBefore.log.length+1);assert.equal(keyboardAfter.log.at(-1).command.direction,"n","keyboard activation does not also auto-explore");
 await restore();const menuBefore=await saved();await page.getByRole("button",{name:"더보기",exact:true}).click();await page.getByRole("button",{name:"패널 닫기",exact:true}).click();assert.deepEqual(await saved(),menuBefore);
 result.layout=[];
 for(const [width,height] of [[320,568],[360,640],[390,660],[390,844],[412,915],[768,1024],[844,390]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(150);
  const m=await page.evaluate(()=>({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,
   controls:[...document.querySelectorAll('.dungeon-controls button,.utility-bar button')].map(el=>{const r=el.getBoundingClientRect();return {name:el.getAttribute('aria-label')??el.textContent,x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom,right:r.right};}),map:document.querySelector('#map').getBoundingClientRect().width}));
  assert.ok(m.scrollWidth<=width&&m.scrollHeight<=height+1,JSON.stringify(m));
  for(const b of m.controls)assert.ok(b.w>=44&&b.h>=44&&b.x>=0&&b.y>=0&&b.right<=width+1&&b.bottom<=height+1,JSON.stringify(b));
  assert.ok(m.map>=180,"map remains readable");result.layout.push(m);
  if(width===390||width===844)await page.screenshot({path:`${out}/modern-exploration-${width}x${height}.png`});
 }
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(100);
 result.contrast=await page.evaluate(()=>{
  const rgb=s=>[...s.matchAll(/rgba?\(([^)]+)\)/g)].map(m=>m[1].split(',').slice(0,3).map(Number));
  const lum=a=>a.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
  const ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
  return [...document.querySelectorAll('.exploration-header,.exploration-goal,.exploration-actions button:not(:disabled),.utility-bar button')].map(el=>{const s=getComputedStyle(el),fg=rgb(s.color)[0];let background=el;while(background&&getComputedStyle(background).backgroundColor==='rgba(0, 0, 0, 0)')background=background.parentElement;const colors=rgb(s.backgroundImage);if(!colors.length)colors.push(rgb(getComputedStyle(background).backgroundColor)[0]);return {name:el.textContent,minimum:Math.min(...colors.map(bg=>ratio(fg,bg)))};});
 });assert.ok(result.contrast.every(x=>x.minimum>=4.5),JSON.stringify(result.contrast));
 await page.emulateMedia({reducedMotion:"reduce"});result.reducedMotion=await page.evaluate(()=>{const e=document.createElement('button');e.className='unit hit';document.body.append(e);const a=getComputedStyle(e).animationName;e.remove();return a==='none';});assert.ok(result.reducedMotion);
 const fallback=await browser.newPage({viewport:{width:390,height:660}});fallback.on('pageerror',e=>errors.push(String(e)));
 await fallback.route('**/assets/modern/**',r=>r.fulfill({status:404,body:''}));await fallback.goto(base,{waitUntil:'networkidle'});
 await fallback.locator('button.pick').filter({hasText:'관우'}).click();await fallback.locator('button.pick').filter({hasText:'장비'}).click();await fallback.getByRole('button',{name:'원정 시작',exact:true}).click();
 for(let i=0;i<12&&await fallback.evaluate(()=>window.__tkmd.state().phase)==='scene';i++)await fallback.getByRole('button',{name:'건너뛰기',exact:true}).click();
 assert.equal(await fallback.evaluate(()=>window.__tkmd.state().phase),'dungeon');await fallback.getByRole('button',{name:'대기',exact:true}).click();assert.equal(await fallback.evaluate(()=>window.__tkmd.state().turn),1);
 result.fallback=true;assert.deepEqual(errors,[]);result.passed=true;
 console.log('PASS: modern shared art, 8 directions, one move on release, free cancellation, keyboard, save versions, mobile controls, contrast, reduced motion and failed-atlas fallback');
}catch(e){result.passed=false;result.failure=String(e);await page.screenshot({path:out+'/modern-failure.png',fullPage:true}).catch(()=>{});throw e;}
finally{writeFileSync(out+'/modern-result.json',JSON.stringify({...result,errors},null,2));await browser.close();}
