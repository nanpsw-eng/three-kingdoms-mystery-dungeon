# SESSION HANDOFF — 수묵 UI 순차 개선

## 현재 상태

- Repository: `nanpsw-eng/three-kingdoms-mystery-dungeon`.
- 1단계 + 모바일 도감 수정은 사용자 승인 후 PR #19 병합 완료. main/운영 commit `85790c549319c774514f289e69cc8ab0f6f515fb`.
- Vercel production `dpl_GzXqwB6LQ8kueAZx1aDuPPg6rKEX` READY, 실제 서비스 도감 목록·상세 확인 완료.
- 기존 업로드 보류/auto-review blocker는 명시적 사용자 승인으로 해제되어 1단계 release를 마쳤다. 과거 hold를 복원하지 않는다.
- 사용자 ‘다음도 계속 진행해’에 따라 **2단계 탐험 화면** 구현/로컬 검증 완료. Branch `feature/ink-exploration-stage2`. PR #20 exact HEAD `f96cf0e4aafd4795ca59db244ddb12c82d00e71e`, CI/visual-smoke PASS. 운영 배포는 사용자 선택 ②로 보류.

- 사용자 선택 ②: 배포를 보류하고 **3단계 전투**를 계속 구현. `feature/ink-battle-stage3`는 PR #20 위 stacked branch. 큰 초상/행동 순서/4개 명령/기술·물품·전술 패널 및 3+2 진형 유지.

## 최소 기준 / 변경 범위

- AI-OS exact v0.4.4 / `64b5115a698cc6a94cd8df80abb2ee7109010764`: `AI_OS_BINDING.md`. `AGENTS.md` human gate를 따름.
- 승인 방향 DEC-025 + `docs/art/VISUAL_BIBLE_V1.md`. 사용자 원본 `17474.png`가 `web/assets/reference/visual-bible-approved-source.png`에 보존됨. 기존 인물·맵 자산을 재생성하지 않음.
- 2단계: 전역명/층수 인장, 상태 위계, 지도 공간, 확대 부대 초상, 4개 주 조작 + 하단 5개 메뉴, 지도 안내 패널, 가로 좌우 배치. 도메인/세이브/밸런스 변경 없음.

## 검증 / 반복 금지

- Stage2 웹 build/diff PASS, 도메인161 PASS, 탐험7개 화면+3개 5인 DOM fixture PASS, 모바일 게임/세이브 회귀 PASS, 도감40 PASS, 공통 수묵 재료/대비/fallback PASS.
- 실제 5인 영입 장기 플레이/실물 모바일: NOT_RUN. 2단계 운영: NOT_DEPLOYED.
- 상세 내용/증거: `docs/reports/INK_EXPLORATION_STAGE2_20261007.md` 및 `docs/reports/evidence/ink-exploration-stage2-20261007-*`.
- 이전 결과: `docs/reports/INK_UI_STAGE1_20261007.md`, `CODEX_LAYOUT_REPAIR_20261007.md`, `CONCEPT_INTEGRATION_20261007.md`. 과거 stage1 보고서 내 NOT_DEPLOYED는 역사적 로컬 체크포인트이며 최신 운영 상태는 위 commit/PR임.

## 다음 작업

3단계 전투 build/도메인161/전투7개 화면/실제 기술 사용/5v5 adapter/모바일 회귀 PASS. 상세 보고서 `docs/reports/INK_BATTLE_STAGE3_20261007.md`. 전투 PR #21 최초 HEAD `9044b577a6c95f8831515b34129e2f385ce35fb6` CI/visual-smoke PASS. 2026-10-08 KST 사용자 요청으로 기술/아이템 효과 요약과 상점 표시를 추가했다. 효과 요약 HEAD `d70815aad1a4e8a88a79948d043a00a177875a5d`는 PR #21. 최신 PR checks를 참조한다. 사용자 ② 수묵 미니어처 선택으로 `feature/ink-field-miniatures`에서 필드 28종/확대·넓게 보기/바닥·벽·표식 개선 완료. 보고서 `docs/reports/INK_FIELD_MINIATURES_20261008.md`, 자산 계약 `docs/art/FIELD_MINIATURE_DIRECTION_V1.md`. 필드 source/전체 콘텐츠 연결/투명/fallback/카메라와 탐험·모바일·전투·원본 재료/통합 회귀 PASS. PR #21 위 stacked branch의 최신 checks 확인. 다음은 4단계 도감 열전/상세 개선. 사용자가 배포 보류를 해제하기 전 PR #20 및 전투 PR을 main에 병합하거나 운영 배포하지 않는다. 이미 완료된 공통 UI/원본 자산 통합/도감 겹침을 다시 작업하지 않는다.
