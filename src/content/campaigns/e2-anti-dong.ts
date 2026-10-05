// E2 반동탁연합 (190) — 사수관 화웅 → 호로관 여포 → 낙양 동탁. 연의 기준 (STORY_EXPANSION_PLAN §2).
import type { FloorPlan, StorySceneDefinition } from "../../run/types.js";
import type { Weighted } from "../../dungeon/floor.js";
import { BASIC_TRAPS, ITEM_POOL_EARLY, ITEM_POOL_LATE, ITEM_POOL_MID, MODIFIERS, objects } from "../campaigns.js";
import { defineCharacters } from "../characters.js";
import { boss, scaledUnit } from "../enemies.js";
import type { CampaignModule } from "../module.js";
import { uniqueTraits } from "../module.js";
import { active, allyOne, allyUpTo, cleanse, enemyOne, enemyUpTo, energy, heal, physical, shift, status, strategy, ultimate } from "../skills.js";

const ID = "anti-dong";

// ---------- playable generals ----------
const characters = defineCharacters([
  ["lu-bu", "여포", "general", "cavalry", ["돌파", "광역", "처형"], [118, 122, 100, 112, 72], ["lb-halberd", "lb-sweep", "lb-unrivaled-p"], ["t-lb-redhare", "t-lb-peerless", "t-lb-fickle"]],
  ["sun-jian", "손견", "general", "infantry", ["공격", "출혈", "지휘"], [110, 110, 104, 100, 90], ["sj-tiger", "sj-blade", "sj-jiangdong-tiger"], ["t-sj-tiger", "t-sj-seal", "t-sj-vanguard"]],
  ["yuan-shao", "원소", "general", "strategist", ["지휘", "지원", "디버프"], [100, 88, 96, 96, 112], ["ys-command", "ys-prestige", "ys-four-generations"], ["t-ys-alliance", "t-ys-noble", "t-ys-hebei"]],
  ["cao-ren", "조인", "general", "infantry", ["탱커", "도발", "수성"], [120, 102, 120, 86, 84], ["cr-hold", "cr-lock", "cr-bastion"], ["t-cr-wall", "t-cr-eightgates", "t-cr-steadfast"]],
  ["hua-xiong", "화웅", "general", "infantry", ["공격", "도발", "광역"], [116, 116, 104, 96, 70], ["hx-cleave", "hx-roar", "hx-sishui"], ["t-hx-brute", "t-hx-pride", "t-hx-xiliang"]],
]);

const skills = [
  // 여포: 방천화극 / 무쌍난무 / 천하무쌍
  active("lb-halberd", 35, enemyOne(), [physical(42)]),
  active("lb-sweep", 40, enemyUpTo(3, "front"), [physical(34, { modifier: 0.8 })]),
  ultimate("lb-unrivaled-p", enemyUpTo(5), [physical(46, { modifier: 0.72 })]),
  // 손견: 강동의 호랑이 / 고정도 / 강동맹호
  active("sj-tiger", 30, enemyOne("front"), [physical(34), energy(10, "actor")]),
  active("sj-blade", 35, enemyUpTo(2, "front"), [physical(30, { modifier: 0.85 }), status("bleed", 2, { magnitude: 4 })]),
  ultimate("sj-jiangdong-tiger", enemyUpTo(3), [physical(44, { modifier: 0.8 }), status("bleed", 2, { stacks: 2, magnitude: 4 })]),
  // 원소: 맹주의 호령 / 명문의 위세 / 사세삼공
  active("ys-command", 30, allyUpTo(3), [energy(15)]),
  active("ys-prestige", 30, enemyOne(), [strategy(26), status("defense-down", 2, { magnitude: 0.2 })]),
  ultimate("ys-four-generations", allyUpTo(5), [heal(20), energy(15)]),
  // 조인: 철벽수성 / 팔문금쇄 / 번성사수
  active("cr-hold", 25, enemyUpTo(3, "front"), [status("taunt", 2), heal(12, "actor")]),
  active("cr-lock", 40, enemyOne("front"), [physical(30), status("stun", 1)]),
  ultimate("cr-bastion", allyUpTo(5), [heal(22), cleanse()]),
  // 화웅: 대도참 / 효기의 포효 / 사수관 일격
  active("hx-cleave", 35, enemyUpTo(2, "front"), [physical(34, { modifier: 0.85 })]),
  active("hx-roar", 25, enemyUpTo(3, "front"), [status("taunt", 2)]),
  ultimate("hx-sishui", enemyOne(), [physical(55, { critChance: 0.3 })]),
  // enemies
  active("dz-tyranny", 40, enemyUpTo(3), [strategy(28, { modifier: 0.8 }), status("defense-down", 2, { magnitude: 0.2 })]),
  active("dz-crush", 35, enemyOne("front"), [physical(32), status("defense-down", 2, { magnitude: 0.15 })]),
  ultimate("dz-burn-capital", enemyUpTo(5), [strategy(42, { modifier: 0.75 }), status("burn", 2, { stacks: 2, magnitude: 5 })]),
  active("lb-e-halberd", 35, enemyOne(), [physical(40)]),
  active("lb-e-sweep", 40, enemyUpTo(3, "front"), [physical(32, { modifier: 0.8 })]),
  ultimate("lb-e-unrivaled", enemyUpTo(5), [physical(44, { modifier: 0.7 }), shift(20)]),
  active("torch-throw", 35, enemyUpTo(2), [strategy(22, { modifier: 0.85 }), status("burn", 2, { magnitude: 4 })]),
  active("li-ru-scheme", 35, enemyOne(), [status("confusion", 1), strategy(20)]),
];

