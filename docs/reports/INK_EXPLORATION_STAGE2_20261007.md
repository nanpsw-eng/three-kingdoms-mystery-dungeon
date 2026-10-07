# 수묵 UI 2단계 — 탐험 화면

State: IMPLEMENTED / LOCAL_CHECKS_PASS / HUMAN_MERGE_DEPLOY_PENDING.
Base: released main `85790c549319c774514f289e69cc8ab0f6f515fb` (PR #19, Vercel production READY).
Branch: `feature/ink-exploration-stage2`.

## 결과

승인된 수묵 Visual Bible와 기존 지도/캐릭터 자산을 재사용해 탐험 화면의 정보 위계와 모바일 배치를 개선했다. 전투 재설계와 도감 열전 재설계는 다음 단계다.

- 상단: 전역명, 층수 인장, 군량·금·위험도, 레벨·턴을 구분. 층별 특수 조건은 줄바꿈해 표시.
- 중앙: 정사각 지도에 남는 화면 높이를 배분. 원본 석재와 먹안개, 인물 표식은 기존 렌더러를 유지.
- 아군: 작은 24px 초상 대신 30~38px 초상과 이름·체력을 함께 표시. 짧은 화면에서도 초상을 숨기지 않음.
- 조작: 8방향 이동과 ‘대기’를 유지. 자동 탐색·주변 탐색·조사·계단 4개 명령을 크게 배치. 가방·부대·상태·기록·도움말은 하단 5개 메뉴.
- 지도 안내: 지형, 인물, 계단, 물품, 함정과 조작 설명을 실제 텍스트로 제공. 읽기는 턴을 소모하지 않음.
- 가로 화면: 지도와 부대·조작을 좌우로 배치해 이전 540px 최소 높이로 인한 화면 밖 조작을 해소.

게임 도메인·RNG·저장 계약·밸런스는 변경하지 않았다. 새 이미지 생성이나 자산 재제작은 없었다.

## 검증

- `npm test`: 161/161 PASS.
- `npm run build:web`, `git diff --check`: PASS.
- `scripts/exploration-layout-smoke.mjs`: PASS. 320×568, 360×640, 390×660, 390×844, 412×740, 768×1024, 844×390에서 화면 넘침 없음, 지도 정사각, 모든 조작 최소 44px, 초상 표시와 글자 잘림 검사.
- 지도 안내·가방·부대·상태·기록·도움말이 턴을 소모하지 않음, 대기·주변 탐색 각 1턴, 계단 비활성 상태와 8방향 버튼, 실제 저장/이어하기 복원 PASS.
- 5인 카드와 긴 특수 조건은 3개 화면에서 **DOM 배치 스트레스 fixture**로만 확인. 실제 5인 영입 플레이 완료를 주장하지 않음.
- 기존 `mobile-ux-smoke`: PASS (터치 대기, 전투 진입/조작, 자동전투 안내 중 정지/재개, 저장복원).
- 기존 `codex-layout-smoke`: 40 PASS. 기존 `ink-ui-smoke`: 원본 재료/대비/fallback PASS.
- 로컬 Chromium 자동 검증. 실물 Android/iOS 확인: NOT_RUN. 이번 2단계 production: NOT_DEPLOYED.

## 실제 렌더링 증거

- [세로 390×660](evidence/ink-exploration-stage2-20261007-exploration-390x660.jpg)
- [가로 844×390](evidence/ink-exploration-stage2-20261007-exploration-844x390.jpg)
- [배치와 동작 검사 결과](evidence/ink-exploration-stage2-20261007-exploration-layout-result.json)

## 다음

원격 PR CI 확인 후 사용자 main 병합·운영 배포 승인에 따라 진행한다. 3단계 전투에서는 전열 3/후열 2 진형 계약을 유지하고 초상·행동 순서·명령·기술 및 물품 패널을 개선한다.
