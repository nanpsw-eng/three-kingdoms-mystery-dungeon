# SESSION HANDOFF — 2026-10-05 MVP Feature Complete (Phases 9–14)

## Current State
- Repository: `nanpsw-eng/three-kingdoms-mystery-dungeon` (public)
- Branch: `feature/headless-battle-engine` (mirror: `ccr-bb39f6f8-g46bbv`)
- Exact HEAD: see `git log -1` (this handoff commit); last code change = web client P14
- Gate: `MVP_FEATURE_COMPLETE / HUMAN_PLAYTEST_NEXT`
- Local: `npm test` → strict build PASS, **135 passed / 0 failed**; `npm run build:web` PASS; UI smoke PASS (0 console errors)
- GitHub CI: `.github/workflows/ci.yml` (test + build:web) — green on prior pushes; check latest run
- Merge to `main`: `NOT_RUN / HUMAN_GATE` · Deploy: `NOT_RUN / HUMAN_GATE`
- User delegation (2026-10-05): remaining design choices auto-approved by recommendation → `DEC-023` (A-01..A-26)

## Phase Evidence
| Phase | Report |
|---|---|
| 7 Cleanse/Revive | `docs/reports/HEADLESS_BATTLE_ENGINE_PHASE7.md` |
| Battle Core review | `docs/reports/BATTLE_CORE_FEATURE_REVIEW.md` |
| 8 Entry/Surprise/Evasion | `docs/reports/HEADLESS_BATTLE_ENGINE_PHASE8.md` |
| 9 Battle backlog | `docs/reports/HEADLESS_BATTLE_ENGINE_PHASE9.md` |
| 10 Dungeon Core | `docs/reports/DUNGEON_CORE_PHASE10.md` |
| 11–13 Run/Content/Sim | `docs/reports/RUN_SIMULATION_PHASE13.md`, `docs/reports/sim/*.json` |
| 14 Web client | `docs/reports/WEB_CLIENT_PHASE14.md` |

## DO_NOT_REPEAT
- Battle: RNG/timeline/damage/status/formation/skills/items/retreat/cleanse/revive/entry state/surprise/evasion/extra-action, Smart Auto + All Attack + Repeat, balance constants in `src/battle/balance.ts`
- Dungeon: generator (rooms/MST/loops/dead ends/secret/gates/sorcery/boss), turn engine, AI states, detection/surprise, traps, food/recovery/starvation, danger/reinforcement, auto explore, travel/frontier pathing; constants `src/dungeon/balance.ts`
- Run: party/level/traits/recruit/events/items/equipment/shop/safe zone/battle bridge/meta unlocks; constants `src/run/balance.ts`
- Content: 15 characters + skills + traits, items/equipment, YT 15F + Hulao preview, events, unlock rules
- Sim: autopilot + `scripts/simulate.mjs` (crossed ruler×pair sampling); balance pass (YT smart 25.9%, all-attack 0%, Hulao 61.7%)
- Web: `web/` static client, `scripts/{build-web,serve,e2e-smoke}.mjs`

## NOT_RUN / OPEN
- Human playtest: fun (PRD §3.3), U-001 20–30 min, R-001 trait fatigue (~20 picks/run), R-002 manual vs auto
- Real mobile device / accessibility / NFR-004 performance
- Balance validation for humans (BALANCE_SEED "Validation Required")
- OD-002 art direction; OD-003 success metrics; production hosting choice
- Battle animation layer; N5 forced enemy movement; Hulao gate keys/levers beyond defender rule

## NEXT_SAFE_ACTION
1. Human: play `npm run build:web && npm run serve` (or a static host after approval) and report feel/time per run.
2. If approved: open PR `feature/headless-battle-engine` → `main` (Human Gate) and choose static hosting (free tier).
3. Tune from playtest data in content/balance files only; keep simulation (`npm run simulate`) as regression.

## REQUIRED_CONTEXT
- `AGENTS.md`, `docs/decisions/DEC-023-AUTO_APPROVED_DELTAS.md`, the phase reports above.

## Human Gate
- Merge to `main`: REQUIRED · Production deploy/release: REQUIRED · Paid services: REQUIRED · Product Baseline material change: REQUIRED
