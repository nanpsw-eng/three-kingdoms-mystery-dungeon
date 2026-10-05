// E6 형주·익주 (211–219) — 낙봉파·가맹관 마초 → 정군산 하후연 → 번성 수공(수엄칠군) → 조인. 연의 기준.
import type { FloorPlan, StorySceneDefinition } from "../../run/types.js";
import type { Weighted } from "../../dungeon/floor.js";
import { BASIC_TRAPS, ITEM_POOL_EARLY, ITEM_POOL_LATE, ITEM_POOL_MID, MODIFIERS, objects } from "../campaigns.js";
import { defineCharacters } from "../characters.js";
import { boss, scaledUnit } from "../enemies.js";
import type { CampaignModule } from "../module.js";
import { uniqueTraits } from "../module.js";
import { active, allyUpTo, enemyOne, enemyUpTo, energy, extraAction, heal, physical, self, shift, status, strategy, ultimate } from "../skills.js";

const ID = "jing-yi";

const characters = defineCharacters([
  ["ma-chao", "마초", "general", "cavalry", ["돌파", "공격", "광역"], [110, 120, 98, 116, 70], ["mc-spear", "mc-charge", "mc-xiliang"], ["t-mc-jinma", "t-mc-revenge", "t-mc-rider"]],
  ["wei-yan", "위연", "general", "infantry", ["공격", "기습"], [114, 114, 104, 98, 80], ["wy-blade", "wy-ziwu", "wy-vanguard"], ["t-wy-bold", "t-wy-ziwu", "t-wy-guard"]],
  ["fa-zheng", "법정", "general", "strategist", ["제어", "디버프", "지휘"], [88, 74, 86, 102, 120], ["fz-scheme", "fz-signal", "fz-dingjun"], ["t-fz-retribution", "t-fz-plan", "t-fz-insight"]],
  ["xu-huang", "서황", "general", "infantry", ["돌파", "탱커"], [116, 112, 112, 92, 80], ["xh-axe", "xh-encircle", "xh-zhouyafu"], ["t-xh-zhouyafu", "t-xh-discipline", "t-xh-axe"]],
  ["xiahou-yuan", "하후연", "general", "archer", ["기습", "연사", "속도"], [100, 112, 92, 118, 80], ["xy2-raid", "xy2-volley", "xy2-three-days"], ["t-xy2-swift", "t-xy2-bow", "t-xy2-rash"]],
]);

const skills = [
  active("mc-spear", 35, enemyOne(), [physical(40)]),
  active("mc-charge", 35, enemyUpTo(2, "front"), [physical(32, { modifier: 0.85 }), shift(15)]),
  ultimate("mc-xiliang", enemyUpTo(3), [physical(48, { modifier: 0.8 })]),
  active("wy-blade", 35, enemyOne("front"), [physical(38)]),
  active("wy-ziwu", 30, self, [extraAction("actor")]),
  ultimate("wy-vanguard", enemyUpTo(3), [physical(46, { modifier: 0.8 })]),
  active("fz-scheme", 30, enemyOne(), [strategy(26), status("defense-down", 2, { magnitude: 0.2 })]),
  active("fz-signal", 35, allyUpTo(2), [energy(20)]),
  ultimate("fz-dingjun", enemyUpTo(5), [strategy(38, { modifier: 0.72 }), status("timeline-delay", 1, { magnitude: 20 })]),
  active("xh-axe", 35, enemyOne("front"), [physical(38)]),
  active("xh-encircle", 30, enemyUpTo(3, "front"), [status("taunt", 2), heal(12, "actor")]),
  ultimate("xh-zhouyafu", enemyUpTo(3), [physical(46, { modifier: 0.8 }), status("defense-down", 2, { magnitude: 0.2 })]),
  active("xy2-raid", 30, enemyOne(), [physical(34), shift(15)]),
  active("xy2-volley", 35, enemyUpTo(2), [physical(28, { modifier: 0.85 })]),
  ultimate("xy2-three-days", enemyUpTo(5), [physical(38, { modifier: 0.7 })]),
  // enemies
  active("pang-de-coffin", 40, enemyOne(), [physical(44, { critChance: 0.2 })]),
  active("yu-jin-order", 35, enemyUpTo(3), [physical(26, { modifier: 0.8 })]),
  active("cao-ren-e-wall", 30, enemyUpTo(3, "front"), [status("taunt", 2)]),
  ultimate("cao-ren-e-sortie", enemyUpTo(3), [physical(44, { modifier: 0.8 })]),
  active("ambush-strike", 30, enemyOne(), [physical(30, { critChance: 0.2 })]),
  active("xy2-e-raid", 30, enemyOne(), [physical(34), shift(15)]),
];

