#!/usr/bin/env node
// Headless Run simulation (P13). Usage: node scripts/simulate.mjs [runs=100] [campaign=yellow-turban] [mode=smart]
// Output: JSON metrics on stdout. Autopilot results are OBSERVATIONAL — not human balance validation.
import { MVP_CONTENT, initialMeta, runAutopilot } from "../dist/index.js";

const runs = Number(process.argv[2] ?? 100);
const campaignId = process.argv[3] ?? "yellow-turban";
const battleMode = process.argv[4] ?? "smart";
const meta = { ...initialMeta(MVP_CONTENT), unlockedCampaigns: ["yellow-turban", "hulao-gate"] };
const rulers = ["liu-bei", "cao-cao", "sun-quan"];
const generals = MVP_CONTENT.startingUnlocks.characters.filter((id) => !rulers.includes(id));
const PAIRS = generals.flatMap((a, i) => generals.slice(i + 1).map((b) => [a, b]));

const totals = { outcomes: {}, failDepth: {}, failCause: {}, depthReached: {}, byRuler: {} };
const sums = { level: 0, turns: 0, battles: 0, recruits: 0, surprisesAlly: 0, surprisesEnemy: 0, gatesOpened: 0, retreats: 0, traitPicks: 0, itemsUsed: 0, secretsFound: 0, reinforcements: 0 };
const started = Date.now();
for (let index = 0; index < runs; index += 1) {
  // Every ruler is crossed with every general pair (no modular confounding).
  const rulerId = rulers[index % rulers.length];
  const pair = PAIRS[Math.floor(index / rulers.length) % PAIRS.length];
  const generalIds = [pair[0], pair[1]];
  const result = runAutopilot(MVP_CONTENT, {
    seed: "sim-" + index, campaignId, rulerId, generalIds, meta, battleMode,
    onEvent: (event) => {
      if (event.type === "battle-started") { if (event.encounter.surprise === "ally") sums.surprisesAlly++; if (event.encounter.surprise === "enemy") sums.surprisesEnemy++; }
      if (event.type === "battle-ended" && event.outcome === "retreat") sums.retreats++;
      if (event.type === "recruited") sums.recruits++;
      if (event.type === "trait-chosen") sums.traitPicks++;
      if (event.type === "item-used") sums.itemsUsed++;
      if (event.type === "dungeon" && event.event.type === "gate-opened") sums.gatesOpened++;
      if (event.type === "dungeon" && event.event.type === "secret-found") sums.secretsFound++;
      if (event.type === "dungeon" && event.event.type === "reinforcement") sums.reinforcements++;
    },
  });
  const s = result.summary;
  totals.outcomes[result.outcome] = (totals.outcomes[result.outcome] ?? 0) + 1;
  totals.depthReached[s.depthReached] = (totals.depthReached[s.depthReached] ?? 0) + 1;
  if (result.outcome === "failed") {
    totals.failDepth[s.depthReached] = (totals.failDepth[s.depthReached] ?? 0) + 1;
    totals.failCause[result.failCause] = (totals.failCause[result.failCause] ?? 0) + 1;
  }
  const r = (totals.byRuler[rulerId] ??= { runs: 0, cleared: 0 });
  r.runs++; if (result.outcome === "cleared") r.cleared++;
  for (const id of generalIds) { const g = ((totals.byGeneral ??= {})[id] ??= { runs: 0, cleared: 0 }); g.runs++; if (result.outcome === "cleared") g.cleared++; }
  sums.level += s.level; sums.turns += s.turns; sums.battles += s.battles;
}
const avg = Object.fromEntries(Object.entries(sums).map(([key, value]) => [key, Number((value / runs).toFixed(2))]));
console.log(JSON.stringify({ campaignId, runs, battleMode, clearRate: (totals.outcomes.cleared ?? 0) / runs, ...totals, perRunAverage: avg, ms: Date.now() - started }, null, 2));
