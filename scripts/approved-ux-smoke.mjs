// Approved v2 real UI flow, with isolated browser storage; no production save access.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
const base=process.argv[2]??'http://localhost:8092',out=process.argv[3]??'ux-v2-evidence';mkdirSync(out,{recursive:true});
const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));
await page.addInitScript(()=>{Date.now=()=>1791373352662;});
const saved=()=>page.evaluate(()=>localStorage.getItem('tkmd.save.v1'));
const state=()=>page.evaluate(()=>window.__tkmd.state());
const choose=async()=>{for(const name of ['관우','장비']){const pick=page.locator('button.pick').filter({hasText:name});if(await pick.getAttribute('aria-pressed')!=='true')await pick.click();}};
try{
 await page.goto(base,{waitUntil:'networkidle'});
 assert.equal(await page.locator('.campaign-details').getAttribute('open'),null);
 assert.ok(await page.getByRole('button',{name:'원정 시작',exact:true}).isDisabled());
 await page.locator('.campaign-details summary').click();
 await page.setViewportSize({width:360,height:844});
 await page.waitForTimeout(100);
 assert.equal(await page.locator('.campaign-details').getAttribute('open'),'','campaign list survives resize');
 await page.getByRole('button',{name:/184 황건적의 난/}).click();
 assert.equal(await page.locator('.campaign-details').getAttribute('open'),'','campaign list survives selection');
 await page.locator('.campaign-details summary').click();
 await choose();assert.ok(await page.getByRole('heading',{name:'장수 선택 (2/2)',exact:true}).isVisible());
 assert.ok(await page.getByRole('button',{name:'원정 시작',exact:true}).isEnabled());
 for(const [w,h] of [[320,568],[390,844],[844,390]]){
  await page.setViewportSize({width:w,height:h});await page.waitForTimeout(100);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 }
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(100);
 await page.screenshot({path:out+'/title-new-setup.png',fullPage:true});
 await page.getByRole('button',{name:'원정 시작',exact:true}).click();
 for(let i=0;i<12&&(await state()).phase==='scene';i++)await page.getByRole('button',{name:'건너뛰기',exact:true}).click();
 await page.getByRole('button',{name:'대기',exact:true}).click();
 const old=await saved(),before=await state(),food=await page.locator(".food-stat b").textContent();
 await page.getByRole('button',{name:'더보기',exact:true}).click();
 await page.getByRole('button',{name:'상태',exact:true}).click();await page.getByRole('button',{name:'패널 닫기',exact:true}).click();
 assert.equal(await saved(),old);assert.deepEqual(await state(),before);
 await page.reload({waitUntil:'networkidle'});
 assert.equal(await page.locator('button.pick').count(),0,'resume and setup are separate states');
 assert.equal(await page.getByRole('button',{name:'포기',exact:true}).count(),0,'no adjacent destructive action');
 assert.ok(await page.getByText(`군량 ${food} · 부대 3명`,{exact:true}).isVisible(),'resume preview replays current save');
 await page.screenshot({path:out+'/title-resume.png',fullPage:true});
 await page.getByRole('button',{name:'새 원정 준비',exact:true}).click();assert.equal(await saved(),old);
 await page.getByRole('button',{name:'이어하기로 돌아가기',exact:true}).click();assert.equal(await saved(),old);
 await page.getByRole('button',{name:'새 원정 준비',exact:true}).click();await choose();
 await page.getByRole('button',{name:'원정 시작',exact:true}).click();
 assert.equal(await saved(),old,'opening replacement confirmation preserves original save');
 await page.getByRole('button',{name:'취소',exact:true}).click();assert.equal(await saved(),old);
 await page.getByRole('button',{name:'이어하기로 돌아가기',exact:true}).click();
 await page.getByRole('button',{name:'이어하기',exact:true}).click();assert.equal(await saved(),old);assert.deepEqual(await state(),before);
 assert.deepEqual(errors,[]);writeFileSync(out+'/approved-ux-result.json',JSON.stringify({passed:true,resumeAndSetupSeparate:true,replaceCancelPreservesSave:true,readOnlyMenus:true,errors},null,2));
 console.log('PASS: approved v2 setup/resume separation, canonical goal, replacement cancel, menus and save replay');
}finally{await browser.close();}