const skillNames: Record<string, string> = {
  "mc-spear": "금마창", "mc-charge": "서량 철기", "mc-xiliang": "신위천장군",
  "wy-blade": "대도", "wy-ziwu": "자오곡 기습", "wy-vanguard": "한중 선봉",
  "fz-scheme": "기모", "fz-signal": "고각 신호", "fz-dingjun": "정군산 계책",
  "xh-axe": "대부", "xh-encircle": "장진", "xh-zhouyafu": "주아부의 풍모",
  "xy2-raid": "급습", "xy2-volley": "연사", "xy2-three-days": "삼일오백 육일천",
  "pang-de-coffin": "관을 메고", "yu-jin-order": "엄정한 군율", "cao-ren-e-wall": "번성 사수", "cao-ren-e-sortie": "결사 돌격", "ambush-strike": "복병", "xy2-e-raid": "급습",
};

const traits = uniqueTraits([
  ["t-mc-jinma", "ma-chao", "금마초", "ATK +12%", ["공격"], { statPercent: { atk: 0.12 } }],
  ["t-mc-revenge", "ma-chao", "복수심", "전투 시작 기력 +25", ["돌파"], { entryEnergy: 25 }],
  ["t-mc-rider", "ma-chao", "서량 기마술", "SPD +8%", ["속도"], { statPercent: { spd: 0.08 } }],
  ["t-wy-bold", "wei-yan", "호담", "ATK +12%", ["공격"], { statPercent: { atk: 0.12 } }],
  ["t-wy-ziwu", "wei-yan", "자오곡", "SPD +8%", ["기습", "속도"], { statPercent: { spd: 0.08 } }],
  ["t-wy-guard", "wei-yan", "한중 태수", "HP/DEF +8%", ["생존"], { statPercent: { maxHp: 0.08, def: 0.08 } }],
  ["t-fz-retribution", "fa-zheng", "은원", "INT +12%", ["디버프"], { statPercent: { int: 0.12 } }],
  ["t-fz-plan", "fa-zheng", "기책", "전투 시작 기력 +25", ["지휘"], { entryEnergy: 25 }],
  ["t-fz-insight", "fa-zheng", "통찰", "SPD +8%", ["제어", "속도"], { statPercent: { spd: 0.08 } }],
  ["t-xh-zhouyafu", "xu-huang", "주아부", "DEF +12%", ["탱커"], { statPercent: { def: 0.12 } }],
  ["t-xh-discipline", "xu-huang", "군율", "HP +12%", ["생존"], { statPercent: { maxHp: 0.12 } }],
  ["t-xh-axe", "xu-huang", "대부", "ATK +10%", ["돌파"], { statPercent: { atk: 0.1 } }],
  ["t-xy2-swift", "xiahou-yuan", "신속", "SPD +10%", ["속도", "기습"], { statPercent: { spd: 0.1 } }],
  ["t-xy2-bow", "xiahou-yuan", "궁기", "ATK +10%", ["연사"], { statPercent: { atk: 0.1 } }],
  ["t-xy2-rash", "xiahou-yuan", "백지장군", "ATK +15%, DEF -8%", ["공격"], { statPercent: { atk: 0.15, def: -0.08 } }],
]);

