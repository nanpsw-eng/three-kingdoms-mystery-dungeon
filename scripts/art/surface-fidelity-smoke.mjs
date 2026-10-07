// Check native material use in the actual renderer, not just image-file existence.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const base = process.argv[2] ?? 'http://localhost:8092';
const out = process.argv[3] ?? 'visual-evidence';
mkdirSync(out, { recursive:true });
const browser = await chromium.launch();
const page = await browser.newPage({viewport:{width:900,height:620},deviceScaleFactor:1});
const errors = [];
page.on('pageerror',e=>errors.push(String(e)));
try {
  await page.goto(base,{waitUntil:'networkidle'});
  const result = await page.evaluate(async()=>{
    const {assetSurface}=await import('./web/src/assets.js');
    const {drawMap}=await import('./web/src/map.js');
    const source=assetSurface('floor'), wall=assetSurface('wall');
    if(!source||!wall) throw Error('Native reference material is not loaded');
    const manifest=await fetch('assets/manifest.json').then(r=>r.json());
    const invalid=Object.values(manifest.surfaces.map).flat().filter(([x,y,w,h])=>x<0||y<0||w<=0||h<=0||x+w>source.image.naturalWidth||y+h>source.image.naturalHeight);
    const allCalls=[];
    const original=CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage=function(image,...args){
      if(image===source.image) allCalls.push(args);
      return original.call(this,image,...args);
    };
    const wrap=document.createElement('div');
    wrap.style.cssText='padding:12px;background:#e8ddc4;display:grid;grid-template-columns:1fr 1fr;gap:12px';
    const left=document.createElement('div');
    left.innerHTML='<h3>원본 시안 — 재생성 없이 동일 파일 사용</h3>';
    const reference=document.createElement('img');reference.src=source.image.src;reference.style.width='100%';left.append(reference);
    wrap.append(left);
    const right=document.createElement('div');right.innerHTML='<h3>실제 drawMap — 방·통로·모서리·갈림길</h3>';
    const canvas=document.createElement('canvas');canvas.style.cssText='width:435px;height:435px;image-rendering:auto';right.append(canvas);wrap.append(right);
    document.body.replaceChildren(wrap);
    const tile=p=>{
      if(p.x<0||p.y<0||p.x>=15||p.y>=15) return undefined;
      if(p.x>=2&&p.x<=6&&p.y>=3&&p.y<=9) return 'room';
      if(p.y===6&&p.x>=7&&p.x<=12||p.x===10&&p.y>=3&&p.y<=11) return 'corridor';
      return 'wall';
    };
    const dungeon={position:{x:7,y:6},facing:'s',floor:{stairs:{x:-99,y:-99}},tile,
      isExplored:p=>tile(p)!==undefined,isVisible:p=>tile(p)!==undefined,
      revealedTraps:()=>[],objects:()=>[],visibleEnemies:()=>[]};
    try {
      drawMap(canvas,dungeon,{playerKey:'liu-bei',enemyKey:()=>''});
      const first=canvas.toDataURL();
      drawMap(canvas,dungeon,{playerKey:'liu-bei',enemyKey:()=>''});
      const stable=first===canvas.toDataURL();
      const cell=canvas.width/15,ctx=canvas.getContext('2d');
      const luminance=(x,y)=>{
        const data=ctx.getImageData(x*cell+3,y*cell+3,cell-6,cell-6).data;
        let sum=0;for(let i=0;i<data.length;i+=4)sum+=0.2126*data[i]+0.7152*data[i+1]+0.0722*data[i+2];
        return sum/(data.length/4);
      };
      return {source:source.image.getAttribute('src'),invalid,stable,nativeDraws:allCalls.length,
        floorDraws:allCalls.filter(a=>a[2]>90).length,wallDraws:allCalls.filter(a=>a[2]<80).length,
        floorLuminance:luminance(4,5),wallLuminance:luminance(1,5)};
    } finally { CanvasRenderingContext2D.prototype.drawImage=original; }
  });
  assert.ok(result.source.endsWith('dungeon-stone-material-v2.jpg'));
  assert.deepEqual(result.invalid,[]);
  assert.ok(result.floorDraws>20 && result.wallDraws>20,'actual renderer must draw both original materials');
  assert.ok(result.stable,'texture variants cannot flicker');
  assert.ok(result.floorLuminance-result.wallLuminance>60,'floor and wall must remain distinguishable');
  await page.screenshot({path:out+'/surface-reference-runtime.png',fullPage:true});
  const fallback=await browser.newPage({viewport:{width:390,height:660}});
  fallback.on('pageerror',e=>errors.push(String(e)));
  await fallback.route('**/assets/tiles/dungeon-stone-material-v2.jpg',r=>r.fulfill({status:200,contentType:'image/jpeg',body:'invalid material'}));
  await fallback.goto(base,{waitUntil:'networkidle'});
  assert.equal(await fallback.evaluate(async()=>{const {assetSurface}=await import('./web/src/assets.js');return assetSurface('floor')===null;}),true);
  await fallback.getByRole('button',{name:'관우'}).click();
  await fallback.getByRole('button',{name:'장비'}).click();
  await fallback.getByRole('button',{name:'원정 시작',exact:true}).click();
  for(let i=0;i<12&&(await fallback.evaluate(()=>window.__tkmd.state())).phase==='scene';i++)await fallback.getByRole('button',{name:'건너뛰기',exact:true}).click();
  assert.equal(await fallback.evaluate(()=>window.__tkmd.state().phase),'dungeon');
  await fallback.screenshot({path:out+'/surface-fallback.png'});
  assert.deepEqual(errors,[]);
  writeFileSync(out+'/surface-fidelity-result.json',JSON.stringify({passed:true,...result,fallbackPassed:true,errors},null,2));
} finally { await browser.close(); }
