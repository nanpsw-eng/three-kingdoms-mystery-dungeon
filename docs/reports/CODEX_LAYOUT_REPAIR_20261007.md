# Codex layout repair — 2026-10-07

## Observed failure and fix

The Android screenshot shows the expanded Liu Bei card and subsequent character cards painted outside their boundaries. The old codex body was a viewport-constrained grid with implicit auto rows containing buttons. Its item rows could compress below the height of their text/art. Secondary tabs shared the same scroll container.

All tabs now use a bounded vertical flex scrolling region with nonshrinking children. Character cards use intrinsic height, nonshrinking 48px portraits, a min-width:0 text column and wrapped descriptions. Expanded cards reserve 90×150 art; narrow screens stack art above text. Bosses and achievements share the wrapping copy style. Items use two columns below 381px. Header/close/tab controls stay outside the scroll body. Character expansion restores scrollTop and focus; locked cards cannot expand.

## Scope and authority

RISK_MEDIUM, SMALL context, single writer, engine regression + web build + targeted browser layout gate. No save schema, game logic, balance, or assets changed. Exact project AI-OS binding and applicable risk policy were read. Existing DEC-024 records production authority. Automatic approval review separately blocked branch upload.

## Evidence

- Base: main `5cab8dbd00fcc9af05a85bce2a1a37c226a4daa0`.
- Implementation/test commit: `49ccc0cdc00eb70b77c6b10a9f4a6edd578687a2`.
- `npm test`: PASS, 161 tests, 0 failures.
- `npm run build:web`: PASS.
- `git diff --check`, browser script syntax: PASS.
- `scripts/codex-layout-smoke.mjs`: PASS, 40 layout audits. Tests descendant containment for every card, all tabs, 6 sizes (320×568 through 740×360), long list scroll, expanded cards, scrolled expansion/focus, locked rows, persistent navigation, enlarged text and close.
- Existing mobile UX browser regression: PASS (touch controls, battle, modal pause/resume, save reload).
- Existing concept integration browser regression: PASS (codex secondary art, story backdrop, map objects, reduced motion).
- Browser runtime: bundled Chromium 151 download failed; official fallback mirror successfully supplied Chromium 141 headless shell (Playwright 1.56.1). Local browser checks executed; visual CI using its configured Playwright version remains NOT_RUN until branch upload is authorized.
- Screenshot inspection: collapsed and expanded character cards contain their images and wrapped text; navigation remains visible. Physical Android device verification is NOT_RUN.
- Evidence: `docs/reports/evidence/codex-repair-20261007-*` contains 5 screenshots and 3 JSON test reports.
- Remote upload/PR: BLOCKED by automatic approval review; no merge or deployment performed.

## Resume

User authorization for uploading `fix/codex-mobile-layout` to `nanpsw-eng/three-kingdoms-mystery-dungeon` is required by the automatic approval review. After authorization, push branch, open PR, use visual CI to execute the card-containment gate and existing mobile/art integration checks. Merge and verify deployment only after all required checks pass. Do not claim visual QA PASS from engine tests alone.

## Reviewable screenshots

- [장수 목록](evidence/codex-repair-20261007-codex-characters-fixed.png)
- [장수 상세](evidence/codex-repair-20261007-codex-expanded-fixed.png)
- [보스](evidence/codex-repair-20261007-concept-codex-bosses.png)
- [업적](evidence/codex-repair-20261007-concept-codex-achievements.png)
- [물품](evidence/codex-repair-20261007-concept-codex-items.png)
