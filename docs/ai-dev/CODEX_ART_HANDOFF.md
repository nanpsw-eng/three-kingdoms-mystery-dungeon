# CODEX ART HANDOFF — Ink Graphic Novel v1

## Target

- Repository: `nanpsw-eng/three-kingdoms-mystery-dungeon`
- Working Branch: `art/ink-graphic-novel-v1`
- Base Implementation Commit: `017e0c4130f914dd33d2ab74f2093d4170b0e438`
- Art Gate: `INK_GRAPHIC_NOVEL_V1_APPROVED / VERTICAL_SLICE_NEXT`
- Merge to `main`: HUMAN GATE
- Production deploy: HUMAN GATE

## Goal

현재 완성된 Battle/Dungeon/Run/Content 로직을 재작성하지 않고, 승인된 **현대 수묵 그래픽 노블 × 연환화** 방향으로 Web visual layer를 교체한다.

게임 규칙과 콘텐츠 결정은 다시 열지 않는다.

## Required Read

1. `AGENTS.md`
2. `docs/decisions/DEC-025-ART_DIRECTION.md`
3. `docs/art/VISUAL_BIBLE_V1.md`
4. `docs/art/reference/gameplay-target-v1.jpg`
5. `docs/art/reference/visual-bible-v1.jpg`
6. `docs/art/reference/ruler-comparison-v1.jpg`
7. 필요할 때만 `docs/product/GAME_DESIGN_PRD.md`

## DO_NOT_REPEAT / DO_NOT_REWRITE

다음을 아트 작업 때문에 재구현하지 않는다.
- `src/battle/`
- `src/dungeon/`
- `src/run/`
- `src/content/`
- seeded RNG / deterministic replay
- Smart Auto / All Attack / Repeat
- Run economy / recruitment / traits / meta progression

기존 `web/` behavioral contract도 가능하면 보존하고 skin/asset renderer를 교체한다.

## Primary Visual Surfaces

- `web/style.css`
- `web/src/assets.ts`
- `web/src/map.ts`
- `web/src/sprites.ts`
- `web/src/portraits.ts`
- `web/src/pixel.ts`
- 필요 시 `web/src/main.ts`의 markup/class adapter만 최소 변경

## Execution Plan

### Phase A — Design Token + Vertical Slice
1. 현재 visual code를 inventory한다.
2. ink/paper/vermilion CSS token layer를 만든다.
3. Title + Dungeon + one Battle 화면만 새 스타일로 완성한다.
4. 기존 functionality를 그대로 유지한다.
5. 390×844 mobile portrait에서 확인한다.

### Phase B — Ruler Masters
1. 유비/조조/손권 3인을 master sample로 적용한다.
2. Bust / full-body / exploration token identity를 통일한다.
3. missing asset에는 기존 procedural fallback을 유지한다.

### Phase C — Dungeon + Objects
1. floor/wall/corridor
2. ink fog
3. stairs/chest/pot/trap/sorcery
4. player/enemy marker
5. environment overlay

### Phase D — Items
Food / medicine / scroll / weapon / armor / treasure icon set를 Visual Bible 언어로 통일한다.

### Phase E — Full Roster
12 generals + enemies + bosses로 확장한다. 먼저 3 rulers에서 승인된 visual language를 복제한다.

## Acceptance

- 게임 동작 회귀 없음
- `npm test` PASS
- `npm run build:web` PASS
- e2e/UI smoke에서 console/page error 0
- 390×844 기준 주요 정보가 clipping되지 않음
- reference 이미지와 명확히 같은 art family로 보임
- missing asset fallback 동작
- black/gold lacquer가 더 이상 main theme가 아님
- final portrait에 자동 pixelization 강제 없음

## Stop Conditions

아래는 사용자 승인 전 수행하지 않는다.
- 다른 art direction 선택
- Product Baseline material change
- `main` merge
- production deploy
- paid asset/service 도입
- third-party copyrighted game art를 repo에 복제

## Session Continuity

실질 변경 후:
- exact HEAD
- changed visual surfaces
- test/build/smoke 결과
- screenshot/reference
- next incomplete art task

를 `docs/ai-dev/SESSION_HANDOFF.md`에 기록한다.

완료된 visual phase를 반복하지 말고, 실제 repository state 다음의 최초 미완료 task부터 이어간다.


## Phase A Current Implementation Brief

Implementation-ready visual spec: `docs/art/PHASE_A_VISUAL_SPEC_V1.md`
Asset states: `docs/art/ASSET_REGISTRY.md`

First implementation scope:
1. Replace the main dark/gold CSS theme with the approved ink/hanji semantic token system.
2. Apply the shared paper panel, brush section label, bars, buttons, selected/focus states, and >=44px touch targets.
3. Retheme the existing Title, Yellow Turban Dungeon, and standard Battle surfaces while preserving DOM behavior and Canvas interaction.
4. Preserve existing procedural pixel assets as fallback. Do not start the full Ruler Master asset set in this phase.
5. Keep `src/battle/`, `src/dungeon/`, `src/run/`, and `src/content/` unchanged. `main.ts` is adapter-only if a screen class/data attribute is necessary.

Required evidence: `npm test`, `npm run build:web`, UI smoke result, and 390×844 screenshots for all three screens. Record any unavailable check as `NOT_RUN`; do not infer PASS. After implementation, return screenshots to Work for Visual QA before marking Phase A accepted.
