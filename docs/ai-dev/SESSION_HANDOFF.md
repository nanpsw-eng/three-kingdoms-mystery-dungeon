# SESSION HANDOFF — 2026-10-05 Battle Core Feature-Complete Review

## Current State
- Repository: `nanpsw-eng/three-kingdoms-mystery-dungeon`
- Branch: `feature/headless-battle-engine`
- Exact tested HEAD: commit containing `test/battle-core-review.test.mjs` (see `git log -1`)
- Current Gate: `BATTLE_CORE_REVIEW_DONE / BATTLE_ENTRY_CONTRACT_NEXT` (Dungeon handoff BLOCKED by B1–B3)
- Local test: `npm test` → strict build PASS, `83 passed / 0 failed`
- GitHub CI: `NOT_RUN` (no workflow exists)
- Merge to `main`: `NOT_RUN / HUMAN_GATE`
- Deploy: `NOT_RUN / HUMAN_GATE`
- Evidence: `docs/reports/HEADLESS_BATTLE_ENGINE_PHASE7.md`, `docs/reports/BATTLE_CORE_FEATURE_REVIEW.md`
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
- Phase 7: targeting state `living|ko|any` (default living), Cleanse, Revive, KO slot memory (`koSlots` in snapshot), formation restoration, timeline re-registration, mixed replay golden hash `6503461c`
- Battle Core review: coverage matrix, representative 5v5 fixture (golden `dc1c2644`), Manual-replay-of-Auto contract test, 100-seed 5v5 batch

## NOT_RUN / DECISION_REQUIRED
- GitHub CI exact HEAD: NOT_RUN
- Statuses persisting through KO → revive: DECISION_REQUIRED (spec silent; currently kept)
- Revived unit energy (currently unchanged): DECISION_REQUIRED (low)
- No-free-slot revive error: structurally unreachable via public API (not tested)
- Balance of cleanse/revive Smart Auto weights: NOT_RUN
- Smart Auto quality findings (ultimate starvation, cleanse undervalued): OBSERVED, NOT_VALIDATED
- Full 15-character content / Dungeon Core / mobile UI: NOT_STARTED

## NEXT_SAFE_ACTION — Phase 8 Battle Entry Contract & Baseline Gaps
1. B1 entry state: per-unit initial HP / KO-at-entry / energy.
2. B2 Surprise: +15 initial energy, ~20% timeline advantage (canonical constants).
3. B3 Base evasion 3% via named RNG stream (intentionally re-pin golden hashes).
4. N7 boss `retreatAllowed:false` test.
5. Then Dungeon Core handoff gate. Backlog N1–N11 in review report §5.
- Do not start 15-character content or UI yet.

## REQUIRED_CONTEXT
- `AGENTS.md`
- `docs/specs/BATTLE_SPEC.md`
- `docs/reports/BATTLE_CORE_FEATURE_REVIEW.md`

## DO_NOT_REREAD_BY_DEFAULT
- Full original chat sequence.
- Phase 1–6 reports unless regression investigation requires them.
- Dungeon spec until Battle Core review gate passes.

## Human Gate
- Merge to `main`: REQUIRED
- Production deploy/release: REQUIRED
- Product Baseline material change / paid service / visibility change: REQUIRED
