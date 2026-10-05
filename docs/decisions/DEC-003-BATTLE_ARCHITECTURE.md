# DEC-003 — Battle Architecture

- State: APPROVED
- Date: 2026-10-05

## Decision
- 최대 5 vs 5
- 전열/후열 + 좌/중/우
- SPD Timeline 기반 턴제
- 기력 100 및 궁극기
- Manual/All Attack/Repeat/Smart Auto
- Manual과 Auto는 동일 Battle Engine/Command Contract 사용

## Consequence
Battle Engine은 UI/Renderer와 분리된 headless domain module로 구현한다.
