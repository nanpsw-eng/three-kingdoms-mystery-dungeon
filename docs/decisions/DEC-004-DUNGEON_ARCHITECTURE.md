# DEC-004 — Dungeon Architecture

- State: APPROVED
- Date: 2026-10-05

## Decision
- 방+복도 Procedural Generation
- 1행동=1턴
- 방 전체 시야/복도 제한 시야
- 적 방향/거리 탐지 및 후방 기습
- 군량/자연회복/층 위험도/증원
- 함정/비밀방/환경 Modifier
- 계단 하강 후 이전 층 복귀 불가

## Consequence
Dungeon Engine도 Seeded RNG와 deterministic state transition을 가져야 한다.
