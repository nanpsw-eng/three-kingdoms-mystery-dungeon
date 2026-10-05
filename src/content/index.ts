import type { ContentPack } from "../run/types.js";
import { EVENTS_DATA, HULAO_PREVIEW, UNLOCK_RULES, YELLOW_TURBAN } from "./campaigns.js";
import { CHARACTER_SKILL_NAMES, CHARACTER_SKILLS, CHARACTERS } from "./characters.js";
import { ENEMY_GROUPS, ENEMY_SKILL_NAMES, ENEMY_SKILLS } from "./enemies.js";
import { EQUIPMENT, ITEMS } from "./items.js";
import { TRAIT_SKILL_NAMES, TRAIT_SKILLS, TRAITS } from "./traits.js";

/** MVP content (DEC-005/DEC-021/DEC-022): 3 rulers + 12 generals, Yellow Turban 15F, Hulao preview. */
export const MVP_CONTENT: ContentPack = {
  characters: CHARACTERS,
  skills: [...CHARACTER_SKILLS, ...TRAIT_SKILLS, ...ENEMY_SKILLS],
  skillNames: { ...CHARACTER_SKILL_NAMES, ...TRAIT_SKILL_NAMES, ...ENEMY_SKILL_NAMES },
  traits: TRAITS,
  equipment: EQUIPMENT,
  items: ITEMS,
  enemyGroups: ENEMY_GROUPS,
  events: EVENTS_DATA,
  campaigns: [YELLOW_TURBAN, HULAO_PREVIEW],
  unlocks: UNLOCK_RULES,
  startingUnlocks: {
    characters: ["liu-bei", "cao-cao", "sun-quan", "guan-yu", "zhang-fei", "zhang-liao", "xiahou-dun", "taishi-ci", "gan-ning"],
    campaigns: ["yellow-turban"],
  },
};

export { CHARACTERS, ENEMY_GROUPS, EQUIPMENT, ITEMS, TRAITS, YELLOW_TURBAN, HULAO_PREVIEW };
