# Game Design PRD — Three Kingdoms Mystery Dungeon

## 0. Document Control
- PRD ID: `PRD-GAME-001`
- Version: `0.1.0`
- PRD Lifecycle State: `APPROVED_BASELINE`
- Owner: Product Owner
- AI-OS Binding: `v0.4.4@64b5115a698cc6a94cd8df80abb2ee7109010764`
- Product Source of Truth: this document
- Last Updated: `2026-10-05`
- Change Summary: Consolidated all approved conversation decisions into initial repository baseline.

## 1. Executive Summary

모바일 웹/PWA에서 20~30분 단위로 반복 플레이할 수 있는 **삼국지 × Mystery Dungeon × Party Roguelite** 게임을 개발한다.

플레이어는 군주 1명을 대표 캐릭터로 조작하여 절차 생성 던전을 탐험한다. 필드에는 군주만 보이지만 실제 부대는 최대 5인의 장수 파티로 구성되며, 적 부대와 접촉하면 현재 던전 공간을 확대해 5 vs 5 턴제 전투를 진행한다.

핵심 재미는 영구 스탯 누적이 아니라 **던전 판단, 파티 편성, 장수 영입, 특성 빌드, 장비, 기습, 자원 운용**에서 나온다.

## 2. Problem / Design Opportunity

### 2.1 Current State
삼국지 게임은 장수 수집·전략·전투에 강점이 있지만, 모바일에서 짧고 반복 가능한 던전 탐험과 매 Run 다른 빌드를 결합한 형태는 본 프로젝트의 핵심 차별점이다.

### 2.2 Intended Experience
- 풍래의 시렌 계열의 `1행동=1턴`, 방/복도 탐색, 함정, 군량, 미식별 아이템, 위험-보상 판단
- 삼국지의 군주·장수·병과·인연·등용·화공·기습
- 빠른 Smart Auto와 수동 개입이 공존하는 파티 전투

## 3. Product Goal

### 3.1 Goals
- 같은 전역을 반복해도 맵, 영입 장수, 특성, 장비, 이벤트와 전투 상황이 달라지는 Run 다양성 확보
- 20~30분 내 완결되는 모바일 우선 Run
- 빠른 자동전투를 제공하되 파티 편성/빌드/전술 판단이 승패를 결정
- 영구 능력치 인플레이션 없이 횡적 해금으로 장기 동기 제공

### 3.2 Non-Goals
MVP에서는 다음을 제외한다.
- PvP / 길드
- 가챠 / SSR / 별등급
- 장수 영구 능력치 강화
- 영구 장비 보존
- 자유이동 SRPG
- 대규모 월드맵
- 전통 원소 가위바위보
- 30명 이상의 초기 캐릭터
- 관도/적벽 완성 전역

### 3.3 Success Definition
MVP 핵심 질문:

> 동일한 `황건적의 난`을 5회 플레이했을 때, 맵·영입·빌드·아이템·전투 상황의 차이 때문에 다시 플레이하고 싶은가?

초기 Validation 전까지 정량 임계값은 `UNKNOWN`이며 플레이테스트 후 결정한다.

## 4. Primary Workflow

```text
군주 선택
→ 자유 장수 2명 편성
→ 3인으로 1F 진입
→ 군주 1명으로 격자 탐색
→ 적/함정/아이템/이벤트/장수 조우
→ 적 접촉 시 현재 공간 확대
→ 최대 5 vs 5 턴제 전투
→ EXP/금/아이템/특성/장비 획득
→ 장수 최대 2명 추가 영입
→ 5F/10F 중간보스 및 정비
→ 15F 최종보스
→ 클리어 또는 전멸
→ Run 자원 초기화
→ 횡적 콘텐츠 해금
→ 다음 Run
```

## 5. Approved Product Baseline

### 5.1 Party
- 시작: **군주 1 + 자유 장수 2**
- 던전 영입: 최대 2명 추가
- 최대 파티: 5명
- 병과 편성 제한 없음
- 세력 혼합 가능, 불이익 없음
- 인연은 소규모 보너스 및 일부 고유 연계효과만 제공

### 5.2 Exploration Representation
- 던전 필드에는 대표 군주 1명만 표시
- 군주 KO 시 생존 장수 중 임시 대표 토큰 표시 가능
- 적 필드 토큰 1개는 적 부대 1개를 의미

### 5.3 Dungeon
- 방+복도 기반 Procedural Generation
- 층당 5~9개 방
- 12~15층 표준 Run, MVP 황건전 15층
- 지나간 영역만 지도 기록
- 방에서는 전체 시야, 복도에서는 제한 시야
- 플레이어 1행동 = 던전 1턴
- 방향 전환만 0턴
- 계단 사용 후 이전 층 복귀 불가
- Auto Explore 지원, 위험/발견 시 자동 중단

