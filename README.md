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

## Original MVP Scope (historical)

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

`STORY_AND_ART_MERGED / AUTOMATED_QA_PASS / VERCEL_CREATE_BLOCKED_403 / HUMAN_PLAYTEST_NOT_RUN`

현재 스토리는 E1–E9로 확장되었고 48명 플레이어블 캐릭터의 수묵 그래픽이 main에 반영되었습니다(PR #13). 2026-10-07 확인: 161개 테스트와 main 모바일 QA 통과. Vercel 배포 설정은 `vercel.json`, 재개 절차는 [배포 안내](docs/operations/VERCEL_DEPLOYMENT.md)를 따릅니다. Vercel 프로젝트 생성은 권한 오류(403)로 차단되어 실제 서비스 URL은 아직 생성되지 않았습니다.

| Layer | Path | Status |
|---|---|---|
| Battle Engine (headless, seeded) | `src/battle/` | PASS (tests) |
| Dungeon Core | `src/dungeon/` | PASS (tests) |
| Run layer + meta progression | `src/run/` | PASS (tests) |
| Expanded content (48 characters, E1–E9) | `src/content/` | sim-tuned, NOT_VALIDATED by humans |
| Autopilot + simulation | `src/sim/`, `scripts/simulate.mjs` | evidence in `docs/reports/sim/` |
| Mobile web client | `web/` → `site/` | UI smoke PASS (headless Chromium) |

## Play / Develop

```bash
npm ci
npm test                 # strict TypeScript build + all headless tests
npm run build:web        # static client into site/
npm run serve            # http://localhost:8080 (local only)
npm run simulate -- 100 yellow-turban smart   # headless run statistics
```

진행 저장: 메타(해금/도감)와 진행 중인 원정(seed + 명령 로그)은 브라우저 localStorage에 저장됩니다.
조작: 방향 패드/숫자패드(1-9)·화살표 이동, `Enter` 자동 탐색, `.` 대기, `f` 주변 탐색, `>` 계단, 지도 탭 = 해당 지점까지 이동.