type Stats = readonly [number, number, number, number, number];
const A: Record<string, { name: string; stats: Stats; reach: "melee" | "ranged"; skills: string[] }> = {
  shu: { name: "유장군 보병", stats: [76, 86, 78, 88, 60], reach: "melee", skills: ["yt-stab"] },
  xiliang: { name: "서량 철기", stats: [78, 94, 72, 110, 56], reach: "melee", skills: ["xiliang-charge"] },
  wei: { name: "위군 정예", stats: [84, 92, 86, 90, 60], reach: "melee", skills: ["dong-halberd"] },
  archer: { name: "위군 궁병", stats: [66, 90, 66, 94, 62], reach: "ranged", skills: ["hb-crossbow"] },
  ambusher: { name: "복병", stats: [72, 94, 70, 108, 60], reach: "melee", skills: ["ambush-strike"] },
  seven: { name: "칠군 병사", stats: [82, 88, 84, 86, 60], reach: "melee", skills: ["dong-halberd"] },
};
const u = (key: keyof typeof A, slot: Parameters<typeof scaledUnit>[4], scale: number) => scaledUnit(A[key]!.name, A[key]!.stats, A[key]!.reach, A[key]!.skills, slot, scale);
const T1 = 0.88;
const T2 = 1.26;
const T3 = 1.7;

const enemyGroups = [
  { id: "jy-shu-guard", name: "익주 수비대", exp: 13, gold: 9, units: [u("shu", "front-left", T1), u("shu", "front-right", T1)], loot: [{ id: "bun", weight: 2 }, { id: "herb", weight: 2 }], lootChance: 0.3 },
  { id: "jy-shu-archers", name: "익주 궁병대", exp: 14, gold: 10, units: [u("shu", "front-center", T1), u("archer", "rear-left", T1), u("archer", "rear-right", T1)], loot: [{ id: "herb", weight: 2 }, { id: "horn-bow", weight: 1 }], lootChance: 0.3 },
  { id: "jy-xiliang", name: "서량 기병", exp: 15, gold: 12, units: [u("xiliang", "front-left", T1), u("xiliang", "front-right", T1)], loot: [{ id: "swift-boots", weight: 1 }, { id: "bun", weight: 2 }], lootChance: 0.3 },
  { id: "jy-hanzhong", name: "한중 수비대", exp: 28, gold: 20, units: [u("wei", "front-left", T2), u("wei", "front-right", T2), u("archer", "rear-left", T2)], loot: [{ id: "medicine", weight: 2 }, { id: "scale-armor", weight: 1 }], lootChance: 0.35 },
  { id: "jy-ambush", name: "산중 복병", exp: 27, gold: 22, units: [u("ambusher", "front-left", T2), u("ambusher", "front-right", T2), u("archer", "rear-right", T2)], loot: [{ id: "fire-pot", weight: 1 }, { id: "ancient-blade", weight: 1 }], lootChance: 0.35 },
  { id: "jy-dingjun", name: "정군산 수비대", exp: 29, gold: 22, units: [u("wei", "front-center", T2), u("archer", "rear-left", T2), u("archer", "rear-right", T2), u("ambusher", "front-left", T2)], loot: [{ id: "long-spear", weight: 1 }, { id: "herb", weight: 2 }], lootChance: 0.35 },
  { id: "jy-seven", name: "칠군", exp: 47, gold: 30, units: [u("seven", "front-left", T3), u("seven", "front-center", T3), u("seven", "front-right", T3), u("archer", "rear-left", T3)], loot: [{ id: "dragon-armor", weight: 1 }, { id: "medicine", weight: 2 }], lootChance: 0.4 },
  { id: "jy-fancheng", name: "번성 수비대", exp: 46, gold: 30, units: [u("wei", "front-left", T3), u("wei", "front-right", T3), u("archer", "rear-left", T3)], loot: [{ id: "elixir", weight: 2 }, { id: "tiger-tally", weight: 1 }], lootChance: 0.4 },
  { id: "jy-relief", name: "위군 구원군", exp: 48, gold: 32, units: [u("ambusher", "front-left", T3), u("wei", "front-center", T3), u("archer", "rear-right", T3), u("archer", "rear-left", T3)], loot: [{ id: "rice-sack", weight: 2 }, { id: "treatment-kit", weight: 1 }], lootChance: 0.4 },
  // bosses
  { id: "boss-ma-chao", name: "가맹관 마초", boss: true, exp: 80, gold: 60, duel: { unitIndex: 0, penalty: 0.5 }, recruit: { characterId: "ma-chao", chance: 0.4 },
    units: [boss("마초", [300, 108, 98, 112, 70], "melee", ["xiliang-charge", "hb-e-strike"], "front-center"), u("xiliang", "front-left", T1 * 1.1), u("xiliang", "front-right", T1 * 1.1)], loot: [{ id: "swift-boots", weight: 1 }], lootChance: 1 },
  { id: "boss-xiahou-yuan", name: "정군산 하후연", boss: true, exp: 140, gold: 100, recruit: { characterId: "xiahou-yuan", chance: 0.3 },
    units: [boss("하후연", [360, 112, 98, 118, 80], "ranged", ["hb-crossbow", "xy2-e-raid"], "rear-left"), u("wei", "front-left", T2), u("wei", "front-right", T2), u("archer", "rear-right", T2)], loot: [{ id: "horn-bow", weight: 1 }], lootChance: 1 },
  { id: "boss-yu-jin", name: "칠군 우금·방덕", boss: true, exp: 60, gold: 40, nextPhase: "boss-cao-ren",
    units: [boss("방덕", [360, 120, 104, 100, 70], "melee", ["pang-de-coffin"], "front-center"), boss("우금", [300, 104, 110, 94, 90], "melee", ["yu-jin-order"], "front-left"), u("seven", "front-right", T3)] },
  { id: "boss-cao-ren", name: "번성 조인", boss: true, exp: 0, gold: 0, phaseScene: "jy-cao-ren",
    units: [boss("조인", [420, 108, 128, 88, 80], "melee", ["cao-ren-e-wall", "cao-ren-e-sortie"], "front-center"), u("archer", "rear-left", T3), u("archer", "rear-right", T3)] },
];