### 5.4 Detection / Surprise
- 같은 방 진입 시 상호 발견
- 복도는 거리+방향 기반 탐지
- 미발견 적 후방 접촉 → 아군 기습
- 아군 후방 접촉당함 → 적 기습

### 5.5 Resources
- 군량 100 기본
- 자연 회복은 탐험 턴을 소비하며 군량과 시간 압박을 발생
- 층 장기 체류 시 증원 발생 가능
- 위험도 UI는 `안정/경계/위험` 단계로만 표시

### 5.6 Traps / Secret / Environment
- 함정은 기본 숨김, 탐색/장수/아이템으로 탐지 가능
- 적에게도 함정 적용 가능
- 비밀방/숨은 통로는 낮은 확률로 존재
- 일부 층에 안개/강풍/우천/야간 등 Floor Modifier 적용
- 전역마다 대표 고유 기믹 1~2개

### 5.7 Battle
- 현재 던전 공간을 확대하여 전투 전개
- 최대 5 vs 5
- 전열/후열 + 좌/중/우
- 전투 중 1행동으로 위치 변경 가능
- 근접은 전열 우선, 궁병/책략/돌파는 후열 공격 가능
- SPD 기반 개별 Timeline
- 기력 최대 100, 궁극기 100 소비
- 장수당 액티브 2~3개 + 방어/진형/아이템/퇴각
- Manual / All Attack / Repeat / Smart Auto
- ×1 / ×2 / ×3 연출속도
- 일반/정예 조건부 퇴각, 보스는 기본 퇴각 불가

### 5.8 Character Growth
- Party Lv.1~10 공유
- 기본 스탯: HP / ATK / DEF / SPD / INT
- Lv.2/4/6/8/10에 장수별 특성 3택
- 장수 고유 특성 약 70~80%, 병과/역할 공용 약 20~30%
- 기존 빌드 태그 관련 후보 가중치 약 ×1.5~2.0
- Run 공용 Trait Reroll 2회
- 장수 희귀도/별등급 없음
- 기본 능력치 격차는 약 10~20% 범위, 핵심 차이는 고유 메커니즘

### 5.9 Equipment / Inventory
- 장수당 무기/방어구/보물 3슬롯
- 공용 가방 기본 10칸
- 일부 병법서/보물/특수 옵션 미식별
- 투척 및 일부 설치 아이템 허용
- Gold 사용: 구매/감정/Run 내 강화
- 장비 강화는 해당 Run에서만 유지

### 5.10 KO / Failure
- 군주 포함 HP 0 → KO
- 남은 장수가 있으면 전투 계속
- 전원 KO → Run 실패
- 승리 후 KO 장수는 낮은 HP로 복귀, 치료 필요
- 일반 치료는 전투 중 KO 부활 불가; 일부 고유 스킬/희귀 아이템만 가능

### 5.11 Meta Progression
영구 스탯 성장 없음.

유지되는 항목:
- 군주/장수 해금
- 전역
- 장비/보물/병법서 출현 풀
- 도감
- 업적
- 스토리

Run 종료 시 초기화:
- 레벨
- Trait
- 장비
- Gold
- 군량
- 파티 영입 상태
- 대부분의 아이템/유물

## 6. MVP Scope

### 6.1 Campaign
#### 황건적의 난 — 완성
- 15층
- 5F 장보
- 10F 장량
- 15F 장각
- 고유 기믹: 경보망, 술법진

#### 호로관 — Preview
- 3~5층 Vertical Slice
- 프리뷰 보스: 화웅
- 고유 기믹: 관문/성문, 고정 수비대

### 6.2 Roster
군주 3:
- 유비
- 조조
- 손권

일반 장수 12:
- 관우, 장비, 조운, 황충, 제갈량
- 장료, 하후돈, 가후
- 태사자, 주유, 감녕
- 화타

## 7. Functional Requirements

### FR-001 — Deterministic Run State
- Priority: P0
- State: APPROVED
- Requirement: 같은 seed와 동일한 command sequence는 동일한 dungeon/battle 결과를 재현해야 한다.
- AC-001-01: RNG 호출이 seeded RNG contract 밖에서 발생하지 않는다.
- AC-001-02: replay fixture가 동일 최종 state hash를 생성한다.

### FR-002 — Dungeon Turn Engine
- Priority: P0
- State: APPROVED
- Requirement: 탐험에서 플레이어 행동 1회가 dungeon turn 1회를 진행시킨다.
- AC-002-01: 이동/대기/아이템/탐색 후 적과 지속효과가 같은 turn cycle에서 갱신된다.
- AC-002-02: 제자리 방향 전환만 turn을 소비하지 않는다.

