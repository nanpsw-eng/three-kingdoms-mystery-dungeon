# 필드 수묵 미니어처 적용

State: IMPLEMENTED / LOCAL_CHECKS_PASS / USER_DEPLOYMENT_HOLD.
사용자 선택: ② 수묵 미니어처 (2026-10-08 KST).
Base: PR #21 exact HEAD `d70815aad1a4e8a88a79948d043a00a177875a5d`.
Branch: `feature/ink-field-miniatures`, PR #21 위 stacked change.

## 결과

- 신규 투명 미니어처 28종을 필드 전용으로 연결했다. 군주3, 영입무장, 황건/일반/남방 병사와 적 역할, 음식/약/장비, 문/계단/함정을 포함한다. 일반 적·영입은 역할별 공유 자산이며 모든 역사 인물의 독자적인 전신 그림을 새로 만들었다고 주장하지 않는다.
- source alpha 경계에 맞춰 각 그림을 한 칸 안에 배치한다. 종이 사각 배경과 서로 다른 옛 토큰이 섞이는 것을 줄이고, 바닥 질감은 옅게·벽은 먹톤으로 정리했다.
- 아군 청록 원형/깃발, 적 주홍 원형/삼각 깃발, 보스 이중 깃발, 물품 황토 원형/마름모. 요술진은 별도 주홍 원형 인장으로 구분한다.
- 기본 11×11 확대, 15×15 넓게 보기 전환. 지도 중심/터치 좌표를 배율에 맞춰 계산하며 턴·저장 기록을 소비하지 않는다. 기존 방향/자동 탐색/조사/계단 명령을 유지한다.
- 두 PNG 시트는 lossless WebP로 전달한다. alpha 전체와 alpha>0 영역의 RGBA가 원본과 동일함을 확인했다. 필드 자산 총 약2.86MB, 최초 atlas 로딩 시 source rectangle을 계산하고 이후 동일 이미지 객체를 재사용한다. 실제 모바일 성능 측정은 NOT_RUN.
- Domain/Seeded RNG/밸런스/세이브 계약 변경 없음. 초상/전투/도감 원본 자산은 유지한다.

## 검증

- 웹 build, diff 검사 PASS.
- `field-miniature-smoke`: 28종 source, canonical 아이템/장비 및 적 전체의 표시 연결, 투명 alpha, deterministic draw, 확대/넓게 보기 미소비, 중앙 및 비중앙 터치 좌표, 3개 viewport의 44px 배율 버튼, 누락 이미지 fallback 실제 플레이 PASS.
- `exploration-layout-smoke`: 탐험 7개 화면 + 3개 5인 배치 stress fixture, 기존 이동/턴/저장복원 PASS.
- `mobile-ux-smoke`: 모바일 조작/세이브/전투/자동 정지·재개 PASS. `battle-layout-smoke`: 실제 공격/방어/기술 사용과 7개 전투 화면 PASS.
- `surface-fidelity-smoke`: 원본 석재 호출·명암 구분·deterministic draw·재료 fallback PASS.
- `concept-integration-smoke`: 유지된 story/도감 원본과 신규 필드 miniature/요술진 인장, reduced motion PASS. 필드 자산 검증은 새 승인 방향에 맞춰 source 호출 검사를 변경했다.
- 최신 로컬 검사는 Chromium 자동화. 실물 Android/iOS 및 모든 전역 장기 플레이: NOT_RUN. 원격 최초 HEAD `18635aae0c8501294fda7ade625148bc79b97f0d`의 기본 CI PASS, 화면 회귀 중 마지막 필드 검사에서 첫 requestAnimationFrame 이전의 dataset 읽기 race가 발견됐다. 초기 배율을 canvas 생성 시점에 지정하고 검사에서 정사각 지도 렌더 완료를 기다리도록 수정했다. 최신 원격 CI는 PR checks를 참조한다. production: NOT_DEPLOYED.

## 실제 렌더링 증거

- [실제 새 원정 시작](evidence/ink-field-miniatures-20261008-field-real-start.jpg)
- [운영 renderer 배치 fixture](evidence/ink-field-miniatures-20261008-field-renderer-fixture.jpg): 대표 인물/적/물품을 같은 지도에 모아 확인한 렌더링 검사이며 실제 획득·조우 플레이 기록이 아니다.
- [검사 결과](evidence/ink-field-miniatures-20261008-result.json)
- 자산 계약/제작 기준: `docs/art/FIELD_MINIATURE_DIRECTION_V1.md`.

## 다음

사용자의 배포 보류 유지. 이 branch 및 PR #20/#21을 승인 없이 main에 병합하지 않는다. 다음 순차 개선은 도감 열전·상세 화면이다.
