# Art asset registry — current production set

Direction: DEC-025, modern ink graphic novel × lianhuanhua. Original approved assets are preserved. Counts follow shipped runtime content rather than the old approximate queue.

| Asset / surface | Status | Coverage / source |
|---|---|---|
| Playable characters | IMPLEMENTED | 48 distinct bust/full-body/token identities, including the original 15 |
| Named bosses outside playable roster | IMPLEMENTED | 19 distinct bust/full-body/token sets |
| Ordinary troop portrait masters | IMPLEMENTED | 12 role masters; Yellow Turban, imperial soldiers and southern tribes |
| Ordinary faction variants | IMPLEMENTED | 45 explicit shared-portrait bindings, each with a distinct faction/weapon SVG token |
| Manifest physical files | IMPLEMENTED | 79 busts + 79 full bodies + 124 tokens; manifest and PRODUCTION_ART_PLAN.json |
| Dungeon/object/item atlas | IMPLEMENTED | ink-dungeon-v1.svg; item/equipment IDs covered; fallback preserved |
| UI/story/codex/battle visual layer | IMPLEMENTED | Ink/hanji skin, native portraits, local typography, touch targets, timeline tokens, hit/heal/status cues |
| Runtime asset verification | VERIFIED | CI 37617790841: 283 images decoded, 48 characters / 89 enemy names / 16 layouts, fallback passed; MOBILE_UX_GRAPHICS_20261007.md records follow-up UI checks |

General soldiers share a face by role, while named historical figures retain their own identity. Full-body files load only when visible. Asset load failures use existing procedural art.

Old concept sheets and obsolete gate/queue statements are archived in HISTORY_ASSET_REGISTRY_20261006.md. They are not active production requirements. No new gameplay, save, balance or campaign rules are introduced.
