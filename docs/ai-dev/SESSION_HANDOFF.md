# SESSION HANDOFF — 2026-10-05 Headless Battle Engine Phase 7

## Current State
- Repository: `nanpsw-eng/three-kingdoms-mystery-dungeon`
- Branch: `feature/headless-battle-engine`
- Exact tested source/test HEAD: `bddf51e` (later commits on branch = docs only; see `git log`)
- Current Gate: `CLEANSE_REVIVE_PASS / BATTLE_CORE_REVIEW_NEXT`
- Local test: `npm test` → strict build PASS, `79 passed / 0 failed`
- GitHub CI: `NOT_RUN` (no workflow exists)
- Merge to `main`: `NOT_RUN / HUMAN_GATE`
- Deploy: `NOT_RUN / HUMAN_GATE`
- Evidence: `docs/reports/HEADLESS_BATTLE_ENGINE_PHASE7.md`

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

## NOT_RUN / DECISION_REQUIRED
- GitHub CI exact HEAD: NOT_RUN
- Statuses persisting through KO → revive: DECISION_REQUIRED (spec silent; currently kept)
- Revived unit energy (currently unchanged): DECISION_REQUIRED (low)
- No-free-slot revive error: structurally unreachable via public API (not tested)
- Balance of cleanse/revive Smart Auto weights: NOT_RUN
- Full 15-character content / Dungeon Core / mobile UI: NOT_STARTED

## NEXT_SAFE_ACTION — Battle Core Feature-Complete Review
1. BATTLE_SPEC vs implementation coverage matrix.
2. Identify missing commands/effects.
3. Confirm Smart Auto handles every implemented command/effect.
4. Expand deterministic simulation (include cleanse/revive skills).
5. Add representative 5v5 fixture.
6. Gate decision: hand `HEADLESS_BATTLE_ENGINE` to Dungeon Core.
- Do not start 15-character content or UI yet.
- Optional: propose a GitHub Actions `npm test` workflow (HUMAN_GATE if it incurs cost).

## REQUIRED_CONTEXT
- `AGENTS.md`
- `docs/specs/BATTLE_SPEC.md`
- `docs/reports/HEADLESS_BATTLE_ENGINE_PHASE7.md`

## DO_NOT_REREAD_BY_DEFAULT
- Full original chat sequence.
- Phase 1–6 reports unless regression investigation requires them.
- Dungeon spec until Battle Core review gate passes.

## Human Gate
- Merge to `main`: REQUIRED
- Production deploy/release: REQUIRED
- Product Baseline material change / paid service / visibility change: REQUIRED
