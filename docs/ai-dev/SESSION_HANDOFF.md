# SESSION HANDOFF — 2026-10-05 Headless Battle Engine Phase 6

## Current State
- Repository: `nanpsw-eng/three-kingdoms-mystery-dungeon`
- Branch: `feature/headless-battle-engine`
- Current Gate: `STATUS_RUNTIME_PASS / CLEANSE_REVIVE_NEXT`
- Merge: `NOT_RUN / HUMAN_GATE`
- Deploy: `NOT_RUN / HUMAN_GATE`

## DO_NOT_REPEAT
- Seeded RNG + replay primitives
- HP/ATK/DEF/SPD/INT Unit model
- SPD Timeline
- damage/crit seed formulas
- StatusStore merge rules
- basic Battle State Machine
- Skill/Ultimate/Item/Retreat command execution
- Smart Auto basic/skill/ultimate scoring
- DOT/Stun/Confusion/Timeline Delay runtime lifecycle

## Completed Through Phase 6
- Phase 4 data-driven Skill/Effect core.
- Phase 5 skill-aware Smart Auto.
- Phase 6 deterministic status runtime.
- Local reconstructed full regression: `64/64 PASS`.
- Phase 6 remote source/test persistence complete.

## Verification Boundary
### PASS
- local strict TypeScript build
- local headless tests 64/64
- status runtime dedicated tests
- remote persistence checks

### NOT_RUN / NOT_IMPLEMENTED
- GitHub CI exact HEAD: NOT_RUN
- Cleanse effect: NOT_IMPLEMENTED
- Revive/KO targeting: NOT_IMPLEMENTED
- full 15-character content: NOT_STARTED
- Dungeon Core: NOT_STARTED
- mobile UI: NOT_STARTED

## Next Safe Action
1. Add targeting state contract: living / KO / any, default living.
2. Add Cleanse effect.
3. Add Revive effect with HP ratio.
4. Preserve KO unit slot and deterministically restore into an available formation slot.
5. Re-register revived unit in SPD Timeline.
6. Add tests for ordinary heal not reviving, Cleanse, Revive and deterministic replay.
7. Persist Phase 7 evidence.

## REQUIRED_CONTEXT
- `AGENTS.md`
- `docs/product/GAME_DESIGN_PRD.md`
- `docs/specs/BATTLE_SPEC.md`
- `docs/reports/HEADLESS_BATTLE_ENGINE_PHASE6.md`

## DO_NOT_REREAD_BY_DEFAULT
- Full original chat sequence.
- Phase 1–5 reports unless regression investigation requires them.
- Dungeon spec until Battle Engine core reaches feature-complete baseline.

## Human Gate
- Merge to `main`: REQUIRED
- Production deploy/release: REQUIRED
