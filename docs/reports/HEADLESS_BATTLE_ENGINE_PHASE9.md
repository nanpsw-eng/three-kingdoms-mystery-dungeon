# Headless Battle Engine — Phase 9 Battle Backlog

Status: `PASS_LOCAL / CI_PENDING_ON_PUSH`
Date: `2026-10-05`

## Delta
- Decisions A-01..A-08 (`DEC-023`) implemented.
- N1 All Attack (`chooseAllAttackCommand`) and Repeat (`RepeatAutoController`) choosers on the same command contract; `simulateAutoBattle(definition, chooser)`.
- N2 `extra-action` effect (`mode: extra | interrupt`).
- N3 Smart Auto ultimate reserve + DOT-aware cleanse + extra-action scoring.
- N4 ally loadout validation.
- N6 all battle balance constants consolidated in `src/battle/balance.ts` (modules re-export).
- N5 forced enemy movement: deferred until content needs it.

## Verification
- `npm test`: strict build PASS, **106 passed / 0 failed** (new `test/battle-modes.test.mjs` 11).
- 5v5 golden re-pinned: ally-victory / 82 / `24100ca4` (Smart Auto scoring change).
- Observational 1000-seed 5v5: 0 soft locks, ultimates 81→126, cleanse 34→235.
- GitHub CI: first run on `05fe78d` = success.
