# DEC-023 — Auto-approved Implementation Deltas

- State: APPROVED (user delegated: "향후 남은 과제는 합리적 권장 판단으로 자동 승인", 2026-10-05)
- Scope: implementation-level choices where BASELINE specs are silent. No Product Baseline material change.
- Human Gates unchanged: main merge, production deploy, paid services.

| ID | Area | Decision | Rationale |
|---|---|---|---|
| A-01 | Battle | KO clears all statuses on the unit | standard roguelite expectation; avoids stale stun/DOT after revive |
| A-02 | Battle | Revived unit energy = 0 | KO loses morale; prevents revive→instant ultimate loops |
| A-03 | Battle | Strategy damage is evadable (base 3%) | spec states base evasion without qualifier |
| A-04 | Battle | Evaded damage → the rest of that action misses the same enemy target | "miss" reads as whole-attack miss; ally-targeted effects unaffected |
| A-05 | Battle | Loadout limit ≤3 active + ≤1 ultimate for ally side only; enemies/bosses free | spec §9 is about player generals; keeps boss design open |
| A-06 | Battle | Save/resume = seed + command log replay; no engine restore API | determinism already guaranteed; smaller surface |
| A-07 | Battle | Extra-action / interrupt as Effect type; skills with it must cost ≥1 energy | enables 조운 연속행동, prevents unbounded chains |
| A-08 | Smart Auto | No low-HP guard at full energy; ultimate reserve weight 0.3; DOT-aware cleanse | soft-lock fix + R-002 findings |
| A-09 | Repo | GitHub Actions CI on every push (public repo → free) | prevents silent broken builds (Phase 5–7 incident) |
| A-10 | Dungeon | Trap damage cannot KO (min 1 HP) | avoids unfair instant run loss from hidden traps |
| A-11 | Dungeon | Starvation −2% max HP per 3 turns, can KO | keeps food pressure meaningful (spec "지속 피해 가능") |
| A-12 | Dungeon | Corridor detection: front cone at range 3, sides when adjacent, rear never | makes rear contact (spec surprise) possible |
| A-13 | Dungeon | Auto explore never steps on revealed traps; explicit travel uses them only as last resort | predictable automation |
| A-14 | Dungeon | Low HP / low food auto-stops fire once per entry into the risk state | prevents permanently blocked auto explore |
