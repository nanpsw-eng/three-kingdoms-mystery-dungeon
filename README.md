# Three Kingdoms Mystery Dungeon

삼국지 세계관에 **Mystery Dungeon(불가사의 던전형 로그라이크)**과 **Party Roguelite(파티형 로그라이트)**를 결합한 모바일 우선 웹게임 프로젝트입니다.

## Product Baseline

- 탐험: 필드에는 **대표 군주 1명만 표시**
- 던전: 방+복도 기반 절차 생성, 1행동=1턴, 시야·기습·함정·군량·증원
- 전투: 현재 던전 공간을 확대하여 **최대 5 vs 5 턴제 파티전**
- 전투 속도: Manual / All Attack / Repeat / Smart Auto, ×1 / ×2 / ×3
- 파티: 군주 1 + 자유 장수 2로 시작, 던전에서 최대 2명 추가 영입
- 성장: Party Lv.1~10, Lv.2/4/6/8/10에 장수별 3택 특성
- Meta Progression: 영구 스탯 강화 없음. 장수·전역·장비/아이템 출현 풀·도감·업적만 해금
- 목표 Run: **20~30분**

## MVP Scope

- 완성 전역: **황건적의 난 15층**
- 프리뷰 전역: **호로관 3~5층**
- 플레이어블: 군주 3명 + 일반 장수 12명
- 군주: 유비 / 조조 / 손권

## Canonical Documents

| 역할 | 경로 |
|---|---|
| Product Source of Truth | `docs/product/GAME_DESIGN_PRD.md` |
| Battle Specification | `docs/specs/BATTLE_SPEC.md` |
| Dungeon Specification | `docs/specs/DUNGEON_SPEC.md` |
| MVP Character Roster | `docs/specs/CHARACTER_ROSTER_MVP.md` |
| Balance Seed | `docs/specs/BALANCE_SEED.md` |
| Durable Decisions | `docs/decisions/DECISION_INDEX.md` |
| AI-OS Binding | `docs/ai-dev/AI_OS_BINDING.md` |
| Current Handoff | `docs/ai-dev/SESSION_HANDOFF.md` |

## Current State

`DESIGN_BASELINE_READY / IMPLEMENTATION_NOT_STARTED`

다음 작업은 **Headless Battle Engine**입니다. Seeded RNG → Unit/Stats → SPD Timeline → Damage/Status → Battle State Machine → Smart Auto → Simulation 순으로 진행합니다.
