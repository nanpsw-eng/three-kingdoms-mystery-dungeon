# SESSION HANDOFF — Art Direction v1

## Current State
- Repository: `nanpsw-eng/three-kingdoms-mystery-dungeon`
- Branch: `art/ink-graphic-novel-v1`
- Base Implementation Commit: `017e0c4130f914dd33d2ab74f2093d4170b0e438`
- Current Gate: `INK_GRAPHIC_NOVEL_V1_APPROVED / VERTICAL_SLICE_NEXT`
- Merge: `NOT_RUN / HUMAN_GATE`
- Deploy: `NOT_RUN / HUMAN_GATE`

## Approved Visual Baseline
- 현대 수묵 그래픽 노블 × 삼국지 연환화
- 한지 / 먹 / 주홍 중심의 제한 팔레트
- 최종 Portrait는 pixelization 금지
- Dungeon topology와 game logic은 유지하고 visual skin만 교체
- Visual Source of Truth:
  - `docs/decisions/DEC-025-ART_DIRECTION.md`
  - `docs/art/VISUAL_BIBLE_V1.md`
  - `docs/art/reference/*.jpg`
  - `docs/ai-dev/CODEX_ART_HANDOFF.md`

## DO_NOT_REPEAT
- Battle/Dungeon/Run/Content engine 구현
- 기존 MVP content 재설계
- 아트 방향 A/B/C 비교
- 수묵 그래픽 노블 방향 재선정
- 기존 pixel/lacquer theme polish

## NEXT_SAFE_ACTION
1. Read `docs/ai-dev/CODEX_ART_HANDOFF.md`.
2. Inventory current visual code only.
3. Create ink-paper CSS token layer.
4. Re-skin one vertical slice: Title + Dungeon + one Battle screen.
5. Apply 3 ruler masters before expanding full roster.
6. Run existing test/build/UI smoke after each meaningful phase.

## Verification
- Art reference persistence: repository commit required in this session.
- New visual implementation: `NOT_STARTED`
- Existing game engine tests/build: inherit base implementation evidence; rerun before/after code changes.

## Human Gate
- Merge to `main`: REQUIRED
- Production deploy/release: REQUIRED
- Product Baseline material change: REQUIRED
- Different art direction: REQUIRED