### FR-003 — Procedural Floor Generation
- Priority: P0
- State: APPROVED
- Requirement: 일반층은 5~9개 방과 복도로 절차 생성된다.
- AC-003-01: 시작점에서 계단까지 항상 도달 가능하다.
- AC-003-02: 동일 seed에서 동일 floor topology가 생성된다.

### FR-004 — Party Battle
- Priority: P0
- State: APPROVED
- Requirement: 적 부대 접촉 시 최대 5 vs 5 battle state가 생성된다.
- AC-004-01: 전열/후열 타기팅 규칙이 적용된다.
- AC-004-02: SPD Timeline에 따라 개별 행동한다.
- AC-004-03: Manual과 Smart Auto가 동일 command contract를 사용한다.

### FR-005 — Run Growth
- Priority: P0
- State: APPROVED
- Requirement: Party Lv.1~10과 Trait 3택 성장 구조를 제공한다.
- AC-005-01: Lv.2/4/6/8/10에 선택권이 발생한다.
- AC-005-02: 중간 영입 장수는 현재 Party Level에 동기화된다.

### FR-006 — Run Economy
- Priority: P1
- State: APPROVED
- Requirement: 군량, Gold, 10칸 가방, 장비, 상점, 감정, 강화가 하나의 Run 경제를 구성한다.
- AC-006-01: Run 종료 시 Run economy state가 초기화된다.
- AC-006-02: 영구 능력치 상승 구매는 존재하지 않는다.

### FR-007 — MVP Content
- Priority: P0
- State: APPROVED
- Requirement: 황건적 15F 완성 전역과 호로관 3~5F Preview를 제공한다.
- AC-007-01: 황건적 전역은 시작부터 장각까지 완주 가능하다.
- AC-007-02: 호로관 Preview에서 전역 고유 기믹 차이가 확인된다.

## 8. Material NFR

| NFR ID | Category | Requirement | Acceptance Measure |
|---|---|---|---|
| NFR-001 | Determinism | Core simulation은 재현 가능해야 한다. | 동일 fixture state hash 일치 |
| NFR-002 | Testability | Battle/Dungeon Domain은 Renderer 없이 실행 가능해야 한다. | headless automated tests 가능 |
| NFR-003 | Mobile UX | 모바일 세로 화면에서 핵심 루프 수행 가능 | 실제 device/browser 검증 필요 (`NOT_RUN`) |
| NFR-004 | Performance | Smart Auto ×3에서도 입력/상태 진행이 안정적이어야 한다. | 목표값은 prototype 후 설정 (`UNKNOWN`) |

## 9. Risk / Unknown

| ID | Type | Description | Impact | Mitigation / Next Evidence | State |
|---|---|---|---|---|---|
| R-001 | RISK | 5인 파티와 Trait 수가 선택 피로를 만들 수 있음 | Run tempo 저하 | Vertical Slice UX test | OPEN |
| R-002 | RISK | Smart Auto가 수동 플레이를 대체하거나 답답할 수 있음 | 핵심 재미 저하 | AI utility simulation + manual comparison | OPEN |
| R-003 | RISK | 군량/회복/증원 압박이 과도할 수 있음 | 불쾌한 난이도 | Dungeon simulation | OPEN |
| U-001 | UNKNOWN | 20~30분 실제 Run 달성 여부 | 제품 목표 | Instrumented playtest | OPEN |
| U-002 | UNKNOWN | 최종 렌더링/웹 기술스택 | 구현 영향 | ADR 작성 전 승인 필요 | OPEN |

## 10. Open Decisions

| ID | Decision | State |
|---|---|---|
| OD-001 | 구현 스택 확정(예: Next.js/React/Phaser/Supabase) | OPEN |
| OD-002 | 실제 MVP 시각 스타일/아트 방향 | OPEN |
| OD-003 | 정량적인 성공/리텐션/Run 반복 지표 | OPEN |

## 11. Requirement Traceability

현재 구현은 시작되지 않았다.

| Requirement | Implementation | Test | Verification |
|---|---|---|---|
| FR-001~007 | NOT_STARTED | NOT_RUN | NOT_RUN |

## 12. Extension Activation
- Product Management: ACTIVE
- Software Engineering: ACTIVE for implementation phase
- UX/UI: SUPPORTING for vertical slice
- QA/Reliability: SUPPORTING for simulation and regression
- Security/Privacy: ON_DEMAND when account/persistence is introduced
- Platform/DevOps: ON_DEMAND when deployment starts

## 13. Responsibility Boundary
- PRD: WHAT / WHY / DONE
- `docs/specs`: approved game rules and initial balance seed
- `docs/decisions`: durable choices
- Repository/Test: implementation and observed evidence
- SESSION_HANDOFF: current execution index
