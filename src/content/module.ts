import type { SkillDefinition } from "../battle/action.js";
import type {
  CampaignDefinition, CharacterDefinition, EnemyGroupDefinition, EventDefinition, StorySceneDefinition, TraitDefinition, UnlockRule,
} from "../run/types.js";

/** One story campaign (E2…E9) as a self-contained content slice merged into the game pack. */
export interface CampaignModule {
  readonly campaign: CampaignDefinition;
  readonly characters: readonly CharacterDefinition[];
  readonly skills: readonly SkillDefinition[];
  readonly skillNames: Readonly<Record<string, string>>;
  readonly traits: readonly TraitDefinition[];
  readonly enemyGroups: readonly EnemyGroupDefinition[];
  readonly events: readonly EventDefinition[];
  readonly scenes: readonly StorySceneDefinition[];
  readonly unlocks: readonly UnlockRule[];
}

type UniqueTrait = [id: string, owner: string, name: string, description: string, tags: string[], effect: TraitDefinition["effect"]];
export function uniqueTraits(rows: readonly UniqueTrait[]): TraitDefinition[] {
  return rows.map(([id, ownerId, name, description, tags, effect]) => ({ id, ownerId, name, description, tags, effect }));
}
