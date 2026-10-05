# Run Simulation / QA / Balance — Phase 13

Status: `SIM_PASS (observational) / HUMAN_PLAYTEST_NOT_RUN`
Date: `2026-10-05`
Tool: `node scripts/simulate.mjs <runs> <campaign> <mode>` (deterministic autopilot, `src/sim/autopilot.ts`). Raw output: `docs/reports/sim/*.json`.

> Autopilot = simple baseline policy (explore, fight what it meets, heal/eat when low, rest when hurt and calm, first trait, accept recruits, buy consumables). It never retreats, searches for secrets, or plans formation. Numbers below are **not** human balance validation (BALANCE_SEED "Validation Required" stays `NOT_RUN` for human play).

## Results (final content)

| Campaign | Mode | Runs | Clear | Avg level | Avg turns | Avg battles | Notes |
|---|---|---|---|---|---|---|---|
| Yellow Turban 15F | Smart Auto | 135 | **25.9%** | 9.0 | 1763 | 40.2 | 0 stalls; fails spread 6F (tier jump), 10F/11-13F, 15F |
| Yellow Turban 15F | All Attack | 45 | 0.0% | 7.8 | 1367 | 29.8 | skills/tactics decide outcomes (PRD goal, R-002 evidence) |
| Hulao Preview 4F (start Lv.5) | Smart Auto | 60 | 61.7% | 7.6 | 533 | 14.2 | gates opened 2.53/run (AC-007-02 mechanic exercised) |

Sampling crosses every ruler with every starting-general pair (45 combos). Ruler clear (YT): 유비 8/45, 조조 16/45, 손권 11/45 (n=45 each, ±13% at 95% → not significant). General clear: 22–27% each.

## Bugs / issues found by simulation and fixed
1. **Smart Auto unbounded overkill penalty** → guarded instead of killing a 1-HP enemy (A-22, test added).
2. **Autopilot never collected recruits/items** → party stayed at 3 (policy fix).
3. **Alarm chains on 1-4F** → 3 fights in 4 turns; Yellow Turban alarm-heavy trap table and alarm network moved to 6F+.
4. **Hulao preview unwinnable at Lv.1** → campaign `startLevel` (A-24).
5. **Sampling confound** in the sim script (ruler ↔ general pair correlation) → full cross design.

## Tuning applied (all in content/balance data, BALANCE_SEED status stays NOT_VALIDATED)
- Tier scale T1 0.85 / T2 1.32 / T3 1.65 (clear rate is very sensitive: T2 1.35 + T3 1.7 → 16%).
- 2-unit `yt-scouts` on 1-2F; starting supplies herb×2 + bun (A-23).
- 조조: 간웅의 검 36 / 용병지략 cost 30 + heal 18 / 위무천하 48×0.8 (was 11% clear vs 40-51% for heal rulers).
- Hulao troops ×0.95, start Lv.5.

## Open (cannot be closed headless)
- U-001 20–30 min run time: turns are measured (≈1760/run) but wall-clock depends on UI/animation → `NOT_RUN`.
- R-001 trait choice fatigue: ≈20 trait picks per YT run (5 members × 5 levels) → flagged for UX playtest.
- R-002 Smart Auto vs manual: only Auto modes simulated; manual comparison needs human play.
- Secrets/retreat are not used by the autopilot (coverage via unit tests only).
