# Dungeon Core — Phase 10

Status: `PASS_LOCAL / CI_ON_PUSH`
Date: `2026-10-05`

## Scope (DUNGEON_SPEC v0.1, DEC-004)
Pure TS, seeded, renderer-free: `src/dungeon/{geometry,balance,floor,engine}.ts`.

| Spec § | Implemented |
|---|---|
| §2 generation | rooms 5–9 → Prim MST + ≤2 loop edges → L corridors → 0–2 dead ends → secret room (~17%/floor) → content; start/stairs = room-graph diameter endpoints; reachability validated, 50 deterministic retries |
| §3 vision | room fully visible (+walls), corridor radius 1, explored memory; fog/night limit room vision |
| §4 time | move/wait/search/interact/spend-turn = 1 turn; face = 0; wall bump = 0 |
| §5 AI | IDLE/PATROL/ALERT/CHASE/SEARCH/ENGAGE; same-room immediate detection; corridor range 3 front cone, sides when adjacent, never rear; BFS chase, last-known search |
| §6 surprise | Player Surprise = bump unaware enemy from its rear arc; Enemy Surprise = chaser reaches player's rear unseen |
| §7–8 food/recovery | −1 food / 10 turns; +1% max HP / 3 turns when food > 0; starvation −2% / 3 turns (can KO, A-11) |
| §9–10 danger/reinforcement | stable/caution/danger at 150/300 turns; checks every 25 turns (25%/50%); far rooms out of view, not player/stairs/secret room; cap initial+3; flagged `reinforcement` |
| §11 traps | 8 types, hidden until stepped/searched/passive; damage cannot KO (A-10); revealed traps also hit enemies |
| §12 secrets | hidden passage revealed by search; auto explore stops on hint |
| §13 modifiers | fog/smoke reduce detection; fog/night limit vision; dry/wind/rain scale fire traps |
| §14 auto explore | frontier BFS on same turn engine; stops: enemy, item, recruit, event, special room, trap, secret hint, stairs, low HP/food (latched) |
| §15 stairs | descend only on stairs; boss floors locked until boss defeated |
| §16 mechanics | Yellow Turban: alarm network (alarm → reinforcement), sorcery formations (empowered encounters, destroy via interact). Hulao: gates + stationary defenders, gate opens when defenders fall |

Battle hand-off: `Encounter{groupId, surprise, boss, empowered, reinforcement, enemyHpRatio, retreatAllowed}` → Run layer builds `BattleDefinition`; `resolveEncounter(victory|retreat|defeat, party)`.

## Verification
- `npm test`: strict build PASS, **125 passed / 0 failed** (new `test/dungeon.test.mjs` 19).
- Generator: 300 seeds — main rooms span exactly {5..9}, stairs/enemies reachable, secret rate within 10–30% and closed until searched (test found and fixed a bypass bug), gates block stairs until opened.
- Observational smoke (scratch driver, 200 floors, auto explore + auto-win): 200/200 descended, median 132 turns, ally surprises occur naturally.

## Decisions (DEC-023)
A-10 trap damage cannot KO · A-11 starvation can KO · A-12 corridor rear arc is never noticed (enables surprise) · A-13 auto explore never paths over revealed traps; explicit travel only as last resort · A-14 risk stops latch until cleared.
