# DEC-024 — Story Expansion Approval & Full Delegation

- State: APPROVED (user, 2026-10-05: "권장안대로 진행해 … 모든 사항은 위임")
- Supersedes (Delta): DEC-005 MVP scope — Non-Goals "관도/적벽 완성 전역" and "30명 이상의 초기 캐릭터" lifted for the story expansion (initial unlocked roster stays small; growth via unlocks).

## Decision
1. Execute `docs/product/STORY_EXPANSION_PLAN.md` (E1–E9, S0–S5) with all recommended options:
   - Romance (연의) narrative basis, historical notes in codex
   - Shared historical perspective; ruler differences via dialogue/events/bonuses only
   - Independent campaign runs unlocked along the timeline
2. Merge MVP branch `feature/headless-battle-engine` into `main`; continue on `feature/story-expansion`.
3. The user will not issue further instructions; Claude decides by documented recommendation (logged in DEC-023/DEC-024 tables).

## Production deploy
- APPROVED by the user (2026-10-05, "프로덕션 배포도 승인할게").

## Still requires explicit human approval
- Paid services, repository visibility changes.

## Auto-decision log (expansion)
| ID | Decision | Rationale |
|---|---|---|
| B-01 | Merge method for MVP → main: merge commit (keeps history, no rewrite) | traceability |
| B-02 | Production hosting: GitHub Pages via Actions on every `main` push (tests must pass first) | free for public repo, no new vendor, static site fits |
| B-03 | Deploy: push `site/` to `gh-pages` branch (GITHUB_TOKEN cannot enable the Pages API) | works without repo-admin token |
| B-04 | Each story campaign is a self-contained `CampaignModule` (`src/content/campaigns/eN-*.ts`) merged into the pack | isolates content per stage, validation covers all |
| B-05 | 일기토 champion fights at `DUEL_CHAMPION_HP_RATIO` 0.6 of max HP (boss ≈ 3× general HP made full-HP duels unwinnable: 0/79 → ~65% for the strongest fighter) | sim evidence S1 |
| B-06 | Enemy content avoids pure self-heal skills (동탁 주지육림 caused a 5000-action stalemate vs a lone survivor) | battle termination |
| B-07 | Hulao preview (4F, start Lv5) is replaced by E2 반동탁연합 12F (id `anti-dong`); E1 clear unlocks it | plan S1 |
| B-08 | Recruited enemy generals and `clearedCampaigns` persist in meta (optional field, old saves compatible) | X6/X2 |
| B-09 | Autopilot heads for the stairs when any floor mechanic is urgent | sim policy for time-limit floors |
| B-10 | New characters reuse existing art via `ART_ALIASES` until Codex supplies art | no blank portraits |
