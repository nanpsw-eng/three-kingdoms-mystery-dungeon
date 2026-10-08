# SESSION HANDOFF — 승인 수묵 UX v2

## 현재 기준

- Repo nanpsw-eng/three-kingdoms-mystery-dungeon. AI-OS exactv0.4.4 /64b5115a698cc6a94cd8df80abb2ee7109010764. AGENTS.md 및 DEC-025.
- 운영 main5635e5b1631fb0b73424452baa2391b4a9d611fc /Vercel dpl_8htVYmMmdb85AaRDq5TpJJMs3Gx3 READY. 이전 탐험·전투·효과요약·필드28 전체 릴리스 완료. 반복 구현 금지.
- 2026-10-08 사용자 적대적 UX검토→핵심3화면 시안→① 구현 진행 승인. Branch feature/ink-ux-approved-v2는 운영 위의 delta.
- 이번 변경 main NOT_MERGED /production NOT_DEPLOYED. 과거 배포 승인은 완료된 이전 릴리스 대상이며 이번 사용자 선택은 구현 승인이다.

## 구현 / 원장

- 명세 docs/art/UX_APPROVED_V2_SPEC.md; 보고서 docs/reports/INK_UX_V2_20261008.md; evidence docs/reports/evidence/ink-ux-v2-20261008/.
- 탐험 명령·조건·목표·한지버튼·더보기, 전투 대상→실행/무료취소·청록행동자·자동설정, 이어하기/새편성 분리·세이브 대체 확인 구현.
- ContentPack 실제 depth 해금 목표만 표시. 생성 시안의 상자/카드 보상은 제외. 도메인/밸런스/RNG/save v1/앞3뒤2는 그대로.
- 로컬 Domain161/build, 탐험10, 전투7+확인3/실제기술/5v5, 신규UX, 모바일/대비/field28/e2e/도감40/전체48장수·89종적·16화면/원본재료·시안연결 PASS. 원격 checks는 branch의 exact HEAD를 확인.
- 대량 자산 병렬 decode의 간헐 EncodingError는 테스트 동시해독4개로 제한해 모든 자산을 검사한다. 원본 자산을 삭제/재생성하지 않았다.
- 실물 모바일/스크린리더/오조작률/장기5인 영입은 NOT_RUN. UI 기능/레이아웃 검증을 디자인 완성도 보증으로 표현하지 않는다.

## 다음

PR 검토 후 main 병합/운영 배포 사용자 승인. 해당 승인 전 구현을 반복하거나 main에 임의 반영하지 않는다. 이번 승인3화면과 별개로 다음 콘텐츠 작업은 도감 열전/상세이다.
