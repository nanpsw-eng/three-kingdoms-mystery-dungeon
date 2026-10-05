import type { ContentPack } from "../run/types.js";
import { E2_ANTI_DONG } from "./campaigns/e2-anti-dong.js";
import { E3_XUZHOU } from "./campaigns/e3-xuzhou.js";
import { E4_GUANDU } from "./campaigns/e4-guandu.js";
import { E5_RED_CLIFFS } from "./campaigns/e5-red-cliffs.js";
import { EVENTS_DATA, UNLOCK_RULES, YELLOW_TURBAN } from "./campaigns.js";
import { CHARACTER_SKILL_NAMES, CHARACTER_SKILLS, CHARACTERS } from "./characters.js";
import { ENEMY_GROUPS, ENEMY_SKILL_NAMES, ENEMY_SKILLS } from "./enemies.js";
import { EQUIPMENT, ITEMS } from "./items.js";
import type { CampaignModule } from "./module.js";
import { YT_SCENES } from "./scenes.js";
import { TRAIT_SKILL_NAMES, TRAIT_SKILLS, TRAITS } from "./traits.js";

/** Story campaigns after E1, in timeline order (STORY_EXPANSION_PLAN §2). */
export const CAMPAIGN_MODULES: readonly CampaignModule[] = [E2_ANTI_DONG, E3_XUZHOU, E4_GUANDU, E5_RED_CLIFFS];
const M = CAMPAIGN_MODULES;

/**
 * Game content: MVP (DEC-005/021/022: 3 rulers + 12 generals, Yellow Turban 15F) + story campaigns (DEC-024).
 * The name is kept for compatibility; it is the full shipped pack.
 */
export const MVP_CONTENT: ContentPack = {
  characters: [...CHARACTERS, ...M.flatMap((m) => m.characters)],
  skills: [...CHARACTER_SKILLS, ...TRAIT_SKILLS, ...ENEMY_SKILLS, ...M.flatMap((m) => m.skills)],
  skillNames: Object.assign({}, CHARACTER_SKILL_NAMES, TRAIT_SKILL_NAMES, ENEMY_SKILL_NAMES, ...M.map((m) => m.skillNames)),
  traits: [...TRAITS, ...M.flatMap((m) => m.traits)],
  equipment: EQUIPMENT,
  items: ITEMS,
  enemyGroups: [...ENEMY_GROUPS, ...M.flatMap((m) => m.enemyGroups)],
  events: [...EVENTS_DATA, ...M.flatMap((m) => m.events)],
  scenes: [...YT_SCENES, ...M.flatMap((m) => m.scenes)],
  campaigns: [YELLOW_TURBAN, ...M.map((m) => m.campaign)],
  unlocks: [...UNLOCK_RULES, ...M.flatMap((m) => m.unlocks)],
  startingUnlocks: {
    characters: ["liu-bei", "cao-cao", "sun-quan", "guan-yu", "zhang-fei", "zhang-liao", "xiahou-dun", "taishi-ci", "gan-ning"],
    campaigns: ["yellow-turban"],
  },
};

export { CHARACTERS, ENEMY_GROUPS, EQUIPMENT, ITEMS, TRAITS, YELLOW_TURBAN };
export { validateContent } from "./validate.js";