const scenes: StorySceneDefinition[] = [
  { id: "jy-intro", title: "서천으로",
    lines: [
      { name: "해설", text: "건안 16년, 익주목 유장이 장로를 막아 달라며 유비를 불러들였다." },
      { name: "해설", text: "형주와 익주, 그리고 한중. 천하삼분의 땅을 놓고 각자의 수가 오간다." },
    ],
    variants: {
      "liu-bei": [{ speaker: "liu-bei", name: "유비", text: "동족의 땅을 빼앗는 것이 옳은가… 그러나 대업을 위해서라면." }],
      "cao-cao": [{ speaker: "cao-cao", name: "조조", text: "농을 얻고 또 촉을 바라는가. 한중은 지켜야 한다." }],
      "sun-quan": [{ speaker: "sun-quan", name: "손권", text: "형주를 빌려준 대가는 언젠가 받아야겠지요." }],
    } },
  { id: "jy-f3", title: "낙봉파",
    lines: [{ name: "해설", text: "좁은 산길, 봉황이 떨어진다는 낙봉파. 숲 속에서 화살이 비처럼 쏟아졌다." }, { name: "해설", text: "산길에는 복병이 숨어 있다. 경계를 늦추지 말 것." }] },
  { id: "jy-ma-chao-down", title: "가맹관 야전",
    lines: [{ speaker: "zhang-fei", name: "장비", text: "횃불을 밝혀라! 밤새도록 싸워 보자!" }, { name: "해설", text: "횃불 아래 수백 합. 서량의 금마초가 마침내 창을 거두었다." }] },
  { id: "jy-xiahou-yuan-down", title: "정군산",
    lines: [{ speaker: "huang-zhong", name: "황충", text: "늙었다고 얕보지 마라!" }, { name: "해설", text: "산 위에서 내리꽂힌 일격에 하후연이 쓰러졌다. 한중의 문이 열린다." }] },
  { id: "jy-f11", title: "수엄칠군",
    lines: [
      { speaker: "guan-yu", name: "관우", text: "가을 장마가 길다. 한수의 둑을 터라." },
      { name: "해설", text: "물이 번성 일대를 삼킨다. 수위가 오르면 군량이 젖는다. (상단 '수위')" },
    ],
    choices: [
      { label: "배를 준비해 둔다", effects: [{ kind: "food", amount: 15 }] },
      { label: "곧장 공격한다", effects: [{ kind: "exp", amount: 45 }] },
    ] },
  { id: "jy-cao-ren", title: "번성의 조인",
    lines: [{ speaker: "조인", name: "조인", text: "성이 물에 잠겨도 깃발은 내리지 않는다. 한 걸음도 물러서지 마라!" }] },
  { id: "jy-cao-ren-down", title: "위진화하",
    lines: [{ name: "해설", text: "번성이 함락 직전에 몰리고, 관우의 위세가 중원을 뒤흔들었다." }, { name: "해설", text: "그러나 등 뒤 강동에서는 여몽이 흰 옷을 입고 강을 건너고 있었다." }] },
  { id: "jy-outro", title: "형주의 그림자",
    lines: [{ name: "해설", text: "유비는 한중왕에 올랐다. 그러나 형주를 잃는 순간, 촉한의 운명은 크게 기울게 된다." }],
    variants: {
      "liu-bei": [{ speaker: "liu-bei", name: "유비", text: "운장… 형주를 부탁하였거늘." }],
      "cao-cao": [{ speaker: "cao-cao", name: "조조", text: "관우의 기세가 이 정도일 줄이야. 천도를 논해야 하는가." }],
      "sun-quan": [{ speaker: "sun-quan", name: "손권", text: "지금이다. 형주를 되찾는다." }],
    } },
];

