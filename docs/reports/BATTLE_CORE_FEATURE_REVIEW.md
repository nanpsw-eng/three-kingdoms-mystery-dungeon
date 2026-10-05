# Battle Core Feature-Complete Review

Status: `REVIEW_DONE / CI_NOT_RUN` — B1–B3 and N7 closed in Phase 8 (`HEADLESS_BATTLE_ENGINE_PHASE8.md`); golden values in §6 re-pinned there
Date: `2026-10-05`
Branch: `feature/headless-battle-engine`
Reviewed source: `34b7d4c` (Phase 7 PASS) + review tests in this change
Reference: `BATTLE_SPEC.md` v0.1 (BASELINE), `BALANCE_SEED.md`, `GAME_DESIGN_PRD.md` §5.7/§5.10/FR-004, `CHARACTER_ROSTER_MVP.md`

## 1. Verdict

| Item | Result |
|---|---|
| Battle rules implemented vs spec | ~75% of headless-scope items DONE (matrix §2) |
| Determinism / replay / Manual-Auto shared contract | `PASS` |
| Ready to hand to Dungeon Core | **`NO` — 3 blocking gaps (§3 B1–B3)** |
| Gate | `BATTLE_CORE_REVIEW_DONE / BATTLE_ENTRY_CONTRACT_NEXT` |

## 2. Coverage Matrix (BATTLE_SPEC v0.1)

Legend: `DONE` implemented + tested · `PARTIAL` · `MISSING` · `OUT_OF_SCOPE` (renderer/dungeon layer)

| § | Spec item | Status | Evidence / Note |
|---|---|---|---|
| 1 | Max 5v5, front 3 / rear 2 | DONE | constructor rejects >5/side; `FORMATION_SLOTS` |
| 1 | Position change costs 1 action | DONE | `formation` command test |
| 1 | Some skills free/forced move | PARTIAL | `formation-swap` (actor↔ally) only; no enemy forced move, no "free" (non-consuming) move |
| 2 | Melee front-only while front alive | DONE | battle.test |
| 2 | Archer front/rear | DONE | battle.test |
| 2 | Cavalry breakthrough via skill | DONE | skill `access:"any"` (fixture `breakthrough`) |
| 2 | Strategist/support per-skill rules | DONE | `AbilityTargeting` team/access/state |
| 2 | Front collapse exposes rear | DONE | battle.test |
| 3 | `10000/SPD × modifier` | DONE | timeline.test |
| 3 | delay / advance | DONE | `timeline-shift` effect, `timeline-delay` status |
| 3 | extra action / interrupt | PARTIAL | timeline primitives tested; **no Skill/Effect exposes them** (조운 "연속행동" needs it) |
| 4 | HP/ATK/DEF/SPD/INT | DONE | unit.test |
| 4 | Derived stats from equip/trait/skill | MISSING (deferred) | no modifier layer; needed for Run growth, not for Dungeon Core start |
| 5 | Physical/Strategy formulas, variance 0.95–1.05 | DONE | damage.test |
| 6 | Crit 5% / 150% | DONE | damage.test |
| 6 | **Base evasion ~3%** | **MISSING** | no evasion roll anywhere |
| 7 | Energy max 100 and gain seeds (+18/+8/+20/+12/+5) | DONE | unit/battle tests |
| 7 | Ultimate −100 | DONE | skill-effect.test |
| 7 | Energy reset at battle end | PARTIAL | reset on retreat only; units are rebuilt at 0 per battle, so effectively met — keep as contract note |
| 8 | 8 statuses, DOT stack 3, others non-stacking | DONE | status/status-runtime tests |
| 9 | Attack / Active 1–3 / Guard / Formation / Item / Retreat / Ultimate | DONE (commands) | loadout limit "Active 1–3" **not validated** (any count accepted) |
| 10 | Manual / Smart Auto same command contract | DONE | new manual-replay test (5v5) |
| 10 | **All Attack / Repeat** modes | MISSING | only Basic Smart / Smart Auto choosers |
| 10 | ×1/×2/×3 speed | OUT_OF_SCOPE | presentation layer |
| 10 | Smart Auto never uses items | DONE | smart-auto.test + 5v5 batch |
| 10 | Smart Auto factors | PARTIAL | see §4 |
| 11 | KO, battle continues, all-KO fail | DONE | battle.test |
| 11 | Post-victory KO → ~10% HP | OUT_OF_SCOPE (Dungeon/Run) | engine exposes final `snapshot().units` |
| — | In-battle revive only by special skill/item (PRD §5.10) | DONE | Phase 7 |
| 12 | Retreat succeeds after next enemy action; energy reset | DONE | skill-effect.test |
| 12 | Boss: retreat disallowed | PARTIAL | `retreatAllowed:false` exists; **no test** |
| 12 | No reward / enemy keep-recover / ALERT | OUT_OF_SCOPE (Dungeon) | |
| 13 | **Surprise: timeline advantage + initial energy** | **MISSING** | no battle-entry modifiers |
| — | Seeded determinism / state hash | DONE | golden hashes `6503461c` (Phase 7), `dc1c2644` (5v5) |

