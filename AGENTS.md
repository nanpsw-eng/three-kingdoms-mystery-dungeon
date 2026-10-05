# Project AI Rules

## 1. Source of Truth

우선순위는 다음을 기본으로 한다.

1. 사용자의 최신 명시 지시
2. `docs/ai-dev/AI_OS_BINDING.md`의 exact AI-OS baseline
3. 본 `AGENTS.md`
4. 승인된 `docs/product/GAME_DESIGN_PRD.md`
5. `docs/decisions/`
6. `docs/specs/`
7. Repository code / test evidence
8. `docs/ai-dev/SESSION_HANDOFF.md`

충돌 시 추정하지 말고 상태를 `UNKNOWN` 또는 `DECISION_REQUIRED`로 표시한다.

## 2. Approved Baseline Reuse

- 이미 APPROVED 또는 BASELINE으로 기록된 게임 결정을 새로운 Evidence 없이 재논의하지 않는다.
- 새로운 변경은 기존 결정의 Delta로 제안한다.
- 구현 편의를 이유로 Product Baseline을 암묵적으로 변경하지 않는다.

## 3. Game Logic Architecture Rule

- Dungeon/Battle 핵심 규칙은 Renderer와 분리된 **Pure TypeScript Domain Logic**을 우선한다.
- Seeded RNG를 사용하여 동일 seed + 동일 command sequence가 동일 결과를 생성하도록 설계한다.
- Manual과 Smart Auto는 동일 Battle Engine/Command Contract를 사용한다.
- 밸런스 수치는 코드에 산재시키지 말고 canonical config/data layer로 집중한다.

## 4. Verification Vocabulary

- 실행하지 않은 테스트는 `NOT_RUN`이다.
- 구현만 된 상태를 `VALIDATED` 또는 `PASS`라고 표현하지 않는다.
- 실제 Evidence 없이 성능, 플레이타임, 밸런스, UX 품질을 확정하지 않는다.

## 5. Scope Control

MVP Non-Goals를 임의로 추가하지 않는다.
특히 다음은 별도 승인 전 제외한다.

- PvP / 길드 / 가챠
- 장수 별등급 / 영구 능력치 성장
- 영구 장비 보존
- 자유이동 SRPG
- 대규모 월드맵
- 원소 가위바위보
- 30명 이상의 초기 캐릭터

## 6. Implementation Sequence

현재 기본 순서:

1. Headless Battle Engine
2. Dungeon Core
3. 1~5F Vertical Slice
4. MVP Content Expansion
5. Simulation / QA / Balance

실제 변경 위험이 낮으면 전체 Context/Agent/Test를 불필요하게 확대하지 않는다.

## 7. Human Gates

다음은 사용자 승인 없이 수행하지 않는다.

- Product Baseline의 material change
- main merge
- production release/deploy
- 비용이 발생하는 외부 서비스 활성화
- 공개/비공개 Repository 상태 변경

## 8. Session Continuity

실질적인 Repository 변경 세션 종료 시 `docs/ai-dev/SESSION_HANDOFF.md`를 업데이트한다.
Handoff는 Archive가 아니라 다음 실행을 위한 최소 Context Index로 유지한다.