const events = [
  { id: "ev-jy-zhang-song", title: "서천 지도", text: "익주의 별가 장송이 서천의 지형을 그린 지도를 건넨다.", choices: [
    { label: "받는다", effects: [{ kind: "item" as const, itemId: "scout-map" }, { kind: "exp" as const, amount: 20 }] },
    { label: "후히 대접한다", effects: [{ kind: "gold" as const, amount: -20 }, { kind: "exp" as const, amount: 40 }] }] },
  { id: "ev-jy-plank", title: "잔도", text: "절벽에 매달린 좁은 잔도가 이어진다.", choices: [
    { label: "조심히 건넌다", effects: [{ kind: "food" as const, amount: -8 }] },
    { label: "서둘러 건넌다", effects: [{ kind: "damage" as const, ratio: 0.1 }, { kind: "exp" as const, amount: 25 }] }] },
  { id: "ev-jy-chicken", title: "계륵", text: "한중을 두고 '계륵'이라는 암호가 오간다.", choices: [
    { label: "뜻을 헤아린다", effects: [{ kind: "exp" as const, amount: 35 }] },
    { label: "군량을 챙긴다", effects: [{ kind: "food" as const, amount: 20 }] }] },
];
const EVENTS: Weighted[] = [{ id: "ev-jy-zhang-song", weight: 1 }, { id: "ev-jy-plank", weight: 2 }, { id: "ev-jy-chicken", weight: 2 }, { id: "ev-shrine", weight: 1 }, { id: "ev-caravan", weight: 1 }];

const AMBUSH = { type: "ambush", params: { interval: 35, chance: 0.6 } };
const FLOOD = { type: "flood", params: { interval: 30, harm: 3 } };
const MOUNTAIN: Weighted<(typeof MODIFIERS)[number]["id"]>[] = [{ id: "fog", weight: 3 }, { id: "night", weight: 2 }, { id: "rain", weight: 1 }];
const RAIN: Weighted<(typeof MODIFIERS)[number]["id"]>[] = [{ id: "rain", weight: 4 }, { id: "fog", weight: 1 }];

