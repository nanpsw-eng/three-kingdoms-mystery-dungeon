# 현대 2D RPG 개편 v1

Status: IMPLEMENTED / Domain165 및 전체 원격 브라우저 검증 PASS. 사용자 선택 현대 RPG 및 실제 구현 승인, 2026-10-09 방 축소 검토 이후 ‘계속 개선해’ 지시를 이번 compact-v2 구현의 승인으로 기록한다. 2026-10-10 사용자 ① 승인으로 main merge와 운영 배포 완료.

| 요구 | 구현 | 직접 검증 |
|---|---|---|
| 현대적이고 통일된 그림체 | web/assets/modern 3개 atlas, field-art.ts, map.ts, main.ts, style.css | modern-rpg-smoke 자산/실제 화면, field-miniature-smoke |
| 작은 일반 방 | FloorSpec.layoutVersion / RunOptions.dungeonLayout / balance compact 6×6 상한 | layout-version.test 모든 123개 층 계획, 결정론·보스 |
| 기존 저장 유지 | 누락 버전은 legacy-v1, 신규 웹 원정만 compact-v2, 모든 후속 층에 전달 | 변경 전 지도 12개 SHA256, 기존/신규 명령 재생·다음 층 stateHash |
| 읽기 쉬운 지도 | 기본 9×9, 넓게15×15, 작은 방은 벽 둘레까지 프레이밍 | 화면 크기7종, mapOrigin/tileAt 좌표 일치, 실제 카메라 무료 전환 |
| 8방향 한 칸 입력 | thumb-pad.ts: 놓을 때만 실행, 중앙·바깥·pointercancel·resize·blur 취소, 별도 대기 | modern-rpg-smoke 8방향/1회/취소/키보드/추가 포인터 |
| 간결한 전투·효과 | 전신 진형 앞3/뒤2 유지, 대상 먼저→공격 가능, 기술 비용/효과 선택 띠 | battle-layout-smoke 실제 공격·기술·취소 및 5v5 adapter |
| 가방·도감·첫 화면 | 현대 CSS와 같은 atlas의 얼굴/아이템, 안전한 새 원정·이어하기 분리 유지 | approved-ux, codex-layout, mobile-ux, e2e |

## 그래픽 범위

16개 전신 그림(개별 주요 인물7 + 공용 병종/역할9), 물품/환경16, 지형4. 지도·전투·얼굴 모두 같은 전신 source를 사용한다. 캐릭터48명이 각각 고유 새 일러스트를 가진다는 뜻이 아니다. 이름, 진형, 능력치, 효과, 해금은 ContentPack을 그대로 사용한다. 기존 이야기 삽화와 실패 시 legacy 자산은 보존한다.

색은 navy/slate 배경, 흰 글자, gold 비용, jade 행동자/아군, ruby 적/선택 대상. 키보드 초점은 금색 테두리. 상태는 색 외에 이름·수치·대상/행동 중 표기로 구분한다. 텍스트가 많은 가방·도감·시트는 내용 크기를 유지하고 내부 목록을 스크롤한다. 전투 무대는 작은 화면에서 내부 스크롤하며 명령부는 화면 안에 남긴다.

## 맵 Delta

일반 방 4~6×4~6, 기존 층 48×34 및 방5~9개/padding2 유지. 보스방도 이번 버전은 같은 상한을 사용한다. 큰 보스방의 특별 예외나 전체 층40×28은 후속 실제 플레이 비교 후보다. 방 축소가 통로를 줄인다고 주장하지 않는다. 밸런스 수치·전투 규칙·전투 RNG는 변경하지 않는다. 지형 변화로 던전 적 배치와 이동/조우 양상은 달라지므로 실제 난이도 유지 보증은 없다.

## 저장 계약과 복구

기존 save v1 envelope/key는 유지하고 options.dungeonLayout만 선택 필드로 추가한다. 값이 없으면 legacy-v1이며 명령 재생 시 compact를 주입하지 않는다. 신규 웹 원정은 compact-v2를 저장한다. 알 수 없는 생성 버전은 domain에서 명시적으로 거절한다. 저장 전체를 일괄 변환하지 않는다.

주의: 구형 운영 client는 compact-v2 옵션을 이해하지 못한다. compact 원정 생성 후 과거 릴리스88becf5로 통째로 되돌리면 새 원정을 올바르게 재생할 수 없다. 복구는 생성 버전 호환 코드를 보존한 채 시각/조작 변경을 되돌리는 수정 릴리스로 수행한다. main 배포 전 이 제한을 사용자에게 설명한다. 기존 기록은 legacy 경로로 되돌릴 수 있고 compact 기록은 옵션+명령이 보존되어 호환 client에서 다시 재생할 수 있다. 세이브 초기화를 복구 수단으로 사용하지 않는다.

## 검증 상태

로컬 Domain165 PASS / build:web PASS / diff-check PASS. 로컬 Chromium 제공 불가, 네트워크 다운로드도 정상 ZIP을 반환하지 않음. managed preview에 필요한 control-browser 스킬이 없으므로 별도 서버·브라우저 우회 경로를 만들지 않는다. 원격 GitHub Actions에서 실제 브라우저 검증과 스크린샷을 수집한다. 새 화면에 맞지 않는 ink-ui/surface-fidelity/concept-integration 검사 대신 modern-rpg-smoke가 새 자산/명령/대비/실패 fallback/모션을 검사하며 기존 게임 흐름·모바일·도감·48인/적 coverage 검사는 유지한다.

원격 검증 코드 SHA: `f0a5a63a44f451ac15cd1a98d0817178a83c50ff`. 상세 결과·실제 화면·제한: [완료 보고서](../reports/MODERN_RPG_V1_20261009.md). 실물 터치/스크린리더/장기 플레이 감각은 NOT_RUN.
