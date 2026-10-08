// Visual-only fixture: unlock all content in an isolated browser context, never in user saves.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
const base=(process.argv[2]??'http://localhost:8092').replace(/\/$/,'');
const out=process.argv[3]??'visual-evidence'; mkdirSync(out,{recursive:true});
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
const errors=[]; page.on('pageerror',e=>errors.push(String(e))); page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.goto(base,{waitUntil:'networkidle'});
const campaigns=await page.evaluate(async()=>{
  const {MVP_CONTENT:c,initialMeta}=await import('./src/index.js');
  localStorage.setItem('tkmd.meta.v1',JSON.stringify({...initialMeta(c),unlockedCharacters:c.characters.map(x=>x.id),unlockedCampaigns:c.campaigns.map(x=>x.id)}));
  localStorage.removeItem('tkmd.save.v1'); return c.campaigns.map(x=>({id:x.id,name:x.name}));
});
const layouts=[];
async function audit(screen){
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>undefined)));});
  const m=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
    brokenImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),
    smallTargets:[...document.querySelectorAll('button:not(:disabled)')].map(b=>({name:b.textContent,width:b.getBoundingClientRect().width,height:b.getBoundingClientRect().height})).filter(b=>b.width>0&&b.height>0&&(b.width<44||b.height<44))}));
  layouts.push({screen,...m});
}
for(const width of [360,390,768]){
  await page.setViewportSize({width,height:844}); await page.reload({waitUntil:'networkidle'});
  await audit('all-roster-'+width);
}
await page.setViewportSize({width:390,height:844}); await page.reload({waitUntil:'networkidle'});
await page.screenshot({path:out+'/07-expanded-roster.png',fullPage:true});
const bindings=await page.evaluate(async()=>{
  const {MVP_CONTENT:c}=await import('./src/index.js');
  const {artKey}=await import('./web/src/story.js');
  const {nativeAssetPortrait,assetToken,fullBodyIllustration}=await import('./web/src/assets.js');
  const characters=c.characters.map(x=>({id:x.id,key:artKey(x.id),portrait:!!nativeAssetPortrait(artKey(x.id)),full:!!fullBodyIllustration(artKey(x.id)),token:!!assetToken(artKey(x.id))}));
  const enemies=[...new Set(c.enemyGroups.flatMap(g=>g.units.map(u=>u.name)))].map(name=>({name,key:artKey(name),portrait:!!nativeAssetPortrait(artKey(name)),token:!!assetToken(artKey(name))}));
  return {characters,enemies};
});
await page.getByRole('button',{name:'도감 · 업적 보기'}).click();
for(const label of ['장수','보스','업적','물품']){
  await page.getByRole('button',{name:new RegExp('^'+label+' ')}).click();
  // Tab rendering is synchronous; audit waits for the actual fonts and images.
  // Global network idle can remain pending while unrelated assets are fetched.
  await audit('codex-'+label);
}
await page.screenshot({path:out+'/08-codex-items.png',fullPage:true});
for(const campaign of campaigns){
  await page.evaluate(()=>localStorage.removeItem('tkmd.save.v1'));
  await page.reload({waitUntil:'networkidle'});
  await page.locator('.campaign-details summary').click();
  await page.getByRole('button',{name:new RegExp(campaign.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'))}).click();
  await page.locator('button.pick').filter({hasText:'관우'}).click(); await page.locator('button.pick').filter({hasText:'장비'}).click();
  await page.getByRole('button',{name:'원정 시작'}).click();
  await page.locator('#app[data-screen="dungeon"], #app[data-screen="battle"]').waitFor({state:'visible'});
  await audit('campaign-intro-'+campaign.id);
  await page.screenshot({path:out+'/campaign-'+campaign.id+'.png',fullPage:true});
}
const passed=errors.length===0&&layouts.every(x=>x.scrollWidth<=x.width&&!x.brokenImages.length&&!x.smallTargets.length)
  &&bindings.characters.every(x=>x.key===x.id&&x.portrait&&x.full&&x.token)&&bindings.enemies.every(x=>x.portrait&&x.token);
writeFileSync(out+'/coverage-result.json',JSON.stringify({passed,errors,layouts,bindings},null,2));
console.log(JSON.stringify({passed,characters:bindings.characters.length,enemyNames:bindings.enemies.length,screens:layouts.length,errors},null,2));
await browser.close(); process.exit(passed?0:1);