function jyFloor(depth: number): FloorPlan {
  const withEvents = (items: readonly Weighted[], count: readonly [number, number], recruit: number, event: number) =>
    objects(items, count, recruit, event).map((spec) => spec.kind === "event" ? { ...spec, pool: EVENTS } : spec);
  if (depth === 5) return { depth, enemyGroups: [{ id: "jy-xiliang", weight: 1 }], enemyCount: [2, 3], traps: BASIC_TRAPS, trapCount: [1, 2], bossGroupId: "boss-ma-chao", safeZoneAfter: true, objects: withEvents(ITEM_POOL_EARLY, [1, 2], 0, 0) };
  if (depth === 10) return { depth, enemyGroups: [{ id: "jy-dingjun", weight: 1 }], enemyCount: [2, 3], traps: BASIC_TRAPS, trapCount: [1, 2], bossGroupId: "boss-xiahou-yuan", safeZoneAfter: true, objects: withEvents(ITEM_POOL_MID, [1, 2], 0, 0), modifierChance: 0.5, modifiers: MOUNTAIN };
  if (depth === 15) return { depth, enemyGroups: [{ id: "jy-fancheng", weight: 1 }, { id: "jy-seven", weight: 1 }], enemyCount: [2, 3], traps: BASIC_TRAPS, trapCount: [1, 2], bossGroupId: "boss-yu-jin", objects: withEvents(ITEM_POOL_LATE, [1, 2], 0, 0), mechanics: [FLOOD], modifierChance: 0.6, modifiers: RAIN };
  const tier = depth <= 4 ? 1 : depth <= 9 ? 2 : 3;
  const groups: Weighted[] = tier === 1
    ? (depth <= 2 ? [{ id: "jy-shu-guard", weight: 3 }, { id: "jy-shu-archers", weight: 1 }] : [{ id: "jy-shu-guard", weight: 2 }, { id: "jy-shu-archers", weight: 2 }, { id: "jy-xiliang", weight: 2 }])
    : tier === 2 ? [{ id: "jy-hanzhong", weight: 2 }, { id: "jy-ambush", weight: 2 }, { id: "jy-dingjun", weight: 2 }]
    : [{ id: "jy-seven", weight: 2 }, { id: "jy-fancheng", weight: 2 }, { id: "jy-relief", weight: 2 }];
  return {
    depth, enemyGroups: groups, enemyCount: tier === 1 ? [3, 4] : [3, 5], traps: BASIC_TRAPS, trapCount: [2, 2 + tier],
    objects: withEvents(tier === 1 ? ITEM_POOL_EARLY : tier === 2 ? ITEM_POOL_MID : ITEM_POOL_LATE, [2, 3], depth >= 2 && depth <= 12 ? 0.3 : 0, 0.35),
    ...(depth === 3 ? { mechanics: [AMBUSH], modifierChance: 0.5, modifiers: MOUNTAIN }
      : tier === 1 ? { modifierChance: depth === 1 ? 0 : 0.3, modifiers: MODIFIERS }
      : tier === 2 ? { mechanics: [AMBUSH], modifierChance: 0.5, modifiers: MOUNTAIN }
      : { mechanics: [FLOOD], modifierChance: 0.6, modifiers: RAIN }),
  };
}

export const E6_JING_YI: CampaignModule = {
  campaign: {
    id: ID, name: "형주·익주", order: 6, era: "211–219",
    summary: "낙봉파의 복병, 가맹관의 마초, 정군산의 하후연, 그리고 번성 수공의 절정까지.",
    scenes: {
      intro: "jy-intro", outro: "jy-outro", floorEnter: { 3: "jy-f3", 11: "jy-f11" },
      bossDefeated: { "boss-ma-chao": "jy-ma-chao-down", "boss-xiahou-yuan": "jy-xiahou-yuan-down", "boss-cao-ren": "jy-cao-ren-down" },
    },
    floors: Array.from({ length: 15 }, (_, index) => jyFloor(index + 1)),
    shopItems: [{ id: "bun", weight: 3 }, { id: "rice-sack", weight: 2 }, { id: "herb", weight: 3 }, { id: "medicine", weight: 2 }, { id: "treatment-kit", weight: 2 }, { id: "fire-pot", weight: 1 }, { id: "elixir", weight: 1 }, { id: "scout-map", weight: 1 }],
    shopEquipment: [{ id: "long-spear", weight: 1 }, { id: "horn-bow", weight: 1 }, { id: "war-fan", weight: 1 }, { id: "scale-armor", weight: 1 }, { id: "tiger-tally", weight: 1 }, { id: "ancient-blade", weight: 1 }],
  },
  characters, skills, skillNames, traits, enemyGroups, events, scenes,
  unlocks: [
    { id: "u-jing-yi", condition: { kind: "clear-campaign", campaignId: "red-cliffs" }, unlock: { campaignId: ID } },
    { id: "u-wei-yan", condition: { kind: "reach-depth", campaignId: ID, depth: 4 }, unlock: { characterId: "wei-yan" } },
    { id: "u-fa-zheng", condition: { kind: "defeat-group", groupId: "boss-xiahou-yuan" }, unlock: { characterId: "fa-zheng", achievement: "정군산" } },
    { id: "u-xu-huang", condition: { kind: "clear-campaign", campaignId: ID }, unlock: { characterId: "xu-huang", achievement: "수엄칠군" } },
  ],
};
