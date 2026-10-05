// Representative 5v5 battle fixture for Battle Core review.
// TEST FIXTURE ONLY: stats come from CHARACTER_ROSTER_MVP.md, powers from BALANCE_SEED.md ranges.
// Skill names/effects are stand-ins exercising every implemented effect type; they are NOT canonical content.

const one = (team, access = "any", state) =>
  state === undefined ? { team, access, minTargets: 1, maxTargets: 1 } : { team, access, minTargets: 1, maxTargets: 1, state };
const upTo = (team, access, max) => ({ team, access, minTargets: 1, maxTargets: max });
const self = { team: "self", access: "self", minTargets: 1, maxTargets: 1 };

export const REPRESENTATIVE_SKILLS = [
  // ally
  { id: "rally", kind: "active", energyCost: 30, targeting: one("ally"), effects: [
    { type: "heal", recipient: "targets", baseHeal: 18 },
    { type: "energy", recipient: "targets", amount: 15 } ] },
  { id: "dragon-slash", kind: "active", energyCost: 30, targeting: one("enemy", "front"), effects: [
    { type: "damage", recipient: "targets", kind: "physical", power: 36 } ] },
  { id: "war-god", kind: "ultimate", energyCost: 100, targeting: upTo("enemy", "front", 3), effects: [
    { type: "damage", recipient: "targets", kind: "physical", power: 48, modifier: 0.8 } ] },
  { id: "roar", kind: "active", energyCost: 30, targeting: upTo("enemy", "front", 3), effects: [
    { type: "status", recipient: "targets", statusType: "taunt", durationRounds: 2 } ] },
  { id: "bridge-stand", kind: "active", energyCost: 40, targeting: one("enemy", "front"), effects: [
    { type: "damage", recipient: "targets", kind: "physical", power: 30 },
    { type: "status", recipient: "targets", statusType: "stun", durationRounds: 1 } ] },
  { id: "hundred-pace", kind: "active", energyCost: 35, targeting: one("enemy"), effects: [
    { type: "damage", recipient: "targets", kind: "physical", power: 38, critChance: 0.25 } ] },
  { id: "salve", kind: "active", energyCost: 25, targeting: one("ally"), effects: [
    { type: "heal", recipient: "targets", baseHeal: 30 } ] },
  { id: "detox", kind: "active", energyCost: 20, targeting: one("ally"), effects: [
    { type: "cleanse", recipient: "targets", statusTypes: ["poison", "burn", "bleed", "confusion", "defense-down"] } ] },
  { id: "green-sack", kind: "ultimate", energyCost: 100, targeting: one("ally", "any", "ko"), effects: [
    { type: "revive", recipient: "targets", hpRatio: 0.4 } ] },
  // enemy
  { id: "iron-wall", kind: "active", energyCost: 30, targeting: one("enemy", "front"), effects: [
    { type: "damage", recipient: "targets", kind: "physical", power: 32 },
    { type: "status", recipient: "targets", statusType: "defense-down", durationRounds: 2, magnitude: 0.2 } ] },
  { id: "treachery", kind: "active", energyCost: 35, targeting: one("enemy"), effects: [
    { type: "status", recipient: "targets", statusType: "confusion", durationRounds: 1 } ] },
  { id: "breakthrough", kind: "active", energyCost: 30, targeting: one("enemy"), effects: [
    { type: "damage", recipient: "targets", kind: "physical", power: 34 } ] },
  { id: "poison-plot", kind: "active", energyCost: 30, targeting: one("enemy"), effects: [
    { type: "damage", recipient: "targets", kind: "strategy", power: 20 },
    { type: "status", recipient: "targets", statusType: "poison", durationRounds: 3, stacks: 2, magnitude: 4 } ] },
  { id: "fire-plot", kind: "active", energyCost: 35, targeting: upTo("enemy", "any", 2), effects: [
    { type: "damage", recipient: "targets", kind: "strategy", power: 32, modifier: 0.8 },
    { type: "status", recipient: "targets", statusType: "burn", durationRounds: 2, magnitude: 4 } ] },
  { id: "eight-gates", kind: "active", energyCost: 30, targeting: one("enemy"), effects: [
    { type: "timeline-shift", recipient: "targets", amount: 30 },
    { type: "status", recipient: "targets", statusType: "timeline-delay", durationRounds: 1, magnitude: 15 } ] },
  { id: "hero-rush", kind: "ultimate", energyCost: 100, targeting: upTo("enemy", "any", 2), effects: [
    { type: "damage", recipient: "targets", kind: "physical", power: 44, modifier: 0.85 },
    { type: "timeline-shift", recipient: "actor", amount: -20 } ] },
  { id: "rear-swap", kind: "active", energyCost: 10, targeting: one("ally"), effects: [
    { type: "formation-swap", recipient: "targets" } ] },
];

function p(id, side, slot, [maxHp, atk, def, spd, int], reach, skillIds) {
  return { unit: { id, side, stats: { maxHp, atk, def, spd, int } }, slot, basicAttackReach: reach, skillIds };
}

export const REPRESENTATIVE_PARTICIPANTS = [
  p("liu-bei", "ally", "front-left", [103, 92, 98, 98, 108], "melee", ["rally"]),
  p("guan-yu", "ally", "front-center", [112, 116, 108, 98, 90], "melee", ["dragon-slash", "war-god"]),
  p("zhang-fei", "ally", "front-right", [120, 112, 118, 86, 78], "melee", ["roar", "bridge-stand"]),
  p("huang-zhong", "ally", "rear-left", [94, 113, 90, 104, 88], "ranged", ["hundred-pace"]),
  p("hua-tuo", "ally", "rear-right", [96, 70, 90, 100, 120], "ranged", ["salve", "detox", "green-sack"]),
  p("xiahou-dun", "enemy", "front-left", [118, 108, 117, 88, 82], "melee", ["iron-wall"]),
  p("cao-cao", "enemy", "front-center", [100, 103, 96, 105, 112], "melee", ["treachery", "rear-swap"]),
  p("zhang-liao", "enemy", "front-right", [106, 111, 103, 114, 96], "melee", ["breakthrough", "hero-rush"]),
  p("jia-xu", "enemy", "rear-left", [90, 80, 88, 101, 118], "ranged", ["poison-plot"]),
  p("zhuge-liang", "enemy", "rear-right", [88, 78, 84, 102, 120], "ranged", ["fire-plot", "eight-gates"]),
];

export function representativeDefinition(seed) {
  return { seed, skills: REPRESENTATIVE_SKILLS, participants: REPRESENTATIVE_PARTICIPANTS };
}
