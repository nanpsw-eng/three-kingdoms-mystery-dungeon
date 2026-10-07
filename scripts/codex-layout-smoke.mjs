// Regression: intrinsic card heights, all tabs, scroll/focus and narrow viewports.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
const base = process.argv[2] ?? 'http://localhost:8092';
const out = process.argv[3] ?? 'visual-evidence';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE_PATH });
const page = await browser.newPage({ viewport: { width: 390, height: 760 } });
const results = [], errors = [];
page.on('pageerror', e => errors.push(String(e)));
const audit = async label => {
  await page.locator('.codex').evaluate(async el => {
    await document.fonts.ready;
    await Promise.all([...el.querySelectorAll('img')].map(i => i.decode()));
  });
  const r = await page.evaluate(() => {
    const box = el => el.getBoundingClientRect();
    const cards = [...document.querySelectorAll('.codex-entry')];
    const escaped = [];
    for (const [index, card] of cards.entries()) {
      const b = box(card);
      // Include every descendant, especially long Korean descriptions and artwork.
      for (const child of card.querySelectorAll('*')) {
        const c = box(child);
        if (c.left < b.left - 1 || c.right > b.right + 1 || c.top < b.top - 1 || c.bottom > b.bottom + 1)
          escaped.push({ index, class: child.className, cardHeight: b.height, childHeight: c.height });
      }
    }
    const body = document.querySelector('.codex-body');
    const controls = [...document.querySelectorAll('.codex-header button, .codex-tabs button')].map(el => {
      const b = box(el); return { width: b.width, height: b.height, top: b.top, bottom: b.bottom };
    });
    return { escaped, cards: cards.length, controls, horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
      bodyHeight: body.clientHeight, scrollHeight: body.scrollHeight, viewportHeight: innerHeight };
  });
  assert.deepEqual(r.escaped, [], label + ' card content escapes');
  assert.ok(!r.horizontalOverflow, label + ' horizontal overflow');
  assert.ok(r.bodyHeight > 0, label + ' no scrolling area');
  for (const c of r.controls) assert.ok(c.width >= 44 && c.height >= 44 && c.top >= 0 && c.bottom <= r.viewportHeight, label + ' navigation unreachable');
  results.push({ label, ...r });
};
try {
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    const { MVP_CONTENT: c, initialMeta } = await import('./src/index.js');
    const m = initialMeta(c);
    localStorage.setItem('tkmd.meta.v1', JSON.stringify({ ...m,
      unlockedCharacters: c.characters.slice(0, 15).map(x => x.id),
      codex: { ...m.codex, enemies: c.enemyGroups.slice(0, 3).map(x => x.id), items: [...c.items, ...c.equipment].map(x => x.id) }
    }));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: '도감 · 업적 보기', exact: true }).click();
  for (const [width, height] of [[320,568],[360,640],[390,760],[412,915],[520,800],[740,360]]) {
    await page.setViewportSize({ width, height });
    await page.getByRole('button', { name: /^장수 / }).click();
    await audit(`characters-${width}x${height}`);
    assert.ok(results.at(-1).scrollHeight > results.at(-1).bodyHeight, 'long roster must scroll');
    await page.locator('.codex-character').first().click();
    await audit(`expanded-${width}x${height}`);
    await page.locator('.codex-character').first().click();
    const middle = page.locator('.codex-character:not(.locked)').nth(8);
    await middle.scrollIntoViewIfNeeded();
    const scrollTop = await page.locator('.codex-body').evaluate(el => el.scrollTop);
    await middle.click();
    assert.ok(Math.abs(await page.locator('.codex-body').evaluate(el => el.scrollTop) - scrollTop) < 1, 'expansion preserves scroll');
    assert.equal(await middle.evaluate(el => el === document.activeElement), true, 'expansion preserves focus');
    await audit(`scrolled-expanded-${width}x${height}`);
    await middle.click();
    const locked = page.locator('.codex-character.locked').first();
    await locked.evaluate(el => el.click());
    assert.equal(await locked.getAttribute('aria-expanded'), 'false');
    for (const name of ['보스','업적','물품']) {
      await page.getByRole('button', { name: new RegExp('^' + name + ' ') }).click();
      await audit(`${name}-${width}x${height}`);
      const headerY = await page.locator('.codex-header').evaluate(el => el.getBoundingClientRect().y);
      await page.locator('.codex-body').evaluate(el => { el.scrollTop = el.scrollHeight; });
      assert.equal(await page.locator('.codex-header').evaluate(el => el.getBoundingClientRect().y), headerY);
    }
  }
  await page.setViewportSize({ width: 390, height: 760 });
  await page.getByRole('button', { name: /^장수 / }).click();
  await page.screenshot({ path: out + '/codex-characters-fixed.png' });
  await page.locator('.codex-character').first().click();
  await page.screenshot({ path: out + '/codex-expanded-fixed.png' });
  // Increased text size must grow cards rather than overlap neighboring content.
  await page.addStyleTag({ content: '.codex-name {font-size:23px} .codex-copy small, .codex-copy p {font-size:20px} .codex-tabs button {font-size:18px}' });
  await audit('larger-text-expanded');
  for (const name of ['보스','업적','물품']) {
    await page.getByRole('button', { name: new RegExp('^' + name + ' ') }).click();
    await audit(`${name}-larger-text`);
  }
  await page.getByRole('button', { name: '닫기', exact: true }).click();
  assert.equal(await page.locator('#app').getAttribute('data-screen'), 'title');
  assert.deepEqual(errors, []);
  writeFileSync(out + '/codex-layout-result.json', JSON.stringify({ passed: true, results, errors }, null, 2));
  console.log(`PASS: ${results.length} codex layout audits`);
} finally { await browser.close(); }
