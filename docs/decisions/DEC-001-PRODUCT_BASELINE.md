# DEC-001 — Product Baseline

- State: APPROVED
- Date: 2026-10-05

## Decision
제품의 핵심 정체성을 **삼국지 × Mystery Dungeon × Party Roguelite**로 고정한다.

필드에는 대표 군주 1명만 보이며, 적 부대 접촉 시 현재 공간을 확대해 최대 5인 파티 턴제 전투를 수행한다.

## Rationale
- 시렌식 탐험 가독성을 유지하면서 삼국지 장수 편성의 재미를 살릴 수 있다.
- 필드에서 5명의 follower pathfinding/충돌 복잡도를 제거한다.
- 탐험과 전투의 규칙을 분리하되 현재 방/지형/기습 상태를 공유할 수 있다.

## Consequence
- Dungeon State와 Battle State 간 명확한 transition contract가 필요하다.
- 파티원의 개별 필드 좌표는 기본적으로 필요하지 않다.
