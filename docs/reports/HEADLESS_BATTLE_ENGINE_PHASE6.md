# Headless Battle Engine — Phase 6 Status Runtime Evidence

Status: `PASS_LOCAL / REMOTE_PERSISTED / CI_NOT_RUN`
Date: `2026-10-05`
Branch: `feature/headless-battle-engine`

## Implemented Runtime Semantics

Status durations are tied to the affected unit's **normal SPD action cycle**, not to a separate hidden global clock.

Normal-turn lifecycle:
1. periodic damage is applied at the start of the affected unit's normal turn
2. Stun consumes/skips that normal action
3. Confusion auto-resolves a deterministic basic attack target using the seeded battle RNG
4. manual/automatic normal action completes
5. Timeline Delay is applied to the next normal action
6. status durations tick and expired states are removed

Extra/interrupt actions do not advance status duration.

### DOT
- Poison/Burn/Bleed use `round(magnitude × stacks)` periodic damage per affected normal turn.
- DOT does not grant ordinary hit-received energy.
- lethal DOT removes the unit from formation/timeline and resolves battle before a dead actor turn can be returned.

### Stun
- one duration unit = one skipped affected normal action.

### Confusion
- the affected unit's normal action is auto-resolved as a seeded random basic attack.
- candidate set includes normal legal enemy basic targets plus living allies other than self.
- action remains deterministic under the battle seed.

### Timeline Delay status
- `magnitude` is interpreted as absolute Timeline delay added to the affected unit's next normal action for each active duration cycle.

## Verification

Local reconstructed regression after Phase 6:
- strict TypeScript build: `PASS`
- total tests: `64 passed / 0 failed`
- new runtime tests: `5 PASS`

New checks:
1. DOT periodic damage and duration ticking
2. Stun action skip and deterministic expiry
3. Confusion automatic action
4. Timeline Delay scheduling
5. lethal DOT terminal-state handling

Remote code/test persistence:
- status-runtime BattleEngine code persisted
- `test/status-runtime.test.mjs` persisted

## Boundary
- GitHub CI exact remote HEAD: `NOT_RUN`
- Cleanse effect: `NOT_IMPLEMENTED`
- Revive effect / KO targeting: `NOT_IMPLEMENTED`
- Full character content: `NOT_STARTED`
- Dungeon Core: `NOT_STARTED`

## Next
Implement data-driven Cleanse and Revive effects, including explicit KO targeting and deterministic formation/timeline re-entry.
