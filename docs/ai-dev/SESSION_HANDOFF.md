# SESSION HANDOFF — 수묵 UI 운영 릴리스

## 현재 상태

- Repository: `nanpsw-eng/three-kingdoms-mystery-dungeon`.
- 2026-10-08 사용자 “배포까지 완료해”로 배포 보류 해제 및 main/production 릴리스 승인. 과거 hold를 복원하지 않는다.
- PR #22 → #21 → #20 순서로 병합하여 탐험·전투·효과 설명·필드 미니어처 전체를 한 번에 main 반영.
- 기능 릴리스 commit: `c8291c4fb72a1c48e7d415c41b0fac81f6484127`; tree `d232c31f43eb2856da8290ed38229efa6743a53d`는 최종 검증된 필드 branch tree와 동일.
- Vercel production `dpl_GKa3PWmWZwayk7W98KGDwifJFkNX` READY 및 운영 도메인 연결 확인.
- URL: https://three-kingdoms-mystery-dungeon.vercel.app/
- 실제 운영 브라우저: 이어하기, 수묵 미니어처 표시, 크게/넓게 보기, 가방의 “아군 1명 체력 40% 회복”·“군량 +30” 표시 확인. 이동/대기/아이템 사용 없이 읽기 및 화면 전환만 검증.
- 기존 stage1 운영 commit85790c5는 이 릴리스로 대체됨. 보고서 내 과거 NOT_DEPLOYED는 역사적 체크포인트.

## 변경 / 기준

- AI-OS exact v0.4.4 / `64b5115a698cc6a94cd8df80abb2ee7109010764`: AI_OS_BINDING.md 및 AGENTS.md 준수.
- DEC-025 승인 수묵 그래픽 노블 방향. 원본은 web/assets/reference/visual-bible-approved-source.png.
- 탐험 상태·지도·부대·조작 위계, 전투 큰 초상·행동 순서·4명령 및 기술/물품/전술 패널 개선. 진형 앞3+뒤2 유지.
- 기술/아이템 짧은 대상·효과·비용 설명 및 상점 설명 추가.
- 사용자 선택② 수묵 미니어처 28종과 아군/적/물품 표식, 바닥·벽 대비, 기본11×11/넓게15×15 지도 구현. 공용 병종 그림이며 개별 장수28명 초상이라는 의미가 아님.
- 도메인·세이브·밸런스 변경 없음.

## 검증 / 근거

- 기능 exact HEAD `0f0dc059d151e33376523fa0203592777d3c4130`: CI37701758466 및 visual-smoke37701758432 SUCCESS.
- 운영 기능 merge c8291c4: CI37712317053 및 deploy37712317080 SUCCESS; visual-smoke37712317034는 릴리스 후 실행됨(해당 run의 최신 상태를 참조).
- 로컬 도메인161, 탐험10, 전투7/실제 기술/5v5 adapter, 모바일·세이브·도감40·수묵 재료·콘텐츠 통합·필드28/fallback/카메라 PASS.
- 운영 터미널 Playwright는 네트워크 ERR_EMPTY_RESPONSE로 실행 불가. Cloud Browser 실제 서비스 UI 검증 완료. 실제 기기 장기5인 영입 플레이는 NOT_RUN.
- 보고서: docs/reports/INK_EXPLORATION_STAGE2_20261007.md, INK_BATTLE_STAGE3_20261007.md, INK_FIELD_MINIATURES_20261008.md.
- 필드 자산 계약: docs/art/FIELD_MINIATURE_DIRECTION_V1.md.

## 다음 작업

4단계 도감 열전/상세 개선. 이미 완료된 공통 UI·원본 통합·도감 겹침 수정·탐험·전투·필드 미니어처를 다시 작업하지 않는다.
