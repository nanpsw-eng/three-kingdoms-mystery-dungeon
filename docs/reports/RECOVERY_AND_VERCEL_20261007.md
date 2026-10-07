# Recovery + Vercel readiness — 2026-10-07 KST

## Confirmed recovery point

- Reviewed actual GitHub refs, recent commits, PR #13, project binding/AGENTS/decisions, and other-chat continuity context.
- Game baseline: main `ea8beea73f53aca9c2aa5f2c2a189ee466932504` (PR #13 merged 2026-10-07 08:29:53 KST).
- Art branch and main have identical trees. Claude session branch has no commits absent from main. No open PR was found at inspection.
- Story E1–E9 and shipped ink graphics were already implemented. Do not recreate assets, engine, story expansion, or PR #13.
- Prior handoff/README incorrectly retained pending merge/verification states; continuity is corrected by this delta.
- Repeated chat interruption cause: UNKNOWN. No evidence of a game-engine failure causing chat interruptions. Future sessions resume from repository checkpoint, not old chat status claims.

## Verification evidence

| Check | Result |
|---|---|
| Local `npm ci` | PASS |
| Local `npm test` on main | 161 passed, 0 failed |
| Local `npm run build:web` | PASS |
| Compiled relative module links | 57 JS files, 0 missing relative imports |
| Main CI | PASS — run 37546880306 |
| Main visual-smoke | PASS — run 37546880371, artifact 11450813048 |
| Asset decode | 283/283 PASS |
| Gameplay | battle reached, returned to dungeon; 4 layouts; errors 0 |
| Missing-art fallback | PASS; exact result in recovery JSON |
| Expanded art coverage | 48 characters, 89 enemy names, 16 layouts; PASS, errors 0 |
| Main Pages workflow | PASS — run 37546880382; site pushed to gh-pages |
| Intended public Pages URL | HTTP 404 at inspection; activation cause UNKNOWN |
| Local fresh Chromium smoke | NOT_RUN: Chromium download returned invalid archive; existing exact-main CI evidence reused |
| Full manual campaign playthrough/balance | NOT_RUN; remains human playtest scope |
| Vercel project creation | BLOCKED — 403 forbidden |
| Vercel deployment/production URL | NOT_RUN / NONE CREATED |

Evidence JSON: `RECOVERY_VISUAL_EVIDENCE_20261007.json`. Remote visual screenshots remain in https://github.com/nanpsw-eng/three-kingdoms-mystery-dungeon/actions/runs/37546880371 (14-day retention; JSON facts persisted here).

## Change and authority

Add `vercel.json` to enforce test-before-build and publish `site/`; document exact deployment settings and the real blocker. Refresh current README/art handoff/visual verification states. No domain logic, graphics, dependencies, data format, or paid services changed.

User requested resuming and Vercel deployment. Existing DEC-024 and visual handoff record authorization for merge/production; no renewed approval gate is added to already authorized work. Vercel cannot complete until create-project permission is available or a project is imported through an authorized dashboard fallback.

Risk: MEDIUM (new hosting target). Executor: 1; context: FOCUSED; verification uses main tests/build plus existing exact-main browser CI. No extra agents or duplicate asset generation.

AI-OS: project exact binding v0.4.4@64b5115a698cc6a94cd8df80abb2ee7109010764 preserved. Current Stable README and exact risk-adaptive policy checked; full Domain Pack loading NOT_RUN (no engine/product changes). No binding upgrade.

## Next action

Follow `docs/operations/VERCEL_DEPLOYMENT.md`, create/import the authorized project, deploy current main, verify READY + runtime URL, persist result. Do not mark hosting LIVE from build success alone.
