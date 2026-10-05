#!/usr/bin/env node
// S5 gate: play the whole timeline from a fresh save with the autopilot, carrying meta progression between runs.
// Usage: node scripts/campaign-chain.mjs [maxAttemptsPerCampaign=40] [seedPrefix=chain]
// Output: JSON (attempts per campaign, unlock timeline, ending reached). Autopilot results are OBSERVATIONAL.
import { MVP_CONTENT, applyRunToMeta, initialMeta, runAutopilot } from "../dist/index.js";

const maxAttempts = Number(process.argv[2] ?? 40);
const prefix = process.argv[3] ?? "chain";
const ordered = [...MVP_CONTENT.campaigns].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
const byId = new Map(MVP_CONTENT.characters.map((c) => [c.id, c]));
const power = (id) => { const s = byId.get(id).stats; return s.maxHp + s.atk + s.def + s.spd + s.int; };
let meta = initialMeta(MVP_CONTENT);
const report = { campaigns: [], totalRuns: 0, endingReached: false };
const started = Date.now();
for (const campaign of ordered) {
  const entry = { id: campaign.id, unlocked: meta.unlockedCampaigns.includes(campaign.id), attempts: 0, cleared: false, unlockedCharactersAfter: 0 };
  report.campaigns.push(entry);
  if (!entry.unlocked) break;
  for (let attempt = 0; attempt < maxAttempts && !entry.cleared; attempt += 1) {
    const rulers = ["liu-bei", "cao-cao", "sun-quan"].filter((id) => meta.unlockedCharacters.includes(id));
    // A simple player: rotate rulers, take the two strongest unlocked generals with some rotation.
    const generals = MVP_CONTENT.characters.filter((c) => c.kind === "general" && meta.unlockedCharacters.includes(c.id)).map((c) => c.id).sort((a, b) => power(b) - power(a));
    const pick = [generals[attempt % 3], generals[(attempt % 3) + 1 + (attempt % 2)]].filter(Boolean);
    const result = runAutopilot(MVP_CONTENT, { seed: `${prefix}-${campaign.id}-${attempt}`, campaignId: campaign.id, rulerId: rulers[attempt % rulers.length], generalIds: pick, meta });
    meta = applyRunToMeta(meta, result.summary, MVP_CONTENT);
    entry.attempts += 1;
    report.totalRuns += 1;
    entry.cleared = result.outcome === "cleared";
  }
  entry.unlockedCharactersAfter = meta.unlockedCharacters.length;
  if (!entry.cleared) break;
}
report.endingReached = report.campaigns.length === ordered.length && report.campaigns.every((c) => c.cleared);
report.finalMeta = { unlockedCharacters: meta.unlockedCharacters.length, totalCharacters: MVP_CONTENT.characters.length, achievements: meta.achievements, siMaYiUnlocked: meta.unlockedCharacters.includes("sima-yi") };
report.ms = Date.now() - started;
console.log(JSON.stringify(report, null, 2));
