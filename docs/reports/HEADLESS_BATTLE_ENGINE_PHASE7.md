# Headless Battle Engine — Phase 7 Cleanse / Revive / KO Targeting Evidence

Status: `PASS_LOCAL / REMOTE_PERSISTED / CI_NOT_RUN`
Date: `2026-10-05`
Branch: `feature/headless-battle-engine`

## 1. Tested HEAD

| Item | Value |
|---|---|
| Recovery baseline (remote HEAD at session start) | `c970279723956b951d69506fcb6a6b3927192ec5` |
| Baseline test result | `FAILED` — `tsc` strict build error, 0 tests executed |
| Fix commit | `8c6c3fd` fix(battle): restore strict build and close Phase 7 cleanse/revive gaps |
| Test commit (exact tested source) | `bddf51e` test(battle): add Phase 7 cleanse/revive/KO-targeting and mixed replay tests |
| Toolchain | Node `v22.22.0`, TypeScript `5.9.3`, `strict: true` |

`bddf51e` is the exact source/test tree verified below. Commits after it on this branch are docs only (this report and the handoff).

## 2. Recovery Findings (baseline `c970279`)

1. **Strict build broken since `43fb7eb` (Phase 5)**: `src/battle/battle.ts` line 47 contained a literal `\n` character sequence between `ownedSkills()` and `legalAbilityTargets()` → `TS1127 Invalid character`.
   - Verified: Phase 6 remote HEAD `c28b8c1` also fails to build.
   - Consequence: Phase 5/6 "PASS" (incl. `64/64`) was local-reconstruction evidence only; the remote tree was never green. Re-classified as `UNVERIFIED_ON_REMOTE`.
   - Actual repository test count before Phase 7 tests: **62** (not 64). The 2-test gap vs. the Phase 6 report is `UNKNOWN` (likely tests never persisted).
2. **Smart Auto `effectScore` non-exhaustive** for the new `cleanse` / `revive` effect types → `TS2366`.
3. **`koSlots` not in `BattleSnapshot`** → `stateHash()` did not cover KO slot memory (hash-completeness gap).
4. **Revive with `state=any` on a living target threw** (`Revive target must be KO`) — made `state=any` revive skills unusable for Manual/Smart Auto when a living ally was selected.

## 3. Fix Delta (minimal patch, `8c6c3fd`)

| File | Change |
|---|---|
| `src/battle/battle.ts` | literal `\n` → real newline; revive on living target → `applied:false` no-op; `BattleSnapshot.koSlots` (sorted by `unitId`) added to snapshot/hash |
| `src/battle/auto.ts` | `cleanse` score = Σ statusUtility(removed) × 0.8 (ally +, enemy −); `revive` score = 40 + revivedHp × 0.5 (ally +); non-revive effects on KO targets are skipped in scoring, mirroring the engine |

No Product Baseline change. No balance constant in canonical data changed.

## 4. Phase 7 Implementation Scope (present in HEAD, verified here)

- `AbilityTargetState = "living" | "ko" | "any"`, default `living`
- `CleanseEffectDefinition { statusTypes? }` — omitted = all statuses
- `ReviveEffectDefinition { hpRatio ∈ (0,1] }` — revive skills/items must target `ally` with `state=ko|any`
- `StatusStore.clear(statusTypes?)` — returns removed statuses sorted by type
- `#recordKnockout`: KO slot memory, timeline/formation/guard/pendingShift cleanup (all KO paths: damage + lethal DOT)
- `#reviveUnit`: HP = `max(1, round(maxHp × hpRatio))`; original slot if free, else first free `FORMATION_SLOTS` slot; timeline re-registration at `time + 10000/SPD`

## 5. Test Execution

Command: `npm install && npm test` (= `tsc -p tsconfig.json && node --test test/*.test.mjs`)

| Check | Result |
|---|---|
| TypeScript strict build | `PASS` |
| Existing regression (12 files) | `62 passed / 0 failed` |
| New `test/cleanse-revive.test.mjs` | `17 passed / 0 failed` |
| **Total** | **`79 passed / 0 failed`** |

