import { RENOWN_MAX } from "./balance.js";
/** Fresh meta progression for a new player (DEC-002: only lateral unlocks persist). */
export function initialMeta(content) {
    return {
        version: 1,
        unlockedCharacters: [...content.startingUnlocks.characters],
        unlockedCampaigns: [...content.startingUnlocks.campaigns],
        codex: { characters: [...content.startingUnlocks.characters], enemies: [], items: [] },
        achievements: [],
        runs: 0,
        clears: 0,
        bestDepth: {},
        clearedCampaigns: [],
        renown: {},
    };
}
function union(left, right) {
    return [...new Set([...left, ...right])].sort();
}
/** Applies a finished run to meta progression. Run resources (level, gold, gear...) are never carried. */
export function applyRunToMeta(meta, summary, content) {
    const runs = meta.runs + 1;
    const bestDepth = { ...meta.bestDepth, [summary.campaignId]: Math.max(meta.bestDepth[summary.campaignId] ?? 0, summary.depthReached) };
    // X6: enemy generals recruited during a run stay unlocked.
    let characters = union(meta.unlockedCharacters, summary.recruited);
    let campaigns = union(meta.unlockedCampaigns, []);
    let achievements = union(meta.achievements, []);
    const cleared = new Set(summary.cleared ? [summary.campaignId] : []);
    for (const rule of content.unlocks) {
        const condition = rule.condition;
        const met = (condition.kind === "clear-campaign" && cleared.has(condition.campaignId)) ||
            (condition.kind === "reach-depth" && (bestDepth[condition.campaignId] ?? 0) >= condition.depth) ||
            (condition.kind === "defeat-group" && summary.defeatedGroups.includes(condition.groupId)) ||
            (condition.kind === "runs" && runs >= condition.count);
        if (!met)
            continue;
        if (rule.unlock.characterId !== undefined)
            characters = union(characters, [rule.unlock.characterId]);
        if (rule.unlock.campaignId !== undefined)
            campaigns = union(campaigns, [rule.unlock.campaignId]);
        if (rule.unlock.achievement !== undefined)
            achievements = union(achievements, [rule.unlock.achievement]);
    }
    return {
        version: 1,
        unlockedCharacters: characters,
        unlockedCampaigns: campaigns,
        codex: {
            characters: union(meta.codex.characters, [...summary.recruited, ...characters]),
            enemies: union(meta.codex.enemies, summary.defeatedGroups),
            items: union(meta.codex.items, summary.itemsSeen),
        },
        achievements,
        runs,
        clears: meta.clears + (summary.cleared ? 1 : 0),
        bestDepth,
        clearedCampaigns: union(meta.clearedCampaigns ?? [], [...cleared]),
        renown: summary.cleared
            ? { ...(meta.renown ?? {}), [summary.campaignId]: Math.max(meta.renown?.[summary.campaignId] ?? 0, Math.min(RENOWN_MAX, (summary.renown ?? 0) + 1)) }
            : { ...(meta.renown ?? {}) },
    };
}
//# sourceMappingURL=meta.js.map