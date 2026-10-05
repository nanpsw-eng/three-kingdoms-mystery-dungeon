# Headless Battle Engine — Phase 8 Battle Entry Contract & Baseline Gaps

Status: `PASS_LOCAL / REMOTE_PERSISTED / CI_NOT_RUN`
Date: `2026-10-05`
Branch: `feature/headless-battle-engine`
Exact tested source/test commit: `adadfbd`
Input: `BATTLE_CORE_FEATURE_REVIEW.md` §3 (B1–B3) + N7

## 1. Delta

| ID | Change | Files |
|---|---|---|
| B1 | `BattleParticipantDefinition.entry?: { hp?, energy? }` (default full HP / 0). `hp=0` → unit starts KO: recorded in `koSlots` at its declared slot, not in formation/timeline, revivable. Validation: integer HP 0..maxHp, energy 0..100, ≥1 living unit per side, no slot collision incl. KO entries | `unit.ts`, `battle.ts` |
| B2 | `BattleDefinition.surprise?: "ally" \| "enemy"`. Surprising side's living units: `+15` energy (clamped 100), first action delay × `0.8`. Other side unchanged. KO-at-entry units get nothing | `battle.ts`, `balance.ts` |
| B3 | Base evasion `3%` per damage instance (attack, skill/ultimate/item damage, confusion hit; not DOT). Rolled from a dedicated named stream `battle::evasion` (`snapshot.evasionRng`). Evaded → `{applied:false, amount:0, evaded:true}`, no damage roll, no hit/crit/kill energy. Per-effect `evasionChance` override (validated 0..1), mirroring `critChance` | `battle.ts`, `action.ts`, `balance.ts` |
| N7 | test for `retreatAllowed:false` | tests |
| Fix | **Smart Auto mutual-guard soft lock** (pre-existing, exposed by B3 at seed `rep-5v5-38`: last low-HP unit on each side guarded forever). Low-HP guard bonus now requires energy < 100 → at most 5 consecutive guards. Applied to Basic and Smart Auto | `auto.ts` |
| Auto | Smart Auto expected damage × hit chance (1 − evasion) | `auto.ts` |

New canonical constants: `src/battle/balance.ts` — `BASE_EVASION_CHANCE=0.03`, `SURPRISE_INITIAL_ENERGY=15`, `SURPRISE_INITIAL_ACTION_DELAY_MODIFIER=0.8` (BALANCE_SEED candidates, `NOT_VALIDATED`).

## 2. Test Execution

Command: `npm test` (strict `tsc` + `node --test test/*.test.mjs`), executed twice.

| Check | Result |
|---|---|
| TypeScript strict build | `PASS` |
| Total | **`95 passed / 0 failed`** (83 → 95) |
| New `test/battle-entry.test.mjs` | `12 passed / 0 failed` |

Evidence highlights:
- B1: entry HP 37 / energy 60 carried; HP 0 entry → KO, `koSlots=[downed@front-left]`, off timeline, revived to `front-left` with HP 10; 6 invalid-entry cases rejected
- B2: ally surprise → +15 energy (90→100 clamp, KO entry 0), first `readyAt` 100 → 80, equal-SPD ambushers act before the enemy; enemy surprise mirrored; invalid value rejected
- B3: `evasionChance:1` → evaded, HP/energy unchanged, damage RNG stream untouched; `evasionChance:0` never evades (20 seeds); 100-seed 5v5 batch evasion rate **138 / 4740 = 2.91%**
- Anti-stall: lone low-HP units, 10 seeds × Basic/Smart Auto terminate ≤200 actions. **Verified the test fails (`exceeded maxActions=200`) with the fix disabled.**
- N7: retreat throws `Retreat is not allowed`, outcome stays `ongoing`

### Intentional golden re-pin (B3 changes the RNG trajectory and snapshot shape)
| Golden | Before | After |
|---|---|---|
| Phase 7 mixed replay `stateHash` | `6503461c` | `40a9763c` (lethal test skill now `evasionChance:0`) |
| 5v5 Smart Auto `rep-5v5-golden` | ally-victory / 69 / `dc1c2644` | ally-victory / 88 / `adacb8ac` |

### Observational 5v5 batch after Phase 8 (NOT balance evidence)
Seeds `rep-5v5-0..999`, Smart Auto both sides: 1000/1000 terminated, 0 errors, actions min/median/max 36/58/95; ally-victory 718 / enemy-victory 282; ultimates 81 (was 10/200 → still low).

## 3. Decisions Taken (Delta, reversible) — confirm or override

| Item | Chosen | Alternative |
|---|---|---|
| Strategy damage evadable | yes (spec says base evasion without qualifier) | physical only |
| Evasion scope | single damage instance; other effects of the same skill (e.g. status) still apply | whole skill misses that target |
| Surprise with KO-at-entry | no bonus | — |
| Entry state location | on participant (`entry`), not on static unit definition | — |

## 4. Remaining NOT_RUN / DECISION_REQUIRED
- GitHub CI: `NOT_RUN` (no workflow; repository visibility change requested by user — user action)
- §3 decisions above: `DECISION_REQUIRED` (defaults implemented)
- Phase 7 carry-over: statuses through KO→revive, revived energy
- Backlog N1–N6, N8–N11 (review report §5); Smart Auto ultimate starvation still observed
- Balance of 3% / +15 / 0.8: `NOT_VALIDATED`

## 5. Gate

`BATTLE_ENTRY_CONTRACT_PASS / DUNGEON_CORE_READY` — B1–B3 blocking gaps closed; Dungeon Core can consume the battle via `BattleDefinition{participants[].entry, surprise, retreatAllowed}` and read results from `snapshot().units`.