const skillNames: Record<string, string> = {
  "lb-halberd": "방천화극", "lb-sweep": "무쌍난무", "lb-unrivaled-p": "천하무쌍",
  "sj-tiger": "강동의 호랑이", "sj-blade": "고정도", "sj-jiangdong-tiger": "강동맹호",
  "ys-command": "맹주의 호령", "ys-prestige": "명문의 위세", "ys-four-generations": "사세삼공",
  "cr-hold": "철벽수성", "cr-lock": "팔문금쇄", "cr-bastion": "번성사수",
  "hx-cleave": "대도참", "hx-roar": "효기의 포효", "hx-sishui": "사수관 일격",
  "dz-tyranny": "폭정", "dz-crush": "상국의 위압", "dz-burn-capital": "낙양 방화",
  "lb-e-halberd": "방천화극", "lb-e-sweep": "무쌍난무", "lb-e-unrivaled": "천하무쌍",
  "torch-throw": "횃불 투척", "li-ru-scheme": "독계",
};

const traits = uniqueTraits([
  ["t-lb-redhare", "lu-bu", "적토마", "SPD +10%", ["속도", "돌파"], { statPercent: { spd: 0.1 } }],
  ["t-lb-peerless", "lu-bu", "비장", "ATK +12%", ["공격", "처형"], { statPercent: { atk: 0.12 } }],
  ["t-lb-fickle", "lu-bu", "삼성가노", "ATK +15%, DEF -8%", ["공격"], { statPercent: { atk: 0.15, def: -0.08 } }],
  ["t-sj-tiger", "sun-jian", "강동의 범", "ATK +10%", ["공격"], { statPercent: { atk: 0.1 } }],
  ["t-sj-seal", "sun-jian", "전국옥새", "전투 시작 기력 +25", ["지휘"], { entryEnergy: 25 }],
  ["t-sj-vanguard", "sun-jian", "선봉", "HP/DEF +8%", ["생존"], { statPercent: { maxHp: 0.08, def: 0.08 } }],
  ["t-ys-alliance", "yuan-shao", "맹주", "INT +10%", ["지휘"], { statPercent: { int: 0.1 } }],
  ["t-ys-noble", "yuan-shao", "명문", "회복 아이템 효과 +25%", ["지원"], { healItemBonus: 0.25 }],
  ["t-ys-hebei", "yuan-shao", "하북의 패자", "HP +12%", ["생존"], { statPercent: { maxHp: 0.12 } }],
  ["t-cr-wall", "cao-ren", "수성", "DEF +15%", ["탱커"], { statPercent: { def: 0.15 } }],
  ["t-cr-eightgates", "cao-ren", "팔문금쇄진", "함정 감지 30%", ["탐색"], { passiveTrapDetection: 0.3 }],
  ["t-cr-steadfast", "cao-ren", "사수", "HP +15%", ["생존"], { statPercent: { maxHp: 0.15 } }],
  ["t-hx-brute", "hua-xiong", "괴력", "ATK +12%", ["공격"], { statPercent: { atk: 0.12 } }],
  ["t-hx-pride", "hua-xiong", "효기교위", "전투 시작 기력 +25", ["공격"], { entryEnergy: 25 }],
  ["t-hx-xiliang", "hua-xiong", "서량의 맹장", "HP/DEF +8%", ["생존"], { statPercent: { maxHp: 0.08, def: 0.08 } }],
]);

