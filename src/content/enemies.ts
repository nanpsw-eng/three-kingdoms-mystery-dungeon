import type { SkillDefinition } from "../battle/action.js";
import type { FormationSlot } from "../battle/formation.js";
import type { EnemyGroupDefinition, EnemyUnitDefinition } from "../run/types.js";
import { active, enemyOne, enemyUpTo, physical, shift, status, strategy, ultimate } from "./skills.js";

export const ENEMY_SKILLS: readonly SkillDefinition[] = [
  active("yt-stab", 30, enemyOne("front"), [physical(30)]),
  active("yt-rush", 30, enemyOne(), [physical(28)]),
  active("yt-volley", 35, enemyUpTo(2), [physical(24, { modifier: 0.8 })]),
  active("yt-curse", 35, enemyOne(), [strategy(22), status("poison", 3, { magnitude: 4 })]),
  active("yt-chant", 40, enemyOne(), [status("confusion", 1)]),
  active("bao-thunder", 40, enemyUpTo(3), [strategy(32, { modifier: 0.75 })]),
  active("bao-sorcery", 40, enemyOne(), [status("confusion", 1), status("defense-down", 2, { magnitude: 0.2 })]),
  active("liang-hex", 40, enemyUpTo(3), [strategy(26, { modifier: 0.75 }), status("poison", 3, { stacks: 2, magnitude: 4 })]),
  active("liang-wind", 35, enemyUpTo(2), [shift(30)]),
  active("jiao-heaven", 40, enemyUpTo(5), [strategy(36, { modifier: 0.7 })]),
  active("jiao-talisman", 35, enemyOne(), [status("stun", 1), strategy(24)]),
  ultimate("jiao-yellow-sky", enemyUpTo(5), [strategy(50, { modifier: 0.75 }), status("burn", 2, { stacks: 2, magnitude: 5 })]),
  active("dong-halberd", 35, enemyOne("front"), [physical(36)]),
  active("xiliang-charge", 30, enemyOne(), [physical(32), shift(15)]),
  active("hua-cleave", 40, enemyUpTo(2, "front"), [physical(38, { modifier: 0.85 })]),
  ultimate("hua-challenge", enemyOne(), [physical(55, { critChance: 0.3 }), status("stun", 1)]),
];

export const ENEMY_SKILL_NAMES: Readonly<Record<string, string>> = {
  "yt-stab": "찌르기", "yt-rush": "돌격", "yt-volley": "난사", "yt-curse": "저주", "yt-chant": "요술",
  "bao-thunder": "뇌공", "bao-sorcery": "환술", "liang-hex": "독무", "liang-wind": "광풍",
  "jiao-heaven": "천공", "jiao-talisman": "부적", "jiao-yellow-sky": "황천당립",
  "dong-halberd": "극격", "xiliang-charge": "서량 돌격", "hua-cleave": "참격", "hua-challenge": "도전",
};

type Arch = { name: string; stats: [number, number, number, number, number]; reach: "melee" | "ranged"; skills: string[] };
const ARCH: Record<string, Arch> = {
  spear: { name: "황건 창병", stats: [72, 82, 74, 90, 60], reach: "melee", skills: ["yt-stab"] },
  archer: { name: "황건 궁병", stats: [60, 80, 64, 94, 62], reach: "ranged", skills: ["yt-volley"] },
  raider: { name: "황건 기병", stats: [74, 86, 70, 104, 58], reach: "melee", skills: ["yt-rush"] },
  sorcerer: { name: "황건 술사", stats: [62, 60, 66, 92, 92], reach: "ranged", skills: ["yt-curse"] },
  chanter: { name: "태평도 신도", stats: [66, 62, 70, 96, 96], reach: "ranged", skills: ["yt-chant", "yt-curse"] },
  dongInf: { name: "동탁군 극병", stats: [96, 106, 98, 92, 70], reach: "melee", skills: ["dong-halberd"] },
  xiliang: { name: "서량 기병", stats: [92, 108, 90, 112, 66], reach: "melee", skills: ["xiliang-charge"] },
  dongArcher: { name: "동탁군 궁병", stats: [82, 104, 84, 100, 72], reach: "ranged", skills: ["yt-volley"] },
  gateGuard: { name: "관문 수비대", stats: [130, 104, 130, 84, 70], reach: "melee", skills: ["dong-halberd"] },
};

