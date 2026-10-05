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

## Still requires explicit human approval
- Production deploy/release, paid services, repository visibility changes.

## Auto-decision log (expansion)
| ID | Decision | Rationale |
|---|---|---|
| B-01 | Merge method for MVP → main: merge commit (keeps history, no rewrite) | traceability |
