# SESSION HANDOFF — 수묵 UI 순차 개선

## 현재 상태

- Repository: `nanpsw-eng/three-kingdoms-mystery-dungeon`.
- 1단계 + 모바일 도감 수정은 사용자 승인 후 PR #19 병합 완료. main/운영 commit `85790c549319c774514f289e69cc8ab0f6f515fb`.
- Vercel production `dpl_GzXqwB6LQ8kueAZx1aDuPPg6rKEX` READY, 실제 서비스 도감 목록·상세 확인 완료.
- 기존 업로드 보류/auto-review blocker는 명시적 사용자 승인으로 해제되어 1단계 release를 마쳤다. 과거 hold를 복원하지 않는다.
- 사용자 ‘다음도 계속 진행해’에 따라 **2단계 탐험 화면** 구현/로컬 검증 완료. Branch `feature/ink-exploration-stage2`. 이번 2단계 main 병합/운영 배포는 아직 하지 않음.

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

2단계 PR의 exact HEAD 기준 CI를 확인하고, main 병합/production 승인 후 GitHub 연결 Vercel의 exact merge SHA READY와 실제 서비스를 확인한다. 이어 3단계 전투(전열3/후열2 유지), 4단계 도감 열전 개선. 이미 완료된 공통 UI/원본 자산 통합/도감 겹침을 다시 작업하지 않는다.