`cleanse-revive.test.mjs` also executed twice standalone: `17/17` both runs.

### 5.1 KO Targeting evidence
- default `living` excludes KO; `ko` returns only KO; `any` = living + KO; `self + ko` → `[]`
- plain heal (default targeting) on KO → `Illegal ability target`
- enemy basic/skill targeting excludes KO units
- validation: revive with `state=living` / `team=enemy` / `hpRatio ∉ (0,1]` / `self+ko` rejected; cleanse empty or duplicate `statusTypes` rejected

### 5.2 Cleanse evidence
- `poison+burn+defense-down` → `purify(poison)` leaves `[burn, defense-down]`, resolution `{applied:true, amount:1}`
- omitted `statusTypes` removes all 3
- nothing to remove → `{applied:false, amount:0}`, statuses unchanged, identical `stateHash` across two runs
- `StatusStore.clear` returns removed statuses type-sorted, skips missing types; snapshot order preserved

### 5.3 Revive evidence
- KO records `koSlots=[{tank, front-left}]`, removed from formation/timeline/guarding
- revive `hpRatio 0.3`, maxHp 81 → HP `24` (= round(24.3)); `koSlots=[]`; back in `front-left`
- timeline: exactly one `normal` entry at `time + 10000/50`; revived unit later receives a real turn
- original slot occupied (ally moved into `front-left`) → revived to `front-center` (first free in `FORMATION_SLOTS`)
- `heal` effect on KO via `state=any` → `{applied:false}`, unit stays KO / off timeline
- revive on living target via `state=any` → `{applied:false}`, HP unchanged
- revive item consumes inventory and restores HP `round(81×0.1)=8`
- Smart Auto selects revive for a KO ally; selects cleanse for a 3-debuff ally

### 5.4 Deterministic mixed replay evidence
Fixture `phase7-mixed-replay`: basic attack → status skill (hex) → cleanse → KO (nuke) → revive → revived unit timeline action → heal skill.
- two independent runs: identical `stateHash`, effect log, `turnIndex`
- golden `stateHash` pinned: **`6503461c`**

### 5.5 Regression coverage (existing 62 tests, all PASS)
melee front-row protection, ranged rear targeting, front-collapse exposure, guard, formation swap, damage formula, critical, status store/runtime (DOT/stun/confusion/timeline-delay), Smart Auto basic/skill/ultimate, item, ultimate, retreat, KO, victory/defeat, state hash determinism, 100-seed soft-lock simulations, RNG golden vector.

## 6. Remaining NOT_RUN / UNKNOWN / DECISION_REQUIRED

| Item | Status |
|---|---|
| GitHub CI on exact HEAD | `NOT_RUN` (no workflow in repository) |
| "No free slot" revive error | `NOT_TESTABLE_VIA_PUBLIC_API` — ≤5 units/side vs 5 slots makes it structurally unreachable; kept as defensive guard |
| Statuses on KO unit persist through revive (e.g. stale DOT/stun) | `DECISION_REQUIRED` — spec silent; current behavior: kept |
| Energy of revived unit | current behavior: unchanged from KO moment; spec silent → `DECISION_REQUIRED` (low priority) |
| Smart Auto heal score on a unit revived earlier in the same skill | approximation (uses pre-revive HP) — `KNOWN_LIMITATION` |
| Phase 6 "64 tests" vs repository 62 | `UNKNOWN` |
| Balance / UX quality of cleanse/revive scoring weights | `NOT_RUN` |

## 7. Next

`BATTLE_CORE_REVIEW_NEXT` — Battle Core Feature-Complete Review:
1. BATTLE_SPEC vs implementation coverage matrix
2. missing commands/effects
3. Smart Auto coverage of all implemented commands
4. expanded deterministic simulation incl. cleanse/revive skills
5. representative 5v5 fixture
6. Gate decision: hand off `HEADLESS_BATTLE_ENGINE` to Dungeon Core
7. Recommend adding a GitHub Actions `npm test` workflow (free tier on private repo has minute quota → `HUMAN_GATE` if cost applies) to prevent another silent broken-build period
