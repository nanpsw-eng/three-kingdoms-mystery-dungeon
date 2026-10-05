# SESSION HANDOFF — 2026-10-05 Story Expansion S1 (E2 반동탁연합)

## Current State
- Repository: `nanpsw-eng/three-kingdoms-mystery-dungeon` (public) · main = MVP + Pages deploy
- Work branch: `feature/story-expansion` (Claude) · Codex art branch: `art/ink-graphic-novel-v1` (no commits beyond main yet)
- Delegation: full (DEC-024) — follow STORY_EXPANSION_PLAN recommendations; production deploy APPROVED
- Deploy: `.github/workflows/deploy.yml` pushes `site/` to `gh-pages` on every main push (run #4 success). Expected URL https://nanpsw-eng.github.io/three-kingdoms-mystery-dungeon/ — needs Settings → Pages → Deploy from branch `gh-pages` once (not verifiable from sandbox)
- Local: `npm test` 145/0 PASS · `build:web` PASS · sim E1 35.0% / E2 28.0%

## Stage Evidence
| Stage | Report |
|---|---|
| MVP phases 7–14 | `docs/reports/*PHASE*.md`, `RUN_SIMULATION_PHASE13.md`, `WEB_CLIENT_PHASE14.md` |
| S0 foundation | `docs/reports/STORY_S0_FOUNDATION.md` |
| S1 E2 반동탁연합 | `docs/reports/STORY_S1_ANTI_DONG.md` |

## DO_NOT_REPEAT
- MVP battle/dungeon/run/content/sim/web (see earlier reports)
- S0: scenes/variants/choices, duel, multi-phase boss, enemy recruit + meta unlock, mechanic registry (7 types), validateContent, story.ts UI
- S1: E2 module `src/content/campaigns/e2-anti-dong.ts` (pattern for E3–E9), timeline UI, ART_ALIASES, duel HP ratio 0.6

## NEXT_SAFE_ACTION
1. S2: E3 서주 12F (flood, 원술·여포/백문루; 진궁·장패·고순·미축) + E4 관도 15F (안량·문추 duels, 오소 night-raid, 5관; 허저·전위·순욱·안량·문추)
2. Each stage: `validateContent` clean, sim clear rate 20–35%, tests, report, PR → main (merge commit), deploy
3. At each stage boundary: `git ls-remote origin` for Codex branches; merge art (Codex owns style.css, web/src/{sprites,portraits,map,assets}.ts, web/assets/**)

## Human Gate (still required)
- Paid services · Repository visibility change