### Integration contract gap (not a spec line, but required by Dungeon Core)
| Item | Status |
|---|---|
| Entry HP / KO-at-entry / entry energy per unit | **MISSING** — `BattleUnitDefinition` has stats only; every battle starts at full HP, 0 energy |
| Battle result export (final HP/KO per unit) | DONE via `snapshot()` (no dedicated result type) |
| Mid-battle save/resume (`BattleEngine.restore`) | MISSING — `DECISION_REQUIRED` whether mobile suspend needs it |

## 3. Blocking Gaps for Dungeon Core Handoff

| ID | Gap | Why blocking | Proposed shape (Delta, no baseline change) |
|---|---|---|---|
| B1 | Battle entry state | HP persistence, natural heal, KO recovery 10% are Dungeon rules; battle must accept them | `BattleUnitDefinition.initial?: { hp?: number; energy?: number }`; hp=0 → starts KO (off formation/timeline, in `koSlots`) |
| B2 | Surprise modifiers | Dungeon detection outputs ally/enemy surprise (PRD §5.4) | `BattleDefinition.surprise?: "ally" \| "enemy"` → side gets +15 initial energy and first action at ~80% delay (BALANCE_SEED candidates, canonical constants) |
| B3 | Base evasion 3% | BASELINE spec item; adding later changes every RNG stream / golden hash | evasion roll per damage instance from a named RNG stream, `EffectResolution.evaded`; skill-level `evasionBypass?` reserved |

## 4. Smart Auto Review

Commands handled: attack, guard, skill, ultimate. Not used by design: item, retreat (spec). Not used: formation (no policy) → `PARTIAL`.
All 8 effect types are scored (Phase 7 added cleanse/revive).

| Spec factor | Status |
|---|---|
| kill probability | PARTIAL (expected damage ≥ HP bonus, not probability) |
| damage value / overkill / status value / healing need | DONE |
| energy efficiency | PARTIAL (linear cost penalty; no ultimate saving) |
| ally death risk | PARTIAL (low-HP self guard only) |
| high-value enemy / next timeline action / position exposure / boss context | MISSING |

### Observational 5v5 batch (NOT balance evidence)
Command: scratch script, representative fixture, seeds `rep-5v5-0..199`, Smart Auto both sides.
- terminated 200/200, errors 0, actions min/median/max = 39/58/98
- outcomes: ally-victory 140, enemy-victory 60 (fixture is not balanced content; do not interpret)
- commands: attack 6397, skill 3861, guard 1328, **ultimate 10**
- `war-god` ultimate 0 uses; `detox` 9 vs `poison-plot` 784; `rally`, `treachery`, `rear-swap` 0
- Findings (Smart Auto quality, R-002): **ultimate starvation** (energy always spent on actives), **cleanse undervalued** vs remaining DOT damage, control/support skills under-selected. → policy tuning item, `NOT_VALIDATED`.

## 5. Non-blocking Gaps (backlog, recommended order)

| ID | Item | Priority |
|---|---|---|
| N1 | All Attack / Repeat choosers (same command contract) | P1 (PRD mode list) |
| N2 | extra-action / interrupt Effect types | P1 (roster 조운/연속행동) |
| N3 | Smart Auto: ultimate energy saving, DOT-aware cleanse, timeline/high-value targeting | P1 |
| N4 | Loadout validation: ≤3 active + ≤1 ultimate (enemy/boss exception = `DECISION_REQUIRED`) | P2 |
| N5 | Forced movement (enemy) / free move effect | P2 |
| N6 | Balance constants consolidated into one canonical config module (AGENTS §3) — currently spread over `battle.ts`/`damage.ts`/`unit.ts`/`status.ts`/`timeline.ts`/`auto.ts` | P2 |
| N7 | Boss `retreatAllowed:false` test | P2 (trivial) |
| N8 | Derived-stat modifier layer (equipment/trait) | deferred to Run growth |
| N9 | `BattleEngine.restore(snapshot)` | `DECISION_REQUIRED` |
| N10 | Statuses persisting through KO→revive; revived unit energy | `DECISION_REQUIRED` (Phase 7) |
| N11 | GitHub Actions `npm test` | recommended; `HUMAN_GATE` if cost applies |

## 6. Tests Added in This Review

`test/battle-core-review.test.mjs` + `test/fixtures/representative-5v5.mjs` (roster stats, BALANCE_SEED powers, stand-in skills — **not canonical content**)
1. fixture covers all 8 effect types, 5 units per side
2. 5v5 Smart Auto determinism + golden `{ally-victory, 69 actions, dc1c2644}`; `simulateSmartBattle` matches
3. Manual replay of Auto command log → identical hash (AC-004-03)
4. 100-seed 5v5 batch terminates; attack/skill/guard/ultimate and damage/status/heal/cleanse/revive/timeline-shift exercised; no item/retreat

Result: `npm test` → strict build PASS, **83 passed / 0 failed** (79 + 4).

## 7. Next Safe Action

Phase 8 — Battle Entry Contract & Baseline Gaps: B1 → B2 → B3 (each with tests; B3 re-pins golden hashes intentionally), then N7. Dungeon Core starts only after Phase 8 PASS.
