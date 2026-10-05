# Headless Battle Engine — Phase 3 Evidence

Status: `PASS_WITH_LIMITATIONS`
Date: `2026-10-05`
Branch: `feature/headless-battle-engine`

## Scope

Phase 3 connects the validated deterministic primitives into an executable basic Battle State Machine and a deliberately limited Basic Smart Auto policy.

## Implemented Battle State Machine
- Max-five-per-side validation
- Formation slots: front-left / front-center / front-right / rear-left / rear-right
- Melee front-row targeting and rear exposure after front collapse
- Ranged basic attack access to front/rear
- Formation move/swap consuming an action
- Basic physical attack using approved damage seed formula
- Energy events: basic attack / hit received / kill / critical / guard
- Guard state with balance-seed candidate damage multiplier `0.70`
- KO removal from formation and Timeline
- Ally/enemy victory resolution
- Stable battle snapshot and FNV-1a state hash
- Same seed + same command sequence → same final state hash

## Equal-SPD Tie-Break Remediation

Initial simulation exposed a structural bias: equal SPD was resolved by participant registration order. In a symmetric 2v2 mirror simulation this produced:

- Ally victory: `491 / 500`
- Enemy victory: `9 / 500`

This was unacceptable because the caller's side/order became a hidden combat advantage.

Remediation:
- Battle initialization now uses an isolated named RNG fork: `initial-timeline-order`.
- Equal-SPD initial registration order is seed-shuffled deterministically.
- The fork does not consume damage/critical RNG.

Regression evidence after remediation, symmetric 2v2 over 500 seeds:
- Ally victory: `220 / 500`
- Enemy victory: `280 / 500`

Interpretation: `PASS` for removal of the former deterministic registration-order dominance. This is **not** a claim of final balance; full balance remains `NOT_RUN`.

## Basic Smart Auto

Implemented only against the currently executable command subset:
- choose a legal lethal basic-attack target first
- otherwise select low-HP / efficient legal target
- guard when actor HP ratio is below policy threshold and no lethal target exists

Explicit limitation:
- Skill, Ultimate, item, retreat, status utility, and advanced formation reasoning are not yet implemented in Smart Auto.
- Therefore this is `BASIC_AUTO_CORE`, not final `SMART_AUTO_VALIDATED`.

## Simulation Evidence

`100` seeded 2v2 Basic Smart Auto battles:
- all terminated below `500` actions
- no soft lock observed

A sample asymmetric seed set before the tie-break remediation produced 96 ally / 4 enemy wins; this is not used as a balance result because the teams were intentionally not symmetric.

## Verification

Command:

```bash
npm test
```

Observed final local result:
- TypeScript strict build: `PASS`
- Headless tests: `40 passed / 0 failed`
- Deterministic final state hash: `PASS`
- 100-run no-soft-lock simulation: `PASS`
- Equal-SPD registration-order bias regression: `PASS`

## Verification Boundary

- Local headless verification: `PASS`
- GitHub CI: `NOT_RUN`
- Production/runtime UI validation: `NOT_RUN`

## Not Yet Implemented / NOT_RUN
- Skill command execution
- Ultimate execution
- Item command execution
- Retreat state machine
- Status application integrated into command execution
- Round/status lifecycle integrated with Timeline
- Full Smart Auto utility scoring
- 5v5 roster balance simulation
- 15-character balance simulation
- CI workflow
- Renderer/UI

## Next

Stabilize the full command schema and skill/effect execution model. Integrate status/timeline effects through data-driven skill definitions before expanding Smart Auto.
