# Headless Battle Engine — Phase 1 Evidence

Status: `PASS` for deterministic RNG scope only
Date: `2026-10-05`
Branch: `feature/headless-battle-engine`

## Scope

This phase implements the first approved Headless Battle Engine dependency: a deterministic Seeded RNG that is independent from Renderer/UI code.

## Requirement Traceability

| Requirement | Acceptance Criterion | Implementation | Test | Verification |
|---|---|---|---|---|
| FR-001 Deterministic Run State | AC-001-01 RNG output must originate from a seeded RNG contract | `src/core/rng.ts` | `test/rng.test.mjs` | `TESTED / PASS` |
| FR-001 Deterministic Run State | AC-001-02 replay fixture produces same final state hash | NOT_STARTED | NOT_RUN | `NOT_RUN` |

## Implemented Contract

- Stable algorithm identifier: `mulberry32-v1`
- String or numeric seeds
- `nextUint32()` / `nextFloat()` / unbiased bounded `nextInt()`
- probability checks
- deterministic `pick()` / `shuffle()`
- snapshot / restore
- deterministic named `fork()` streams without consuming the parent stream
- fixed Golden Vector to detect accidental algorithm drift

## Verification

Command:

```bash
npm test
```

Observed result:

- TypeScript build: `PASS`
- Node headless tests: `8 passed / 0 failed`
- Golden vector: `PASS`
- snapshot/restore continuation: `PASS`
- named stream isolation: `PASS`
- 10,000 bounded integer samples remained within range: `PASS`

## Not Yet Implemented

- Unit/Stats model
- SPD Timeline
- Damage/Status engine
- Battle state machine
- Manual/Smart Auto command contract
- Battle replay state hash
- CI workflow

## Next

Implement Unit/Stats domain contracts and SPD Timeline on the same feature branch, reusing this RNG contract. Do not start Renderer/UI work yet.
