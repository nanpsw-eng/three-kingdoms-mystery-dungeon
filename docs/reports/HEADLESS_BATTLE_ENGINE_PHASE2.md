# Headless Battle Engine — Phase 2 Evidence

Status: `PASS` for Unit/Stats + SPD Timeline + Damage/Status scope
Date: `2026-10-05`
Branch: `feature/headless-battle-engine`

## Scope

Phase 2 extends the deterministic RNG foundation with the approved core battle contracts, still fully independent from Renderer/UI.

## Implemented

### Unit / Stats
- Core stats: `HP / ATK / DEF / SPD / INT`
- Unit side: ally/enemy
- HP clamping and KO state
- Normal healing cannot heal KO units
- Explicit revive primitive for future rare revive skills/items
- Energy range `0..100`, clamped gain, transactional spending, reset

### SPD Timeline
- Approved formula: `ActionDelay = 10000 / SPD × ActionSpeedModifier`
- Deterministic ordering
- Normal re-scheduling after action
- Advance/delay of next normal action
- Extra action and interrupt events
- Deterministic priority: interrupt → extra → normal at equal ready time
- Actor removal clears scheduled actions

### Damage
- Physical: `SkillPower × (ATK / TargetDEF)^0.75 × Variance × Modifier`
- Strategy defense: `DEF × 0.5 + INT × 0.5`
- Strategy damage uses INT vs StrategyDEF
- Random variance: `0.95..1.05`
- Base critical chance: `5%`
- Base critical multiplier: `150%`
- Damage output rounds to integer HP and is clamped to minimum 1 after a valid damaging hit

### Status Store
MVP status vocabulary:
- poison
- burn
- bleed
- confusion
- stun
- taunt
- defense-down
- timeline-delay

Rules:
- poison/burn/bleed stack to max 3
- control statuses do not stack
- stronger magnitude wins on refresh
- longer remaining duration is retained
- deterministic round ticking and stable snapshot ordering

## Verification

Command:

```bash
npm test
```

Observed at Phase 2:
- TypeScript build: `PASS`
- Headless tests: `28 passed / 0 failed`
- RNG golden vector: `PASS`
- Unit/Stats: `PASS`
- SPD Timeline: `PASS`
- Damage formulas: `PASS`
- Status merge/tick rules: `PASS`

## Requirement Traceability

| Requirement | Implementation | Test | Verification |
|---|---|---|---|
| FR-001 deterministic RNG foundation | `src/core/rng.ts` | `test/rng.test.mjs` | TESTED / PASS |
| FR-004 party battle — core unit state | `src/battle/unit.ts` | `test/unit.test.mjs` | TESTED / PASS |
| FR-004 SPD Timeline | `src/battle/timeline.ts` | `test/timeline.test.mjs` | TESTED / PASS |
| FR-004 damage seed formulas | `src/battle/damage.ts` | `test/damage.test.mjs` | TESTED / PASS |
| FR-004 status vocabulary/stack rules | `src/battle/status.ts` | `test/status.test.mjs` | TESTED / PASS |
| FR-004 full command/state machine | implemented in Phase 3 | `test/battle.test.mjs` | see Phase 3 |
| FR-004 Smart Auto | limited core implemented in Phase 3 | `test/auto.test.mjs` | see Phase 3 |

## Next

Implement the Battle State Machine and command contract, including formation slots, legal targeting for basic attacks, guard, KO removal from timeline, energy events, battle victory/defeat, and deterministic state snapshots. Smart Auto comes only after the command contract is stable.
