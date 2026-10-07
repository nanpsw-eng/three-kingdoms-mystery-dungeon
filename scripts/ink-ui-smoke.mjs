// Approved source material, worst-case text contrast, pointer/fallback regression.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
const base=process.argv[2]??'http://localhost:8092', out=process.argv[3]??'ink-ui-evidence';
mkdirSync(out,{recursive:true});
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:390,height:844}});
const errors=[],result={};
page.on('pageerror',e=>errors.push(String(e)));
try {
 await page.goto(base,{waitUntil:'networkidle'});
 await page.getByRole('button',{name:'도감 · 업적 보기',exact:true}).click();
 await page.locator('.codex-character').first().click();
 result.materials=await page.evaluate(async()=>{
  const {assetPainting}=await import('./web/src/assets.js');
  return ['paper','ink','vermilion','mountains'].map(name=>({name,
   source:assetPainting('ui:'+name)?.image.getAttribute('src'),
   applied:getComputedStyle(document.documentElement).getPropertyValue('--ui-'+name).includes('data:image/')}));
 });
 assert.ok(result.materials.every(m=>m.applied&&m.source.endsWith('visual-bible-approved-source.png')));
 // Worst pixel in the cropped material + actual computed overlay must pass 4.5:1.
 result.contrast=await page.evaluate(async()=>{
  const {assetPainting}=await import('./web/src/assets.js');
  const rgb=s=>s.match(/[\d.]+/g).map(Number);
  const lum=v=>v.slice(0,3).map(c=>{c/=255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4}).reduce((s,c,i)=>s+c*[.2126,.7152,.0722][i],0);
  const ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
  const audit=(key,background,foreground)=>{
   const p=assetPainting('ui:'+key),canvas=document.createElement('canvas');canvas.width=p.width;canvas.height=p.height;
   const ctx=canvas.getContext('2d');ctx.drawImage(p.image,p.sx,p.sy,p.width,p.height,0,0,p.width,p.height);
   const pixels=ctx.getImageData(0,0,p.width,p.height).data,style=getComputedStyle(background),text=rgb(getComputedStyle(foreground).color);
   const overlay=rgb(style.backgroundImage.match(/rgba\([^)]*\)/)[0]);let minimum=Infinity;
   for(let i=0;i<pixels.length;i+=4){const bg=[0,1,2].map(c=>overlay[c]*overlay[3]+pixels[i+c]*(1-overlay[3]));minimum=Math.min(minimum,ratio(bg,text));}
   return {key,minimum};
  };
  const h=document.querySelector('.codex-header h2'), pseudo=getComputedStyle(h,'::before');
  // Section strip's computed style is on its decorative pseudo-element.
  const temp=document.createElement('span');temp.style.backgroundImage=pseudo.backgroundImage;temp.style.color=getComputedStyle(h).color;document.body.append(temp);
  const heading=audit('ink',temp,temp);temp.remove();
  const nav=document.createElement('nav');nav.className='utility-bar';
  const dark=document.createElement('button');nav.append(dark);document.body.append(nav);
  const primary=document.createElement('button');primary.className='primary';document.body.append(primary);
  const result=[heading,audit('paper',document.querySelector('.codex'),document.querySelector('.codex-copy small')),audit('ink',dark,dark),audit('vermilion',primary,primary)];
  nav.remove();primary.remove();return result;
 });
 assert.ok(result.contrast.every(x=>x.minimum>=4.5),JSON.stringify(result.contrast));
 await page.screenshot({path:out+'/ink-ui-codex.png'});
 await page.getByRole('button',{name:'닫기',exact:true}).click();
 await page.screenshot({path:out+'/ink-ui-title.png',fullPage:true});
 await page.locator('button.pick').filter({hasText:'관우'}).click();
 await page.locator('button.pick').filter({hasText:'장비'}).click();
 await page.getByRole('button',{name:'원정 시작',exact:true}).click();
 for(let i=0;i<12&&(await page.evaluate(()=>window.__tkmd.state().phase))==='scene';i++)await page.getByRole('button',{name:'건너뛰기',exact:true}).click();
 await page.screenshot({path:out+'/ink-ui-dungeon.png'});
 // The texture is decorative; overlays cannot intercept movement or help.
 const before=await page.evaluate(()=>window.__tkmd.state().turn);
 await page.getByRole('button',{name:'대기',exact:true}).click();
 assert.equal(await page.evaluate(()=>window.__tkmd.state().turn),before+1);
 await page.getByRole('button',{name:'도움말',exact:true}).click();
 await page.screenshot({path:out+'/ink-ui-help.png'});
 const fallback=await browser.newPage({viewport:{width:360,height:640}});
 await fallback.route('**/visual-bible-approved-source.png',r=>r.abort());
 await fallback.goto(base,{waitUntil:'networkidle'});
 assert.equal(await fallback.evaluate(()=>document.documentElement.style.getPropertyValue('--ui-paper')),'');
 await fallback.getByRole('button',{name:'도감 · 업적 보기',exact:true}).click();
 await fallback.locator('.codex-character').first().click();
 assert.equal(await fallback.locator('.codex-character').first().getAttribute('aria-expanded'),'true');
 await fallback.screenshot({path:out+'/ink-ui-fallback.png'});
 result.fallback=true;assert.deepEqual(errors,[]);result.passed=true;
} finally {writeFileSync(out+'/ink-ui-result.json',JSON.stringify({...result,errors},null,2));await browser.close();}
console.log('PASS: approved common ink UI, contrast and fallback');
