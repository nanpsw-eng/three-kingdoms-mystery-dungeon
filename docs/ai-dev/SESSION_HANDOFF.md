# SESSION HANDOFF — 2026-10-05 (two parallel tracks)

이 파일은 두 작업 트랙의 최소 Context Index다. 각 트랙은 자기 섹션만 갱신한다.
- **Track A — Story/Engine (Claude)**: `feature/story-expansion` · `src/**`, `test/**`, `scripts/simulate.mjs`, `docs/**`(아트 제외)
- **Track B — Art (Codex)**: `art/ink-graphic-novel-v1` · `web/style.css`, `web/src/{sprites,portraits,pixel,map,assets}.ts`, `web/assets/**`, `docs/art/**`

## Shared
- Repository: `nanpsw-eng/three-kingdoms-mystery-dungeon` (public)
- Delegation: full (DEC-024). Production deploy APPROVED by user; `main` merges are performed by Track A at stage boundaries, including Track B art work ("코덱스의 그래픽 작업을 중간중간 확인해서 실제 게임 내에 반영").
- Deploy: every `main` push → tests → `site/` to `gh-pages`. URL https://nanpsw-eng.github.io/three-kingdoms-mystery-dungeon/ (Settings → Pages → `gh-pages` once; not verifiable from sandbox)
- Still requires the user: paid services, repo visibility change, a different art direction (DEC-025), Product Baseline material change

---

## Track A — Story/Engine (Claude)
- Gate: `S4_COMPLETE / S5_NEXT`
- Local: `npm test` 150/0 PASS · `build:web` PASS · sim smart 200: E1 35.0% · E2 28.0% · E3 29.5% · E4 24.5% · E5 28.0% · E6 24.0% · E7 24.0%

| Stage | Report |
|---|---|
| MVP phases 7–14 | `docs/reports/*PHASE*.md`, `RUN_SIMULATION_PHASE13.md`, `WEB_CLIENT_PHASE14.md` |
| S0 foundation | `docs/reports/STORY_S0_FOUNDATION.md` |
| S1 E2 반동탁연합 | `docs/reports/STORY_S1_ANTI_DONG.md` |
| S2 E3 서주 · E4 관도 | `docs/reports/STORY_S2_XUZHOU_GUANDU.md` |
| S3 E5 적벽 | `docs/reports/STORY_S3_RED_CLIFFS.md` |
| S4 E6 형주·익주 · E7 이릉 | `docs/reports/STORY_S4_JING_YI_YILING.md` |

DO_NOT_REPEAT
- MVP battle/dungeon/run/content/sim/web
- S0: scenes/variants/choices, duel, multi-phase boss, enemy recruit + meta unlock, mechanic registry (7 types), validateContent, story.ts UI
- S1/S2: `CampaignModule` per campaign (`src/content/campaigns/e2..e7`), `pursuit` mechanic, timeline UI, `ART_ALIASES`, duel HP ratio 0.6

NEXT_SAFE_ACTION
1. S5: E8 남만 12F(칠종칠금 3단 보스 체인, 장기) + E9 북벌 15F(siege-waves, wooden-ox, 사마의 군주 해금, 엔딩) + 명성(X8)
3. Each stage: validateContent clean, sim 20–35%, tests, report, PR → main, deploy; check Track B branch and merge art

## Track B — Art (Codex) — as recorded by Codex
- Branch `art/ink-graphic-novel-v1` · Gate `INK_GRAPHIC_NOVEL_V1_APPROVED / VERTICAL_SLICE_NEXT`
- Visual source of truth: `DEC-025`, `docs/art/VISUAL_BIBLE_V1.md`, `docs/art/reference/*.jpg`, `docs/ai-dev/CODEX_ART_HANDOFF.md`
- New characters/enemies needing art: `docs/art/STORY_ART_QUEUE.md` (temporary aliases in `web/src/story.ts`)

DO_NOT_REPEAT
- Battle/Dungeon/Run/Content engine 구현 · MVP content 재설계 · 아트 방향 비교/재선정 · pixel/lacquer theme polish

NEXT_SAFE_ACTION
1. Read `docs/ai-dev/CODEX_ART_HANDOFF.md`
2. Inventory current visual code; ink-paper CSS token layer
3. Re-skin vertical slice: Title + Dungeon + one Battle; 3 ruler masters; then full roster incl. `STORY_ART_QUEUE.md`
4. Run test/build/UI smoke after each phase
- New visual implementation: `NOT_STARTED` (as of bfb023a)
