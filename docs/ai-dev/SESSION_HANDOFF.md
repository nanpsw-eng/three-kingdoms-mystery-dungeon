# SESSION HANDOFF — 2026-10-05 Story Expansion S0 (기반 시스템)

## Current State
- Repository: `nanpsw-eng/three-kingdoms-mystery-dungeon` (public) · main = MVP + Pages deploy
- Work branch: `feature/story-expansion` (Claude) · Codex art branch: `art/ink-graphic-novel-v1` (no commits beyond main yet)
- Delegation: full (DEC-024) — follow STORY_EXPANSION_PLAN recommendations; production deploy APPROVED
- Deploy: `.github/workflows/deploy.yml` pushes `site/` to `gh-pages` on every main push (run #4 success). Expected URL https://nanpsw-eng.github.io/three-kingdoms-mystery-dungeon/ — needs Settings → Pages → Deploy from branch `gh-pages` once (not verifiable from sandbox)
- Local: `npm test` 142/0 PASS · `build:web` PASS · E1 sim 35.0%

## Stage Evidence
| Stage | Report |
|---|---|
| MVP phases 7–14 | `docs/reports/*PHASE*.md`, `RUN_SIMULATION_PHASE13.md`, `WEB_CLIENT_PHASE14.md` |
| S0 foundation | `docs/reports/STORY_S0_FOUNDATION.md` |

## DO_NOT_REPEAT
- MVP battle/dungeon/run/content/sim/web (see earlier reports)
- S0: scenes/variants/choices, duel, multi-phase boss, enemy recruit + meta unlock, mechanic registry (7 types), validateContent, story.ts UI

## NEXT_SAFE_ACTION
1. S1: E2 반동탁연합 12F (replace Hulao preview) — 화웅(duel) · 여포(multi-phase) · 동탁, burning-capital on 낙양 floors, new generals (여포·손견·원소·조인·화웅), timeline screen
2. Each stage: `validateContent` clean, sim clear rate 20–35%, tests, report, PR → main (merge commit), deploy
3. At each stage boundary: `git ls-remote origin` for Codex branches; merge art (Codex owns style.css, web/src/{sprites,portraits,map,assets}.ts, web/assets/**)

## Human Gate (still required)
- Paid services · Repository visibility change
