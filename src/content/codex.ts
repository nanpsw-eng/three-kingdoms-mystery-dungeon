// 도감·업적 view-model (pure; the web screen only renders this).
import type { ContentPack, MetaState, UnlockCondition } from "../run/types.js";
import { CHARACTER_NOTES } from "./notes.js";

export interface CodexCharacter {
  readonly id: string; readonly name: string; readonly kind: "ruler" | "general"; readonly unlocked: boolean;
  readonly characterClass: string; readonly stats: Readonly<Record<string, number>>; readonly skills: readonly string[];
  readonly note: string; readonly hint: string; readonly campaign: string | null;
}
export interface CodexBoss { readonly id: string; readonly name: string; readonly campaign: string; readonly order: number; readonly defeated: boolean; }
export interface CodexAchievement { readonly name: string; readonly earned: boolean; readonly hint: string; }
export interface CodexView {
  readonly characters: readonly CodexCharacter[];
  readonly bosses: readonly CodexBoss[];
  readonly achievements: readonly CodexAchievement[];
  readonly items: readonly { readonly id: string; readonly name: string; readonly seen: boolean }[];
}

function describe(pack: ContentPack, condition: UnlockCondition): string {
  const campaign = (id: string) => pack.campaigns.find((c) => c.id === id)?.name ?? id;
  switch (condition.kind) {
    case "clear-campaign": return campaign(condition.campaignId) + " 평정";
    case "reach-depth": return campaign(condition.campaignId) + " " + condition.depth + "층 도달";
    case "defeat-group": return (pack.enemyGroups.find((g) => g.id === condition.groupId)?.name ?? condition.groupId) + " 격파";
    case "runs": return "원정 " + condition.count + "회";
  }
}

/** Which campaign a boss group belongs to (directly as a floor boss, or as a later phase of one). */
function bossCampaigns(pack: ContentPack): Map<string, { name: string; order: number }> {
  const out = new Map<string, { name: string; order: number }>();
  const groups = new Map(pack.enemyGroups.map((g) => [g.id, g]));
  for (const campaign of pack.campaigns) {
    for (const floor of campaign.floors) {
      for (let id = floor.bossGroupId; id !== undefined && !out.has(id); id = groups.get(id)?.nextPhase) {
        out.set(id, { name: campaign.name, order: campaign.order ?? 99 });
      }
    }
  }
  return out;
}

export function buildCodex(pack: ContentPack, meta: MetaState): CodexView {
  const unlocked = new Set(meta.unlockedCharacters);
  const hints = new Map<string, string>();
  for (const rule of pack.unlocks) if (rule.unlock.characterId !== undefined && !hints.has(rule.unlock.characterId)) hints.set(rule.unlock.characterId, describe(pack, rule.condition));
  for (const group of pack.enemyGroups) if (group.recruit !== undefined && !hints.has(group.recruit.characterId)) hints.set(group.recruit.characterId, group.name + " 격파 후 등용");
  const starting = new Set(pack.startingUnlocks.characters);
  const skillName = (id: string) => pack.skillNames[id] ?? id;
  const campaignOf = (id: string): string | null => {
    for (const rule of pack.unlocks) {
      if (rule.unlock.characterId !== id) continue;
      const c = rule.condition;
      if (c.kind === "clear-campaign" || c.kind === "reach-depth") return pack.campaigns.find((x) => x.id === c.campaignId)?.name ?? null;
    }
    const group = pack.enemyGroups.find((g) => g.recruit?.characterId === id);
    return group === undefined ? null : bossCampaigns(pack).get(group.id)?.name ?? null;
  };
  const characters = pack.characters.map((c) => ({
    id: c.id, name: c.name, kind: c.kind, unlocked: unlocked.has(c.id), characterClass: c.characterClass,
    stats: { ...c.stats }, skills: c.skillIds.map(skillName), note: CHARACTER_NOTES[c.id] ?? "",
    hint: starting.has(c.id) ? "처음부터 함께한다" : hints.get(c.id) ?? "", campaign: starting.has(c.id) ? null : campaignOf(c.id),
  }));
  const defeated = new Set(meta.codex.enemies);
  const where = bossCampaigns(pack);
  const bosses = pack.enemyGroups.filter((g) => g.boss && where.has(g.id))
    .map((g) => ({ id: g.id, name: g.name, campaign: where.get(g.id)!.name, order: where.get(g.id)!.order, defeated: defeated.has(g.id) }))
    .sort((a, b) => a.order - b.order);
  const earned = new Set(meta.achievements);
  const seenAchievements = new Set<string>();
  const achievements: CodexAchievement[] = [];
  for (const rule of pack.unlocks) {
    const name = rule.unlock.achievement;
    if (name === undefined || seenAchievements.has(name)) continue;
    seenAchievements.add(name);
    achievements.push({ name, earned: earned.has(name), hint: describe(pack, rule.condition) });
  }
  const seenItems = new Set(meta.codex.items);
  const items = [...pack.items, ...pack.equipment].map((i) => ({ id: i.id, name: i.name, seen: seenItems.has(i.id) }));
  return { characters, bosses, achievements, items };
}
