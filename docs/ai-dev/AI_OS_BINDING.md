# AI-OS Project Binding — Three Kingdoms Mystery Dungeon

## Canonical Binding
- AI-OS Repository: `nanpsw-eng/AI-OPERATING-SYSTEM`
- Stable Version: `v0.4.4`
- Exact Commit: `64b5115a698cc6a94cd8df80abb2ee7109010764`
- Binding Type: `PROJECT_BASELINE`
- Binding Status: `EXECUTION_CONFIRMED`
- Bound Date: `2026-10-05`

## Project Canonical Sources
- Project AI Rules: `AGENTS.md`
- Product Source of Truth: `docs/product/GAME_DESIGN_PRD.md`
- Durable Decisions: `docs/decisions/DECISION_INDEX.md`
- Session Handoff: `docs/ai-dev/SESSION_HANDOFF.md`

## Activated Domains
- REQUIRED: `product-management`, `software-engineering`
- SUPPORTING: `product-design-ux-ui`, `qa-reliability`
- ON_DEMAND: `platform-devops`, `application-security-privacy`

## Loading Rule
AI-OS가 필요한 작업에서만 위 exact commit 기준으로 필요한 Core Policy와 Domain Pack을 선택적으로 읽는다. 승인된 결정을 우선 재사용하고 현재 변경의 위험 통제에 필요한 최소 Context·Agent·Test·Cost만 사용한다.

## Project Override Rule
프로젝트 고유의 제품 요구사항과 더 엄격한 Hard Rule은 프로젝트 Source of Truth가 소유한다. 충돌은 적용 AI-OS의 Source-of-Truth 정책에 따라 처리한다.

## Update Rule
AI-OS Stable이 변경되어도 자동 추종하지 않는다. 프로젝트 적용 검토와 필요한 Human Gate 후 이 Binding을 명시적으로 갱신한다.
