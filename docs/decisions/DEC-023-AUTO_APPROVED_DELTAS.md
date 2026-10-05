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
| A-15 | Run | Party level growth per level: HP +5%, ATK/DEF/INT +4%, SPD +1% over Lv.1 base | gives levels meaning without permanent growth |
| A-16 | Run | Late recruits get catch-up trait picks for missed trait levels | AC-005-02 level sync without power gap |
| A-17 | Run | Safe zone fully heals and treats KO members; shop + identify + enhance | spec "안전 정비구역" |
| A-18 | Run | Sorcery-empowered encounters give enemies +30 entry energy | expresses Yellow Turban 술법진 via existing battle contract |
| A-19 | Run | Retreat leaves KO members KO (treatment needed); victory restores KO to 10% max HP | BATTLE_SPEC §11 / §12 |
| A-20 | Run | Food 0 removes trait entry-energy bonuses (battle start penalty) | DUNGEON_SPEC §7 "전투 시작 페널티" |
| A-21 | Content | Starting unlocks: 3 rulers + 관우/장비/장료/하후돈/태사자/감녕; others unlock via depth/boss/run-count rules; Hulao unlocks on Yellow Turban clear | DEC-002 lateral unlocks |
| A-22 | Smart Auto | Overkill penalty capped at 15 (< lethal bonus 35) | fixed bug: Smart Auto guarded instead of killing a 1-HP enemy |
| A-23 | Run | Starting supplies: herb ×2, bun ×1 | first-floor attrition fix found by simulation |
| A-24 | Content | Campaign `startLevel` (Hulao preview starts at Lv.5 with Lv.2/4 trait picks) | preview of a later expedition must be playable without meta stat growth (DEC-016 kept) |
| A-25 | Balance | Tier scales / 조조 kit / Yellow Turban alarm from 6F — simulation-tuned, NOT_VALIDATED for humans | P13 evidence |
| A-26 | Stack | Web client: no framework, browser-native ES modules from the same TS, Canvas + DOM, localStorage (meta + seed/command-log save), static hosting; deploy remains a Human Gate | zero cost, zero new deps, reuses headless domain directly (resolves OD-001/U-002 for MVP) |
| A-27 | Art (OD-002) | Pixel art direction: procedural 16×16 field sprites + 32×32 bust portraits, 12×12 item icons, pixel dungeon tiles, lacquer-red/gold framed UI (user requested dot design, 2026-10-05) | no external assets/licensing; parts-based so new characters are data |