// ---------- enemies ----------
type Stats = readonly [number, number, number, number, number];
const A: Record<string, { name: string; stats: Stats; reach: "melee" | "ranged"; skills: string[] }> = {
  inf: { name: "동탁군 극병", stats: [76, 86, 78, 88, 60], reach: "melee", skills: ["dong-halberd"] },
  cav: { name: "서량 기병", stats: [74, 90, 70, 106, 56], reach: "melee", skills: ["xiliang-charge"] },
  arch: { name: "동탁군 궁병", stats: [64, 84, 66, 94, 62], reach: "ranged", skills: ["yt-volley"] },
  gate: { name: "관문 수비대", stats: [104, 82, 104, 80, 56], reach: "melee", skills: ["dong-halberd"] },
  torch: { name: "방화병", stats: [66, 72, 66, 96, 86], reach: "ranged", skills: ["torch-throw"] },
  guard: { name: "서량 친위대", stats: [86, 92, 86, 96, 64], reach: "melee", skills: ["dong-halberd", "xiliang-charge"] },
};
const u = (key: keyof typeof A, slot: Parameters<typeof scaledUnit>[4], scale: number) => scaledUnit(A[key]!.name, A[key]!.stats, A[key]!.reach, A[key]!.skills, slot, scale);
const T1 = 0.85;
const T2 = 1.25;
const T3 = 1.56;