function unit(key: keyof typeof ARCH, slot: FormationSlot, scale: number): EnemyUnitDefinition {
  const arch = ARCH[key]!;
  const [maxHp, atk, def, spd, int] = arch.stats;
  return {
    name: arch.name, reach: arch.reach, skillIds: arch.skills, slot,
    stats: { maxHp: Math.round(maxHp * scale), atk: Math.round(atk * scale), def: Math.round(def * scale), spd: Math.round(spd * (1 + (scale - 1) * 0.3)), int: Math.round(int * scale) },
  };
}

function boss(name: string, stats: [number, number, number, number, number], reach: "melee" | "ranged", skills: string[], slot: FormationSlot): EnemyUnitDefinition {
  const [maxHp, atk, def, spd, int] = stats;
  return { name, stats: { maxHp, atk, def, spd, int }, reach, skillIds: skills, slot };
}

const T1 = 1;
const T2 = 1.3;
const T3 = 1.6;
const HULAO = 1.15;

export const ENEMY_GROUPS: readonly EnemyGroupDefinition[] = [
  // Yellow Turban tier 1 (1-4F)
  { id: "yt-rabble", name: "황건 잡병", exp: 12, gold: 8, units: [unit("spear", "front-left", T1), unit("spear", "front-right", T1), unit("archer", "rear-left", T1)], loot: [{ id: "bun", weight: 3 }, { id: "herb", weight: 2 }], lootChance: 0.3 },
  { id: "yt-band", name: "황건 무리", exp: 14, gold: 10, units: [unit("spear", "front-center", T1), unit("raider", "front-left", T1), unit("sorcerer", "rear-right", T1)], loot: [{ id: "herb", weight: 2 }, { id: "iron-sword", weight: 1 }], lootChance: 0.3 },
  { id: "yt-raiders", name: "황건 약탈대", exp: 13, gold: 12, units: [unit("raider", "front-left", T1), unit("raider", "front-right", T1)], loot: [{ id: "bun", weight: 2 }, { id: "leather-armor", weight: 1 }], lootChance: 0.3 },
  // tier 2 (6-9F)
  { id: "yt-elite", name: "황건 정예", exp: 26, gold: 18, units: [unit("spear", "front-left", T2), unit("spear", "front-right", T2), unit("archer", "rear-left", T2), unit("sorcerer", "rear-right", T2)], loot: [{ id: "medicine", weight: 2 }, { id: "long-spear", weight: 1 }, { id: "scale-armor", weight: 1 }], lootChance: 0.35 },
  { id: "yt-cult", name: "태평도 결사", exp: 24, gold: 16, units: [unit("spear", "front-center", T2), unit("chanter", "rear-left", T2), unit("sorcerer", "rear-right", T2)], loot: [{ id: "herb", weight: 2 }, { id: "war-fan", weight: 1 }, { id: "silk-robe", weight: 1 }], lootChance: 0.35 },
  { id: "yt-warband", name: "황건 전투대", exp: 25, gold: 20, units: [unit("raider", "front-left", T2), unit("spear", "front-center", T2), unit("raider", "front-right", T2)], loot: [{ id: "bun", weight: 2 }, { id: "horn-bow", weight: 1 }, { id: "fire-pot", weight: 1 }], lootChance: 0.35 },
  // tier 3 (11-14F)
  { id: "yt-vanguard", name: "황건 선봉대", exp: 40, gold: 28, units: [unit("spear", "front-left", T3), unit("raider", "front-center", T3), unit("spear", "front-right", T3), unit("archer", "rear-left", T3)], loot: [{ id: "medicine", weight: 2 }, { id: "ancient-blade", weight: 1 }, { id: "tiger-tally", weight: 1 }], lootChance: 0.4 },
  { id: "yt-zealots", name: "태평도 광신도", exp: 42, gold: 26, units: [unit("spear", "front-center", T3), unit("chanter", "rear-left", T3), unit("chanter", "rear-right", T3), unit("sorcerer", "front-left", T3)], loot: [{ id: "treatment-kit", weight: 1 }, { id: "jade-seal", weight: 1 }, { id: "elixir", weight: 2 }], lootChance: 0.4 },
  { id: "yt-host", name: "황건 대군", exp: 44, gold: 30, units: [unit("spear", "front-left", T3), unit("spear", "front-right", T3), unit("raider", "front-center", T3), unit("archer", "rear-left", T3), unit("sorcerer", "rear-right", T3)], loot: [{ id: "rice-sack", weight: 2 }, { id: "dragon-armor", weight: 1 }], lootChance: 0.4 },
  // Yellow Turban bosses
  { id: "boss-zhang-bao", name: "지공장군 장보", boss: true, exp: 70, gold: 60, units: [boss("장보", [300, 100, 96, 100, 118], "ranged", ["bao-thunder", "bao-sorcery"], "rear-left"), unit("spear", "front-left", T1 * 1.1), unit("spear", "front-right", T1 * 1.1)], loot: [{ id: "jade-seal", weight: 1 }], lootChance: 1 },
  { id: "boss-zhang-liang", name: "인공장군 장량", boss: true, exp: 130, gold: 100, units: [boss("장량", [440, 120, 116, 104, 138], "ranged", ["liang-hex", "liang-wind"], "rear-left"), unit("spear", "front-left", T2), unit("chanter", "rear-right", T2), unit("raider", "front-right", T2)], loot: [{ id: "dragon-armor", weight: 1 }], lootChance: 1 },
  { id: "boss-zhang-jiao", name: "천공장군 장각", boss: true, exp: 0, gold: 0, units: [boss("장각", [640, 130, 130, 108, 160], "ranged", ["jiao-heaven", "jiao-talisman", "jiao-yellow-sky"], "rear-left"), unit("spear", "front-left", T3), unit("spear", "front-right", T3), unit("chanter", "rear-right", T3), unit("raider", "front-center", T3)] },
  // Hulao Gate preview
  { id: "dong-soldiers", name: "동탁군 보병", exp: 22, gold: 16, units: [unit("dongInf", "front-left", HULAO), unit("dongInf", "front-right", HULAO), unit("dongArcher", "rear-left", HULAO)], loot: [{ id: "medicine", weight: 1 }, { id: "scale-armor", weight: 1 }], lootChance: 0.35 },
  { id: "xiliang-cavalry", name: "서량 철기", exp: 24, gold: 18, units: [unit("xiliang", "front-left", HULAO), unit("xiliang", "front-center", HULAO), unit("xiliang", "front-right", HULAO)], loot: [{ id: "swift-boots", weight: 1 }, { id: "herb", weight: 2 }], lootChance: 0.35 },
  { id: "dong-gate-guard", name: "호로관 수비대", exp: 30, gold: 24, units: [unit("gateGuard", "front-left", HULAO), unit("gateGuard", "front-right", HULAO), unit("dongArcher", "rear-left", HULAO)], loot: [{ id: "tiger-tally", weight: 1 }], lootChance: 0.5 },
  { id: "boss-hua-xiong", name: "효기교위 화웅", boss: true, exp: 0, gold: 0, units: [boss("화웅", [520, 140, 126, 106, 90], "melee", ["hua-cleave", "hua-challenge"], "front-center"), unit("dongInf", "front-left", HULAO), unit("dongArcher", "rear-left", HULAO), unit("dongArcher", "rear-right", HULAO)] },
];
