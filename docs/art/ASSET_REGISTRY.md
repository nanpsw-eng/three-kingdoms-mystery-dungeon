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

## Current Implementation State

The repository's current web client still uses the legacy dark/gold CSS theme and procedural pixel portrait/sprite/map renderers. This does not change the approved art direction; these remain fallback/legacy implementation surfaces until replacement assets and renderers are verified.