const enemyGroups = [
  // 사수관 길 (1-3F)
  { id: "ad-patrol", name: "동탁군 순찰대", exp: 13, gold: 9, units: [u("inf", "front-left", T1), u("arch", "rear-left", T1)], loot: [{ id: "bun", weight: 2 }, { id: "herb", weight: 2 }], lootChance: 0.3 },
  { id: "ad-squad", name: "동탁군 보병대", exp: 15, gold: 10, units: [u("inf", "front-left", T1), u("inf", "front-right", T1), u("arch", "rear-left", T1)], loot: [{ id: "herb", weight: 2 }, { id: "iron-sword", weight: 1 }], lootChance: 0.3 },
  { id: "ad-riders", name: "서량 척후기", exp: 15, gold: 12, units: [u("cav", "front-left", T1), u("cav", "front-right", T1)], loot: [{ id: "bun", weight: 2 }, { id: "leather-armor", weight: 1 }], lootChance: 0.3 },
  { id: "sishui-guard", name: "사수관 수비대", exp: 22, gold: 16, units: [u("gate", "front-left", T1 * 1.1), u("gate", "front-right", T1 * 1.1), u("arch", "rear-left", T1)], loot: [{ id: "scale-armor", weight: 1 }, { id: "medicine", weight: 1 }], lootChance: 0.5 },
  // 호로관 길 (5-7F)
  { id: "ad-host", name: "동탁군 본대", exp: 29, gold: 20, units: [u("inf", "front-left", T2), u("inf", "front-right", T2), u("arch", "rear-left", T2), u("arch", "rear-right", T2)], loot: [{ id: "medicine", weight: 2 }, { id: "long-spear", weight: 1 }, { id: "scale-armor", weight: 1 }], lootChance: 0.35 },
  { id: "ad-ironcav", name: "서량 철기", exp: 28, gold: 20, units: [u("cav", "front-left", T2), u("cav", "front-center", T2), u("cav", "front-right", T2)], loot: [{ id: "swift-boots", weight: 1 }, { id: "herb", weight: 2 }], lootChance: 0.35 },
  { id: "ad-mixed", name: "동탁군 혼성대", exp: 28, gold: 22, units: [u("cav", "front-left", T2), u("inf", "front-center", T2), u("arch", "rear-right", T2)], loot: [{ id: "horn-bow", weight: 1 }, { id: "fire-pot", weight: 1 }, { id: "bun", weight: 2 }], lootChance: 0.35 },
  { id: "hulao-guard", name: "호로관 수비대", exp: 36, gold: 26, units: [u("gate", "front-left", T2), u("gate", "front-right", T2), u("arch", "rear-left", T2)], loot: [{ id: "tiger-tally", weight: 1 }], lootChance: 0.5 },
  // 낙양 (9-11F)
  { id: "ad-arsonists", name: "낙양 방화대", exp: 46, gold: 30, units: [u("torch", "rear-left", T3), u("torch", "rear-right", T3), u("inf", "front-center", T3)], loot: [{ id: "treatment-kit", weight: 1 }, { id: "elixir", weight: 2 }, { id: "war-fan", weight: 1 }], lootChance: 0.4 },
  { id: "ad-palace", name: "서량 친위대", exp: 48, gold: 32, units: [u("guard", "front-left", T3), u("guard", "front-right", T3), u("arch", "rear-left", T3), u("torch", "rear-right", T3)], loot: [{ id: "medicine", weight: 2 }, { id: "ancient-blade", weight: 1 }, { id: "dragon-armor", weight: 1 }], lootChance: 0.4 },
  { id: "ad-rearguard", name: "동탁군 후위대", exp: 47, gold: 30, units: [u("cav", "front-left", T3), u("inf", "front-center", T3), u("cav", "front-right", T3), u("arch", "rear-left", T3)], loot: [{ id: "rice-sack", weight: 2 }, { id: "jade-seal", weight: 1 }], lootChance: 0.4 },
  // bosses
  { id: "boss-sishui-hua-xiong", name: "사수관 화웅", boss: true, exp: 80, gold: 60,
    units: [boss("화웅", [320, 108, 98, 100, 70], "melee", ["hua-cleave", "hua-challenge"], "front-center"), u("inf", "front-left", T1 * 1.1), u("arch", "rear-left", T1 * 1.1)],
    duel: { unitIndex: 0, penalty: 0.5 }, recruit: { characterId: "hua-xiong", chance: 0.35 }, loot: [{ id: "tiger-tally", weight: 1 }], lootChance: 1 },
  { id: "boss-lu-bu", name: "호로관 여포", boss: true, exp: 70, gold: 50, nextPhase: "boss-lu-bu-2",
    units: [boss("여포", [340, 120, 106, 116, 70], "melee", ["lb-e-halberd", "lb-e-sweep"], "front-center"), u("cav", "front-left", T2), u("cav", "front-right", T2)] },
  { id: "boss-lu-bu-2", name: "무쌍 여포", boss: true, exp: 90, gold: 60, phaseScene: "ad-lu-bu-rage", recruit: { characterId: "lu-bu", chance: 0.3 },
    units: [boss("여포", [260, 130, 104, 124, 70], "melee", ["lb-e-sweep", "lb-e-unrivaled"], "front-center"), u("arch", "rear-left", T2)], loot: [{ id: "dragon-armor", weight: 1 }], lootChance: 1 },
  { id: "boss-dong-zhuo", name: "상국 동탁", boss: true, exp: 60, gold: 40, nextPhase: "boss-dong-zhuo-2",
    units: [boss("동탁", [440, 112, 118, 90, 108], "ranged", ["dz-tyranny", "dz-crush"], "rear-left"), boss("이유", [220, 80, 90, 104, 120], "ranged", ["li-ru-scheme"], "rear-right"), u("guard", "front-left", T3), u("guard", "front-right", T3)] },
  { id: "boss-dong-zhuo-2", name: "폭군 동탁", boss: true, exp: 0, gold: 0, phaseScene: "ad-dong-rage",
    units: [boss("동탁", [300, 120, 116, 94, 112], "ranged", ["dz-tyranny", "dz-burn-capital"], "rear-left"), u("torch", "rear-right", T3), u("guard", "front-center", T3)] },
];

