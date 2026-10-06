# Mobile art integration QA — 2026-10-06

Tested branch: `art/ink-graphic-novel-v1`, parent `ba3e7320396b573303d641fbda91092e245eb409` plus the accompanying visual fixes.

## Recovery and fixes

The interrupted handoff commit did not reach the branch; eight previously committed enemy/boss tokens were retained.
Initial smoke reached battle but reported external-font certificate and absent favicon errors. The local server also sent SVG art as application/octet-stream, preventing native image decoding and causing procedural fallback. Fixed MIME types, local OFL fonts, favicon, native timeline tokens and map smoothing. Compact buttons were 34/40px tall and bag actions under 44px wide; these now meet 44x44. Muted small-copy contrast improved from 3.81:1 to 4.74:1 on hanji, using a separate text token. Primary text contrast is 13.50:1 and primary button text 5.86:1.

## Results

- `npm ci`: PASS.
- `npm test`: PASS; 21 test files, 0 failures as reported by this Node runtime.
- `npm run build:web`: PASS.
- Browser: Chrome headless, viewport 390×844, device scale 2; agent-browser confirms meaningful initial content and no reported page errors.
- Existing UI smoke: PASS. Starts with Liu Bei / Guan Yu / Zhang Fei, dismisses story intro, reaches a normal battle, exercises attack and Smart Auto, returns to dungeon and opens Bag.
- Console/page errors: 0 in the normal flow.
- Title/Dungeon/Battle/Bag: scrollWidth 390; no horizontal page overflow, no broken images, no enabled button below 44×44.
- 54/54 portrait/full-body/token/atlas images decode successfully.
- Intentionally undecodable Liu Bei portrait/token (successful HTTP response, invalid image body): procedural portrait restored, dungeon renders, page errors 0. This covers image-load failure, not only absent manifest entries.
- Evidence: six screenshots and `smoke-result.json` in this directory. The dungeon screenshot is taken after dismissing the introductory story sheet.
- Vertical page scroll and the timeline's intentional horizontal scroll remain. No full campaign playtest or performance audit was performed. Enemy bust/full-body art still falls back; Phase F/G/H remains open.

## Reproduce

`npm ci && npm test && npm run build:web`

Start `PORT=8092 npm run serve`. With optional Playwright available, run:

`node scripts/e2e-smoke.mjs http://localhost:8092 <evidence-directory>`

`CHROME_PATH` optionally selects a locally installed Chrome executable. Playwright is a QA environment tool, not a project runtime dependency.

## Recovery finalization — 2026-10-06 22:00 KST

- Recovered the original working tree without recreating assets or repeating domain tests. Existing `smoke-result.json` and six screenshots are retained from the previous successful run.
- `git diff --check`: PASS. Current `npm run build:web`: PASS.
- A fresh browser rerun in this recovery environment is BLOCKED: agent-browser daemon cannot start; Chrome reports `socket() failed: Operation not permitted` during process-singleton initialization. This is an environment startup restriction, not an observed game failure.
- The final CSS timestamp follows the retained successful smoke by 31 seconds; therefore the retained smoke is prior-run evidence and is not claimed as exact-current-tree browser acceptance. Current browser acceptance remains pending an environment supporting Chrome.
