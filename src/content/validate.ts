// X9 콘텐츠 검증: cross-reference checks for a ContentPack. Returns human-readable problems (empty = valid).
import { knownMechanics } from "../dungeon/mechanics.js";
import type { ContentPack, RunEffect } from "../run/types.js";

export function validateContent(pack: ContentPack): string[] {
  const errors: string[] = [];
  const ids = <T extends { readonly id: string }>(label: string, items: readonly T[]): Set<string> => {
    const seen = new Set<string>();
    for (const item of items) {
      if (seen.has(item.id)) errors.push(`duplicate ${label} id: ${item.id}`);
      seen.add(item.id);
    }
    return seen;
  };
  const characters = ids("character", pack.characters);
  const skills = ids("skill", pack.skills);
  const traits = ids("trait", pack.traits);
  const equipment = ids("equipment", pack.equipment);
  const items = ids("item", pack.items);
  const groups = ids("enemy group", pack.enemyGroups);
  const events = ids("event", pack.events);
  const scenes = ids("scene", pack.scenes ?? []);
  const campaigns = ids("campaign", pack.campaigns);
  const mechanics = new Set(knownMechanics());
  const lootable = (id: string): boolean => items.has(id) || equipment.has(id);
  const need = (ok: boolean, message: string): void => { if (!ok) errors.push(message); };
  const effects = (where: string, list: readonly RunEffect[]): void => {
    for (const effect of list) {
      if (effect.kind === "item") need(items.has(effect.itemId), `${where}: unknown item ${effect.itemId}`);
      if (effect.kind === "equipment") need(equipment.has(effect.equipmentId), `${where}: unknown equipment ${effect.equipmentId}`);
    }
  };

  for (const character of pack.characters) {
    for (const id of character.skillIds) need(skills.has(id), `character ${character.id}: unknown skill ${id}`);
    for (const id of character.traitIds) need(traits.has(id), `character ${character.id}: unknown trait ${id}`);
  }
  for (const trait of pack.traits) {
    const granted = trait.effect.grantSkillId;
    if (granted !== undefined) need(skills.has(granted), `trait ${trait.id}: unknown granted skill ${granted}`);
    if (trait.ownerId !== undefined) need(characters.has(trait.ownerId), `trait ${trait.id}: unknown owner ${trait.ownerId}`);
  }
  for (const skill of pack.skills) need(pack.skillNames[skill.id] !== undefined, `skill ${skill.id}: missing display name`);
  for (const group of pack.enemyGroups) {
    need(group.units.length > 0, `group ${group.id}: no units`);
    const slots = group.units.map((unit) => unit.slot);
    need(new Set(slots).size === slots.length, `group ${group.id}: duplicate formation slot`);
    for (const unit of group.units) for (const id of unit.skillIds ?? []) need(skills.has(id), `group ${group.id}: unknown skill ${id}`);
    for (const entry of group.loot ?? []) need(lootable(entry.id), `group ${group.id}: unknown loot ${entry.id}`);
    if (group.recruit !== undefined) {
      need(characters.has(group.recruit.characterId), `group ${group.id}: unknown recruit ${group.recruit.characterId}`);
      need(group.recruit.chance > 0 && group.recruit.chance <= 1, `group ${group.id}: recruit chance out of range`);
    }
    if (group.duel !== undefined) need(group.units[group.duel.unitIndex] !== undefined, `group ${group.id}: duel unit index out of range`);
    if (group.phaseScene !== undefined) need(scenes.has(group.phaseScene), `group ${group.id}: unknown phase scene ${group.phaseScene}`);
    if (group.nextPhase !== undefined) {
      need(groups.has(group.nextPhase), `group ${group.id}: unknown next phase ${group.nextPhase}`);
      const chain = new Set([group.id]);
      for (let next: string | undefined = group.nextPhase; next !== undefined; next = pack.enemyGroups.find((g) => g.id === next)?.nextPhase) {
        if (chain.has(next)) { errors.push(`group ${group.id}: phase cycle`); break; }
        chain.add(next);
      }
    }
  }
  for (const event of pack.events) {
    need(event.choices.length > 0, `event ${event.id}: no choices`);
    event.choices.forEach((choice, index) => effects(`event ${event.id}#${index}`, choice.effects));
  }
  for (const scene of pack.scenes ?? []) {
    need(scene.lines.length > 0, `scene ${scene.id}: no lines`);
    for (const rulerId of Object.keys(scene.variants ?? {})) need(characters.has(rulerId), `scene ${scene.id}: unknown variant ruler ${rulerId}`);
    (scene.choices ?? []).forEach((choice, index) => effects(`scene ${scene.id}#${index}`, choice.effects));
  }
  for (const campaign of pack.campaigns) {
    const where = `campaign ${campaign.id}`;
    need(campaign.floors.length > 0, `${where}: no floors`);
    campaign.floors.forEach((floor, index) => {
      const at = `${where} F${floor.depth}`;
      need(floor.depth === index + 1, `${at}: depth out of sequence`);
      need(floor.enemyGroups.length > 0, `${at}: no enemy groups`);
      for (const entry of floor.enemyGroups) need(groups.has(entry.id), `${at}: unknown group ${entry.id}`);
      if (floor.bossGroupId !== undefined) need(groups.has(floor.bossGroupId), `${at}: unknown boss ${floor.bossGroupId}`);
      if (floor.gateDefenderGroupId !== undefined) need(groups.has(floor.gateDefenderGroupId), `${at}: unknown gate defender ${floor.gateDefenderGroupId}`);
      for (const spec of floor.objects ?? []) {
        for (const entry of spec.pool) {
          if (spec.kind === "item") need(lootable(entry.id), `${at}: unknown item ${entry.id}`);
          if (spec.kind === "event") need(events.has(entry.id), `${at}: unknown event ${entry.id}`);
          if (spec.kind === "recruit") need(entry.id === "random" || characters.has(entry.id), `${at}: unknown recruit ${entry.id}`);
        }
      }
      for (const mechanic of floor.mechanics ?? []) need(mechanics.has(mechanic.type), `${at}: unknown mechanic ${mechanic.type}`);
    });
    const last = campaign.floors[campaign.floors.length - 1];
    if (last !== undefined) need(last.bossGroupId !== undefined, `${where}: final floor has no boss`);
    for (const entry of campaign.shopItems) need(items.has(entry.id), `${where}: unknown shop item ${entry.id}`);
    for (const entry of campaign.shopEquipment) need(equipment.has(entry.id), `${where}: unknown shop equipment ${entry.id}`);
    const sceneRefs = [campaign.scenes?.intro, campaign.scenes?.outro, ...Object.values(campaign.scenes?.floorEnter ?? {}), ...Object.values(campaign.scenes?.bossDefeated ?? {})];
    for (const id of sceneRefs) if (id !== undefined) need(scenes.has(id), `${where}: unknown scene ${id}`);
    for (const id of Object.keys(campaign.scenes?.bossDefeated ?? {})) need(groups.has(id), `${where}: bossDefeated key is not a group: ${id}`);
    for (const depth of Object.keys(campaign.scenes?.floorEnter ?? {})) need(campaign.floors.some((floor) => floor.depth === Number(depth)), `${where}: floorEnter depth ${depth} missing`);
  }
  for (const rule of pack.unlocks) {
    const condition = rule.condition;
    if (condition.kind === "clear-campaign" || condition.kind === "reach-depth") need(campaigns.has(condition.campaignId), `unlock ${rule.id}: unknown campaign ${condition.campaignId}`);
    if (condition.kind === "defeat-group") need(groups.has(condition.groupId), `unlock ${rule.id}: unknown group ${condition.groupId}`);
    if (rule.unlock.characterId !== undefined) need(characters.has(rule.unlock.characterId), `unlock ${rule.id}: unknown character ${rule.unlock.characterId}`);
    if (rule.unlock.campaignId !== undefined) need(campaigns.has(rule.unlock.campaignId), `unlock ${rule.id}: unknown campaign ${rule.unlock.campaignId}`);
  }
  for (const id of pack.startingUnlocks.characters) need(characters.has(id), `starting unlock: unknown character ${id}`);
  for (const id of pack.startingUnlocks.campaigns) need(campaigns.has(id), `starting unlock: unknown campaign ${id}`);
  return errors;
}