// ---------- scenes ----------
const scenes: StorySceneDefinition[] = [
  { id: "ad-intro", title: "십팔로 제후 회맹",
    lines: [
      { name: "해설", text: "초평 원년, 동탁이 어린 황제를 세우고 낙양을 장악했다. 조조의 격문에 응해 열여덟 제후가 산조에 모였다." },
      { speaker: "yuan-shao", name: "원소", text: "역적 동탁을 토벌하고 한실을 바로 세우리라. 이 원본초가 맹주를 맡겠소." },
    ],
    variants: {
      "liu-bei": [{ name: "해설", text: "공손찬의 진영에 객장으로 몸을 의탁한 유비 삼형제도 연합군에 합류했다." }, { speaker: "liu-bei", name: "유비", text: "벼슬은 낮아도 뜻은 같다. 아우들아, 한실을 위해 싸우자." }],
      "cao-cao": [{ name: "해설", text: "격문을 돌린 장본인 조조. 그러나 제후들의 눈치싸움은 이미 시작되었다." }, { speaker: "cao-cao", name: "조조", text: "모여서 술잔만 기울일 셈인가. 나는 먼저 간다." }],
      "sun-quan": [{ name: "해설", text: "장사태수 손견이 선봉을 자청했다. 손권은 아버지의 군영에서 사수관을 바라본다." }, { speaker: "sun-jian", name: "손견", text: "강동의 범이 먼저 관문을 열겠다!" }],
    } },
  { id: "ad-f3", title: "사수관",
    lines: [{ name: "해설", text: "사수관의 문이 굳게 닫혀 있다. 성문 앞을 지키는 수비대를 쓰러뜨려야 길이 열린다." }] },
  { id: "ad-hua-xiong-down", title: "술이 식기 전에",
    lines: [
      { speaker: "guan-yu", name: "관우", text: "데워 둔 술이 아직 식지 않았구려." },
      { name: "해설", text: "화웅의 목이 진영 앞에 떨어지자 제후들이 술렁인다. 사수관이 열렸다." },
    ] },
  { id: "ad-f5", title: "호로관으로",
    lines: [{ name: "해설", text: "동탁은 호로관에 대군을 두었다. 그 선두에는 적토마를 탄 천하제일의 무장이 있다는 소문이다." }],
    choices: [
      { label: "척후를 보내 지형을 살핀다", effects: [{ kind: "food", amount: -10 }, { kind: "exp", amount: 35 }] },
      { label: "곧장 진군한다", effects: [{ kind: "food", amount: 10 }] },
    ] },
  { id: "ad-lu-bu-rage", title: "인중여포 마중적토",
    lines: [
      { speaker: "여포", name: "여포", text: "하찮은 것들이 감히! 이 여봉선의 방천화극을 받아 보아라!" },
      { name: "해설", text: "여포가 적토마의 고삐를 당긴다. 기세가 한층 거세졌다." },
    ] },
  { id: "ad-lu-bu-down", title: "호로관 돌파",
    lines: [
      { speaker: "zhang-fei", name: "장비", text: "세 놈의 성을 가진 종놈아, 어디로 도망가느냐!" },
      { name: "해설", text: "여포가 말머리를 돌려 물러났다. 호로관이 무너지고, 낙양까지 길이 열렸다." },
    ] },
  { id: "ad-f9", title: "불타는 낙양",
    lines: [
      { name: "해설", text: "동탁은 장안 천도를 명하고 낙양에 불을 질렀다. 궁궐과 민가가 함께 타오른다." },
      { name: "해설", text: "불길이 번지기 전에 계단을 찾아 빠져나가야 한다. (상단 '화재' 표시를 확인)" },
    ] },
  { id: "ad-dong-rage", title: "폭군의 발악",
    lines: [{ speaker: "동탁", name: "동탁", text: "낙양이 불타도 좋다! 너희도 함께 재가 되어라!" }] },
  { id: "ad-dong-down", title: "역적 패주",
    lines: [{ speaker: "동탁", name: "동탁", text: "이, 이럴 수가… 봉선은 어디 있느냐!" }, { name: "해설", text: "동탁의 군세가 무너지고 불길 속에 패주한다." }] },
  { id: "ad-outro", title: "흩어지는 연합",
    lines: [
      { name: "해설", text: "낙양은 잿더미가 되었고, 동탁은 장안으로 달아났다. 연합군은 공을 다투다 흩어진다." },
      { name: "해설", text: "손견은 우물 속에서 옥새를 얻었다는 소문과 함께 강동으로 돌아가고, 천하는 군웅할거의 시대로 접어든다." },
    ],
    variants: {
      "liu-bei": [{ speaker: "liu-bei", name: "유비", text: "제후들은 제 잇속만 챙기는구나. 우리는 백성의 편에 서자." }, { name: "해설", text: "연합은 흩어지고, 천하는 군웅할거의 시대로 접어든다." }],
      "cao-cao": [{ speaker: "cao-cao", name: "조조", text: "저들과는 대사를 도모할 수 없다. 내 길은 내가 연다." }, { name: "해설", text: "연합은 흩어지고, 천하는 군웅할거의 시대로 접어든다." }],
      "sun-quan": [{ speaker: "sun-jian", name: "손견", text: "이 옥새는… 하늘의 뜻인가." }, { name: "해설", text: "손견은 강동으로 돌아가고, 천하는 군웅할거의 시대로 접어든다." }],
    } },
];

