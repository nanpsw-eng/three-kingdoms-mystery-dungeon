# SESSION HANDOFF — 2026-10-05 Phase 8 Battle Entry Contract

## Current State
- Repository: `nanpsw-eng/three-kingdoms-mystery-dungeon`
- Branch: `feature/headless-battle-engine`
- Exact tested source/test commit: `adadfbd` (later commits = docs only)
- Current Gate: `BATTLE_ENTRY_CONTRACT_PASS / DUNGEON_CORE_READY`
- Local test: `npm test` → strict build PASS, `95 passed / 0 failed` (run twice)
- GitHub CI: `NOT_RUN` (no workflow exists)
- Merge to `main`: `NOT_RUN / HUMAN_GATE`
- Deploy: `NOT_RUN / HUMAN_GATE`
- Evidence: `docs/reports/HEADLESS_BATTLE_ENGINE_PHASE7.md`, `docs/reports/BATTLE_CORE_FEATURE_REVIEW.md`, `docs/reports/HEADLESS_BATTLE_ENGINE_PHASE8.md`
- Repository visibility: user requested PUBLIC (2026-10-05); not changeable from agent tools → user action in GitHub Settings

## Recovery Note (important)
- Remote branch did **not compile** from `43fb7eb` (Phase 5) through `c970279` (literal `\n` in `battle.ts`). Phase 5/6 PASS claims were local reconstruction only. Fixed in `8c6c3fd`.
- Repository test count before Phase 7 tests was 62, not the 64 stated in the Phase 6 report (`UNKNOWN`).
- Always verify with `npm install && npm test` on the exact remote HEAD; do not trust prior handoff counts.

## DO_NOT_REPEAT
- Seeded RNG, snapshot/restore, named streams, golden vector
- Unit model (HP/ATK/DEF/SPD/INT), Energy, KO/Heal/Revive primitives
- SPD Timeline incl. advance/delay/extra/interrupt
- damage/crit formulas, StatusStore merge rules
- Formation targeting/guard/swap, KO removal, victory/defeat, state hash
- Skill/Ultimate/Item/Retreat command execution
- Smart Auto basic/skill/ultimate scoring + cleanse/revive scoring
- DOT/Stun/Confusion/Timeline Delay runtime
- Phase 7: targeting state `living|ko|any` (default living), Cleanse, Revive, KO slot memory (`koSlots` in snapshot), formation restoration, timeline re-registration, mixed replay golden hash (re-pinned Phase 8: `40a9763c`)
- Phase 8: participant `entry` {hp, energy} incl. KO-at-entry, `surprise` side (+15 energy, 0.8× first delay), base evasion 3% on `battle::evasion` stream + per-effect `evasionChance`, `src/battle/balance.ts`, Smart Auto anti-stall (no low-HP guard at full energy), boss retreat test
- Battle Core review: coverage matrix, representative 5v5 fixture (golden re-pinned Phase 8: 88 actions / `adacb8ac`), Manual-replay-of-Auto contract test, 100-seed 5v5 batch

## NOT_RUN / DECISION_REQUIRED
- GitHub CI exact HEAD: NOT_RUN
- Statuses persisting through KO → revive: DECISION_REQUIRED (spec silent; currently kept)
- Revived unit energy (currently unchanged): DECISION_REQUIRED (low)
- No-free-slot revive error: structurally unreachable via public API (not tested)
- Balance of cleanse/revive Smart Auto weights: NOT_RUN
- Smart Auto quality findings (ultimate starvation, cleanse undervalued): OBSERVED, NOT_VALIDATED
- Phase 8 defaults needing confirmation: strategy damage evadable; evasion negates only the damage instance (status still lands)
- Balance of evasion 3% / surprise +15 / 0.8: NOT_VALIDATED
- Full 15-character content / Dungeon Core / mobile UI: NOT_STARTED

## NEXT_SAFE_ACTION
Option A (implementation sequence step 2) — Dungeon Core start:
1. Read `docs/specs/DUNGEON_SPEC.md`, `DEC-004`.
2. Seeded floor generation (AC-003-01 reachability, AC-003-02 same seed → same topology) as pure TS.
3. Battle integration contract only via `BattleDefinition{participants[].entry, surprise, retreatAllowed}` and `snapshot().units`.
Option B — Battle backlog first: N1 All Attack/Repeat, N2 extra-action/interrupt effects, N3 Smart Auto ultimate saving / DOT-aware cleanse.
- User decides A or B. Do not start 15-character content or UI.

## REQUIRED_CONTEXT
- `AGENTS.md`
- `docs/specs/BATTLE_SPEC.md`
- `docs/reports/BATTLE_CORE_FEATURE_REVIEW.md`
- `docs/reports/HEADLESS_BATTLE_ENGINE_PHASE8.md`

## DO_NOT_REREAD_BY_DEFAULT
- Full original chat sequence.
- Phase 1–6 reports unless regression investigation requires them.
- Phase 7 report unless revive/cleanse regression.

## Human Gate
- Merge to `main`: REQUIRED
- Production deploy/release: REQUIRED
- Product Baseline material change / paid service / visibility change: REQUIRED
