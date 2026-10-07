# 수묵 UI 개선 — 1단계 공통 표현

## 결과

IMPLEMENTED_LOCAL / WEB_BUILD_PASS / CODEX_40_PASS / MATERIAL_CONTRAST_FALLBACK_PASS / MOBILE_REGRESSION_PASS / NOT_UPLOADED / NOT_DEPLOYED.

코드 커밋: `de5328904741fa160dade52b5917392d65a89eab`. 브랜치: `fix/codex-mobile-layout`. 배포 기준 main `5cab8db`는 변경하지 않았다.

사용자는 기존 승인 시안의 재현이 부족함을 지적하고, 공통 수묵 UI → 탐험 → 전투 → 도감 순서의 개선을 지시했다. 앞선 GitHub 반영·배포 보류는 유지한다. 이번 결과는 1단계이며 전체 화면 재설계 완료가 아니다.

## 변경

- 사용자 제공 승인 Visual Bible 원본(1229×1536)을 수정 없이 `web/assets/reference/visual-bible-approved-source.png`에 보존했다. 기존 저장소 보드는 200×250 축소본이었다.
- manifest의 명시적 원본 좌표로 한지, 먹, 주홍, 산수 질감만 브라우저 Canvas에서 렌더링한다. 원본 문구를 UI 텍스트로 사용하지 않는다. 새 인물/세계관 시안을 생성하지 않았다.
- `web/src/ink-theme.ts`가 기존 자산 로드 뒤 CSS 변수로 원본 질감을 연결한다. 로드 실패 시 기존 CSS 색상으로 표시한다.
- 네이티브 SVG 붓 표제 마스크·거친 프레임과 기존 실제 텍스트를 조합했다. 장식은 pointer-events:none이다.
- 주요 탐험/전투 조작은 먹색, 주요 실행은 주홍색 바탕. 선택/키보드 포커스와 터치 영역을 유지했다.
- 도감 반복 사각 카드를 먹선 구분과 여백으로 완화했다. 기존 intrinsic height/스크롤 복원/locked 비활성 동작을 유지했다. 지원이 불확실한 자물쇠 이모지 대신 '미해금'을 명시했다.
- 보조 글자 색과 주홍 재료의 밝은 픽셀을 조정해 대비를 확보했다.

## 검증

- 웹 TypeScript 빌드 및 diff 검사 PASS.
- 도감 전 탭·6 화면 크기·확대 글자·상세·스크롤 검사 40건 PASS.
- 승인 원본 재료 실제 로드/적용, 표제·한지 위 설명·먹 버튼·주홍 버튼의 원본 질감 픽셀별 최악 대비: 각각 5.03 / 5.31 / 5.03 / 5.66:1 (기준 4.5:1) PASS.
- 재료 로드 차단 시 색상 fallback 및 장수 상세 조작 PASS.
- 기존 모바일 플레이 검사(이동/전투/도움말 중 자동전투 중지/저장복원) PASS.
- 기존 원본 그래픽 통합 검사 PASS. 마지막 색상 대비 조정 뒤에는 재료/도감/모바일 관련 검사를 재실행했다.
- 게임 도메인/세이브 계약은 변경하지 않았다. 기존 도메인 161 PASS는 이전 도감 수정 커밋의 검증 이력이며 이번 CSS 변경 뒤 전체 도메인 suite를 중복 실행하지 않았다.
- 로컬 Chromium 141 headless 검증. 실물 Android/iOS 및 원격 CI는 NOT_RUN.

## 실제 화면

- [도감](evidence/ink-ui-stage1-20261007-ink-ui-codex.png)
- [탐험](evidence/ink-ui-stage1-20261007-ink-ui-dungeon.png)
- [도움말](evidence/ink-ui-stage1-20261007-ink-ui-help.png)

## 다음 단계

2. 탐험: 지도 비중과 상단 상태·부대 요약·하단 조작을 재정리한다. 현재 지도 렌더링과 8방향 이동·대기·주변탐색·조사·계단 기능은 유지하고 각 기능의 접근성을 확인한다.
3. 전투: 전열 3/후열 2 진형을 유지하면서 큰 상반신 초상, 행동 순서, 핵심 명령과 기술/물품 선택 패널을 설계한다.
4. 도감/보조 패널: 인물 열전의 삽화·능력·스킬·정사 해설 위계를 완성한다. 기존 40개 겹침 검사를 유지한다.

외부 반영은 현재 보류다. 자동 승인 검토의 이전 GitHub 업로드 거부를 우회하지 않는다. 사용자 재승인 전에는 push/PR/merge/deploy하지 않는다.
