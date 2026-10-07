# 수묵 UI 3단계 — 전투 화면

State: IMPLEMENTED / DEPLOYMENT_HELD_BY_USER.
Base: PR #20 `feature/ink-exploration-stage2`, exact HEAD `f96cf0e4aafd4795ca59db244ddb12c82d00e71e`.
Branch: `feature/ink-battle-stage3` (stacked PR; main 병합/production 배포 안 함).

## 결과

승인된 수묵 Visual Bible와 기존 인물 자산을 재사용했다. 전투 엔진·RNG·세이브·밸런스 변경 없음.

- 전투명/층/행동 수, 현재 장수/기력, 행동 순서를 분리했다.
- 전열 3자리 + 후열 2자리 계약을 유지하고 상반신 초상, 체력 숫자/막대, 기력, 상태를 표시한다. 좁은 화면은 체력 숫자에 카드 전체 너비를 배분한다.
- 공격·기술·물품·전술 4개 주 버튼을 크게 배치했다. 수동/스마트/전체공격/반복과 ×1/×2/×3을 유지했다.
- 기술 패널에 현재/필요 기력, 부족분, 대상과 효과를 표시한다. 물품에는 보유 수량과 대상/효과를 표시한다. 전술에 방어·진형·퇴각을 모았다.
- 대상 강조, 복수 대상 실행/취소, 선택 중 전장 스크롤 유지, 전투불능/방어 상태를 보존했다. 가로 화면은 적군과 아군을 좌우로 배치한다.

## 검증

- 도메인 `npm test`: 161/161 PASS. 웹 build, diff 검사 PASS.
- 전투 배치 검사: 320×568, 360×640, 390×660, 390×844, 412×740, 768×1024, 844×390. 화면 넘침/체력·기력 잘림 없음, 주요 조작 최소 44px.
- 실제 플레이 UI에서 공격, 방어로 기력 획득 후 기술 선택/사용 PASS. 기술/물품 읽기와 진형 선택 취소는 저장된 행동 기록을 변경하지 않음.
- 별도 페이지에 실제 BattleEngine의 대표 5v5 snapshot과 운영 presentation adapter를 결합해 3개 화면 배치 PASS. 실제 5인 영입 플레이 완료를 주장하지 않음.
- 모바일 게임/세이브, 탐험 배치, 도감 40개 조합, 공통 수묵 대비/이미지 fallback 회귀 검사 PASS.
- 실물 Android/iOS 검증: NOT_RUN. 운영 배포: NOT_DEPLOYED (사용자 선택 ②에 따른 보류).
- 원격 PR CI 결과는 해당 PR checks를 참조한다.

## 화면 증거

- [전투 390×660](evidence/ink-battle-stage3-20261007-battle-390x660.jpg)
- [기술 패널](evidence/ink-battle-stage3-20261007-battle-skills.jpg)
- [5v5 adapter 배치](evidence/ink-battle-stage3-20261007-battle-5v5-adapter.jpg)
- [자동 검사 결과](evidence/ink-battle-stage3-20261007-battle-layout-result.json)

## 다음

배포 보류를 유지한다. 다음 순차 개선은 4단계 도감 열전/상세 화면이다. 사용자 승인 전 PR #20 및 전투 PR을 main에 병합하지 않는다.