const events = [
  { id: "ev-ad-camp", title: "연합군 군영", text: "원소의 진영에서 남는 군량을 나눠 주겠다고 한다. 대신 공을 양보하라는 눈치다.", choices: [
    { label: "군량을 받는다", effects: [{ kind: "food" as const, amount: 20 }] },
    { label: "거절하고 공을 세운다", effects: [{ kind: "exp" as const, amount: 30 }] }] },
  { id: "ev-ad-well", title: "궁궐 우물", text: "불탄 궁궐 우물 속에서 오색 빛이 새어 나온다.", choices: [
    { label: "건져 올린다", effects: [{ kind: "equipment" as const, equipmentId: "jade-seal" }, { kind: "damage" as const, ratio: 0.1 }] },
    { label: "불길한 물건이다", effects: [{ kind: "exp" as const, amount: 25 }] }] },
  { id: "ev-ad-refugees", title: "낙양 피난민", text: "장안으로 끌려가던 백성들이 도움을 청한다.", choices: [
    { label: "길을 터 준다", effects: [{ kind: "food" as const, amount: -10 }, { kind: "exp" as const, amount: 35 }] },
    { label: "약을 얻는다", effects: [{ kind: "item" as const, itemId: "medicine" }] }] },
];
const EVENTS: Weighted[] = [{ id: "ev-ad-camp", weight: 2 }, { id: "ev-ad-well", weight: 1 }, { id: "ev-ad-refugees", weight: 2 }, { id: "ev-shrine", weight: 1 }, { id: "ev-caravan", weight: 1 }, { id: "ev-wounded", weight: 1 }];

// ---------- floors ----------
const LUOYANG_MODS: Weighted<(typeof MODIFIERS)[number]["id"]>[] = [{ id: "smoke", weight: 3 }, { id: "dry", weight: 2 }, { id: "night", weight: 1 }];
const FIRE = { type: "burning-capital", params: { limit: 150, interval: 3, ratio: 0.03 } };

