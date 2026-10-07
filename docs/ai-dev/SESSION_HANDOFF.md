# 배포 요청 체크포인트 — 2026-10-07

사용자가 "베포해봐"라고 배포를 지시했다. 현재 도감 수정 + 공통 수묵 UI 1단계 source HEAD는 0188676이다. Vercel production dpl_97NUDujcCEn4vupam3CAQ86sgsqf READY는 아직 main 5cab8db를 제공한다.

Git push fix/codex-mobile-layout은 자동 승인 검토에서 다시 차단됐다: deployment authorization alone does not specifically authorize the GitHub destination and uploaded payload. 우회하거나 다른 tool로 동일 업로드하지 않는다. 정확한 저장소 nanpsw-eng/three-kingdoms-mystery-dungeon, 브랜치 fix/codex-mobile-layout, payload 도감 레이아웃·공통 수묵 UI·승인 원본 이미지·검증 스크립트·화면 증거에 대해 명시적 승인을 요청한다. 승인 후 push → PR → CI → main merge → exact Vercel SHA 확인 및 live verification 순서로 진행한다. 현재 PR/병합/신규 배포는 하지 않았다.

아래 사용자 보류 상태는 최신 배포 요청으로 해제됐지만, 별도 GitHub 업로드 auto-review blocker는 남아 있다.

---

# SESSION HANDOFF — 수묵 UI 순차 개선, 1단계

State: `STAGE1_IMPLEMENTED_LOCAL / WEB_BUILD_PASS / CODEX_LAYOUT_40_PASS / CONTRAST_FALLBACK_PASS / MOBILE_REGRESSION_PASS / USER_HOLD_UPLOAD_DEPLOY`.

## 현재 기준

- Repository: nanpsw-eng/three-kingdoms-mystery-dungeon.
- Local branch: fix/codex-mobile-layout. Runtime stage1 commit: de5328904741fa160dade52b5917392d65a89eab.
- Released base: main 5cab8db. 이번 세션의 변경은 업로드/PR/병합/배포하지 않았다.
- Exact AI-OS: docs/ai-dev/AI_OS_BINDING.md, v0.4.4 / 64b5115a698cc6a94cd8df80abb2ee7109010764.
- 최신 승인 시각 기준: DEC-025 + 사용자 재제공 원본 17474.png / 17475.jpg. 앞서 생성한 세 화면 비교 그림은 검토용이며 실제 적용 화면이나 진형 계약이 아니다.

## 사용자 지시 / 권한

- 도감 전체 깨짐 수정 → 반영·배포 선택지 ② 보류 → 기존 수묵화 시안 재현 부족 지적 → 탐험·전투·도감 재검토 → 순차 개선 지시.
- 로컬 개선·검증은 진행한다. 보류를 업로드/배포 승인으로 해석하지 않는다.
- 이전 Git push는 자동 승인 검토가 destination authorization으로 두 차례 거부했다. 사용자 보류 이후 재시도하지 않았다. 외부 업로드는 재승인 후만 가능하다.

## 완료 / 반복 금지

- 원본 석재·캐릭터·아이템·스토리 자산 통합: 기존 main에 포함. 엔진/스토리/자산을 재생성하지 않는다.
- 도감 압축 grid를 nonshrinking flex 스크롤로 수정. 펼치기 scroll/focus 복원. 모든 탭 40개 레이아웃 검사 PASS.
- 1단계 공통 UI: 승인 원본의 한지/먹/주홍/산수 재료, 붓 표제, 프레임, 버튼, 도감 구획 개선. 원본 source PNG는 web/assets/reference에 수정 없이 보존.
- 웹 build PASS; 재료 실제 연결·최악 글자 대비 5:1 이상·재료 fallback PASS; 모바일 플레이/저장복원 PASS. 엔진161 PASS는 앞선 도감 수정 때의 이력.
- 원격 CI, 실물 Android/iOS, 이후 2~4단계 화면 개선: NOT_RUN / NOT_IMPLEMENTED.

## 다음 안전 작업

2단계 탐험 화면을 로컬에서 개선한다. 지도 비중, 상태/부대 요약, 하단 조작을 정리하되 8방향/대기/주변탐색/조사/계단 접근성을 유지한다. 이어 3단계 전투(전열3·후열2 유지, 상반신 초상과 기술/물품 패널), 4단계 도감 열전을 진행한다. 실제 렌더와 승인 시안을 비교하며 가독성·터치·세이브를 검증한다. 업로드/배포는 계속 보류.

## 최소 문서 색인

- docs/reports/INK_UI_STAGE1_20261007.md: 최신 변경·검증·다음 단계.
- docs/reports/evidence/ink-ui-stage1-20261007-*: 실제 화면/JSON.
- docs/reports/CODEX_LAYOUT_REPAIR_20261007.md: 겹침 원인·이전 검사.
- docs/reports/CONCEPT_INTEGRATION_20261007.md: 기존 원본 그래픽 통합.
- docs/art/VISUAL_BIBLE_V1.md / docs/decisions/DEC-025-ART_DIRECTION.md: 화풍 계약.
- docs/operations/VERCEL_DEPLOYMENT.md: 기존 Vercel 연결; 재생성 금지.
