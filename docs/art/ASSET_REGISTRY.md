# Art Asset Registry — v1

Status vocabulary: `CONCEPT`, `APPROVED`, `MASTER_REQUIRED`, `IMPLEMENTATION_READY`, `IMPLEMENTED`, `NEEDS_REVISION`, `SUPERSEDED`.

| Asset / surface | Status | Source / note | Next action |
|---|---|---|---|
| Global art direction | `APPROVED` | DEC-025 + Visual Bible v1 | Do not reopen without explicit user direction |
| Phase A shared ink/hanji UI system | `IMPLEMENTATION_READY` | `PHASE_A_VISUAL_SPEC_V1.md` | Implement CSS tokens and shared components |
| Title screen visual slice | `IMPLEMENTATION_READY` | Phase A spec; existing selection DOM retained | Implement, capture 390×844 evidence |
| Yellow Turban Dungeon visual slice | `IMPLEMENTATION_READY` | Phase A spec; topology and interaction frozen | Implement renderer skin, capture evidence |
| Standard Battle visual slice | `IMPLEMENTATION_READY` | Phase A spec; battle behavior frozen | Implement cards/timeline/controls, capture evidence |
| Liu Bei portrait / full-body / exploration token | `MASTER_REQUIRED` | Visual Bible v1 ruler master | Create and approve one consistent master set |
| Cao Cao portrait / full-body / exploration token | `MASTER_REQUIRED` | Visual Bible v1 ruler master | Create and approve one consistent master set |
| Sun Quan portrait / full-body / exploration token | `MASTER_REQUIRED` | Visual Bible v1 ruler master | Create and approve one consistent master set |
| Dungeon floor/wall/corridor/fog/object illustrations | `MASTER_REQUIRED` | Phase C visual language | Create after Phase A/B |
| Item silhouette set | `MASTER_REQUIRED` | Phase D item language | Create after Phase C |
| Existing procedural pixel portraits/sprites/map tiles | `SUPERSEDED` | Legacy main visual language; retained as fallback | Keep functional until replacement coverage is verified |


| Sima Yi bust/full-body/exploration token concept | `CONCEPT` | `concepts/sima-yi-master-concept-20261006.jpg` | Revise against the Liu Bei/Cao Cao/Sun Quan master set before approval |
| Codex character-detail screen concept v2 | `CONCEPT` | `concepts/codex-character-detail-mockup-v2-20261006.jpg` | Layout reference only; align final details with current 40px portrait component |
| Codex Bosses / Achievements / Items views | `IMPLEMENTATION_READY` | `CLAUDE_CONTENT_VISUAL_SPEC_20261006.md` | Design tab-specific states and readable unknown/locked states |
| Line-by-line story scene UI | `IMPLEMENTATION_READY` | `CLAUDE_CONTENT_VISUAL_SPEC_20261006.md` | Apply speaker portrait, n/m progress, next/tap/skip and choices |
| Story expansion character + enemy production art queue | `MASTER_REQUIRED` | `STORY_ART_QUEUE.md` on latest main | Work from existing stable ids / aliases; follow queue order |


| Original ruler master comparison concept (Liu Bei / Cao Cao / Sun Quan) | `CONCEPT` | `concepts/ruler-master-comparison-20261006.jpg` | Refine remaining metallic ornament, then produce separate bust/full-body/token masters |
| E2 boss duo (Dong Zhuo / Lü Bu) concept | `CONCEPT` | `concepts/dong-zhuo-lu-bu-boss-concept-20261006.jpg` | Simplify armor ornament and preserve broad-vs-tall silhouette contrast |


| Codex Bosses / Achievements / Items three-tab concept sheet | `CONCEPT` | `concepts/codex-secondary-tabs-20261006.jpg` | Keep data-driven counters, refine defeated/earned/unknown icons at mobile size |
| Line-by-line story scene UI two-state concept | `CONCEPT` | `concepts/story-scene-ui-20261006.jpg` | Align speaker portrait to actual 48px row, validate sheet scroll and fixed actions |

## Current Implementation State

The repository's current web client still uses the legacy dark/gold CSS theme and procedural pixel portrait/sprite/map renderers. This does not change the approved art direction; these remain fallback/legacy implementation surfaces until replacement assets and renderers are verified.

| E2 campaign boss trio (Yuan Shao / Cao Cao battle variant / Cao Ren) | `CONCEPT` | `concepts/e2-boss-trio-yuan-shao-cao-cao-cao-ren-20261006.jpg` | Preserve tall/elegant, compact/dark, and broad/shield-first reads; simplify ornament before master approval |