function adFloor(depth: number): FloorPlan {
  const withEvents = (items: readonly Weighted[], count: readonly [number, number], recruit: number, event: number) =>
    objects(items, count, recruit, event).map((spec) => spec.kind === "event" ? { ...spec, pool: EVENTS } : spec);
  if (depth === 4) return { depth, enemyGroups: [{ id: "ad-squad", weight: 1 }], enemyCount: [2, 3], traps: BASIC_TRAPS, trapCount: [1, 2], bossGroupId: "boss-sishui-hua-xiong", safeZoneAfter: true, objects: withEvents(ITEM_POOL_EARLY, [1, 2], 0, 0) };
  if (depth === 8) return { depth, enemyGroups: [{ id: "ad-host", weight: 1 }, { id: "ad-ironcav", weight: 1 }], enemyCount: [2, 3], traps: BASIC_TRAPS, trapCount: [1, 2], bossGroupId: "boss-lu-bu", safeZoneAfter: true, objects: withEvents(ITEM_POOL_MID, [1, 2], 0, 0) };
  if (depth === 12) return { depth, enemyGroups: [{ id: "ad-palace", weight: 1 }, { id: "ad-arsonists", weight: 1 }], enemyCount: [2, 3], traps: BASIC_TRAPS, trapCount: [1, 2], bossGroupId: "boss-dong-zhuo", objects: withEvents(ITEM_POOL_LATE, [1, 2], 0, 0), mechanics: [{ type: "burning-capital", params: { limit: 180, interval: 3, ratio: 0.03 } }], modifierChance: 0.5, modifiers: LUOYANG_MODS };
  const tier = depth <= 3 ? 1 : depth <= 7 ? 2 : 3;
  const groups: Weighted[] = tier === 1
    ? (depth === 1 ? [{ id: "ad-patrol", weight: 3 }, { id: "ad-squad", weight: 1 }] : [{ id: "ad-patrol", weight: 2 }, { id: "ad-squad", weight: 2 }, { id: "ad-riders", weight: 2 }])
    : tier === 2 ? [{ id: "ad-host", weight: 2 }, { id: "ad-ironcav", weight: 2 }, { id: "ad-mixed", weight: 2 }]
    : [{ id: "ad-arsonists", weight: 2 }, { id: "ad-palace", weight: 2 }, { id: "ad-rearguard", weight: 2 }];
  return {
    depth, enemyGroups: groups, enemyCount: tier === 1 ? [3, 4] : [3, 5], traps: BASIC_TRAPS, trapCount: [2, 2 + tier],
    objects: withEvents(tier === 1 ? ITEM_POOL_EARLY : tier === 2 ? ITEM_POOL_MID : ITEM_POOL_LATE, [2, 3], depth >= 2 && depth <= 10 ? 0.3 : 0, 0.35),
    ...(depth === 3 ? { gateDefenderGroupId: "sishui-guard" } : depth === 7 ? { gateDefenderGroupId: "hulao-guard" } : {}),
    ...(tier === 3 ? { mechanics: [FIRE], modifierChance: 0.5, modifiers: LUOYANG_MODS } : { modifierChance: depth === 1 ? 0 : 0.3, modifiers: MODIFIERS }),
  };
}

export const E2_ANTI_DONG: CampaignModule = {
  campaign: {
    id: ID, name: "반동탁연합", order: 2, era: "190",
    summary: "열여덟 제후의 연합. 사수관의 화웅, 호로관의 여포를 넘어 불타는 낙양의 동탁을 친다.",
    scenes: {
      intro: "ad-intro", outro: "ad-outro", floorEnter: { 3: "ad-f3", 5: "ad-f5", 9: "ad-f9" },
      bossDefeated: { "boss-sishui-hua-xiong": "ad-hua-xiong-down", "boss-lu-bu-2": "ad-lu-bu-down", "boss-dong-zhuo-2": "ad-dong-down" },
    },
    floors: Array.from({ length: 12 }, (_, index) => adFloor(index + 1)),
    shopItems: [{ id: "bun", weight: 3 }, { id: "rice-sack", weight: 2 }, { id: "herb", weight: 3 }, { id: "medicine", weight: 2 }, { id: "treatment-kit", weight: 2 }, { id: "fire-pot", weight: 1 }, { id: "elixir", weight: 1 }, { id: "scout-map", weight: 1 }],
    shopEquipment: [{ id: "long-spear", weight: 1 }, { id: "horn-bow", weight: 1 }, { id: "war-fan", weight: 1 }, { id: "scale-armor", weight: 1 }, { id: "swift-boots", weight: 1 }, { id: "tiger-tally", weight: 1 }],
  },
  characters, skills, skillNames, traits, enemyGroups, events, scenes,
  unlocks: [
    { id: "u-sun-jian", condition: { kind: "defeat-group", groupId: "boss-sishui-hua-xiong" }, unlock: { characterId: "sun-jian", achievement: "사수관 돌파" } },
    { id: "u-cao-ren", condition: { kind: "reach-depth", campaignId: ID, depth: 6 }, unlock: { characterId: "cao-ren" } },
    { id: "u-lu-bu-down", condition: { kind: "defeat-group", groupId: "boss-lu-bu-2" }, unlock: { achievement: "호로관 삼영전" } },
    { id: "u-yuan-shao", condition: { kind: "clear-campaign", campaignId: ID }, unlock: { characterId: "yuan-shao", achievement: "반동탁연합 승리" } },
  ],
};
