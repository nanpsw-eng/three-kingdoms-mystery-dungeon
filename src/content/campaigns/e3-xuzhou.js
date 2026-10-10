import { BASIC_TRAPS, ITEM_POOL_EARLY, ITEM_POOL_LATE, ITEM_POOL_MID, MODIFIERS, objects } from "../campaigns.js";
import { defineCharacters } from "../characters.js";
import { boss, scaledUnit } from "../enemies.js";
import { uniqueTraits } from "../module.js";
import { active, allyOne, allyUpTo, cleanse, enemyOne, enemyUpTo, energy, heal, physical, shift, status, strategy, ultimate } from "../skills.js";
const ID = "xuzhou";
const characters = defineCharacters([
    ["chen-gong", "진궁", "general", "strategist", ["제어", "디버프", "지휘"], [92, 80, 88, 102, 118], ["cg-scheme", "cg-counsel", "cg-xiapi"], ["t-cg-loyal", "t-cg-insight", "t-cg-plan"]],
    ["zang-ba", "장패", "general", "infantry", ["탱커", "반격"], [116, 106, 114, 90, 80], ["zb-bandit", "zb-hold", "zb-taishan"], ["t-zb-taishan", "t-zb-tough", "t-zb-rally"]],
    ["gao-shun", "고순", "general", "infantry", ["돌파", "공격", "생존"], [112, 112, 110, 94, 80], ["gs-trap", "gs-breaker", "gs-xianzhen"], ["t-gs-xianzhen", "t-gs-silent", "t-gs-iron"]],
    ["mi-zhu", "미축", "general", "support", ["회복", "지원", "보급"], [98, 70, 92, 98, 112], ["mz-supply", "mz-ward", "mz-fortune"], ["t-mz-wealth", "t-mz-merchant", "t-mz-faith"]],
]);
const skills = [
    active("cg-scheme", 30, enemyOne(), [strategy(24), status("confusion", 1)]),
    active("cg-counsel", 30, allyOne(), [energy(25), cleanse()]),
    ultimate("cg-xiapi", enemyUpTo(5), [strategy(40, { modifier: 0.75 }), status("timeline-delay", 1, { magnitude: 20 })]),
    active("zb-bandit", 30, enemyOne("front"), [physical(34)]),
    active("zb-hold", 25, enemyUpTo(3, "front"), [status("taunt", 2), heal(12, "actor")]),
    ultimate("zb-taishan", enemyUpTo(3, "front"), [physical(44, { modifier: 0.8 }), status("stun", 1)]),
    active("gs-trap", 35, enemyOne("front"), [physical(36), status("defense-down", 2, { magnitude: 0.2 })]),
    active("gs-breaker", 40, enemyUpTo(2, "front"), [physical(34, { modifier: 0.85 })]),
    ultimate("gs-xianzhen", enemyUpTo(3), [physical(48, { modifier: 0.8 })]),
    active("mz-supply", 25, allyOne(), [heal(30)]),
    active("mz-ward", 30, allyUpTo(2), [heal(16), energy(10)]),
    ultimate("mz-fortune", allyUpTo(5), [heal(28)]),
    // enemies
    active("ys-e-decree", 40, enemyUpTo(3), [strategy(26, { modifier: 0.8 }), status("defense-down", 2, { magnitude: 0.15 })]),
    ultimate("ys-e-jade", enemyUpTo(5), [strategy(40, { modifier: 0.75 })]),
    active("jl-trident", 35, enemyUpTo(2, "front"), [physical(32, { modifier: 0.85 })]),
    active("water-surge", 40, enemyUpTo(3), [strategy(24, { modifier: 0.8 }), shift(15)]),
    active("cg-e-plot", 35, enemyOne(), [status("confusion", 1), strategy(18)]),
    active("bandit-club", 30, enemyOne("front"), [physical(30)]),
];
const skillNames = {
    "cg-scheme": "기책", "cg-counsel": "헌책", "cg-xiapi": "하비 사수",
    "zb-bandit": "태산 의적", "zb-hold": "버티기", "zb-taishan": "태산압정",
    "gs-trap": "함진", "gs-breaker": "파진", "gs-xianzhen": "함진영",
    "mz-supply": "군자금", "mz-ward": "보급", "mz-fortune": "가산 헌납",
    "ys-e-decree": "칙령", "ys-e-jade": "중가 황제", "jl-trident": "삼첨도",
    "water-surge": "수공", "cg-e-plot": "계략", "bandit-club": "몽둥이",
};
const traits = uniqueTraits([
    ["t-cg-loyal", "chen-gong", "충절", "HP/DEF +8%", ["생존"], { statPercent: { maxHp: 0.08, def: 0.08 } }],
    ["t-cg-insight", "chen-gong", "간파", "INT +12%", ["제어"], { statPercent: { int: 0.12 } }],
    ["t-cg-plan", "chen-gong", "선견", "전투 시작 기력 +25", ["지휘"], { entryEnergy: 25 }],
    ["t-zb-taishan", "zang-ba", "태산적", "DEF +12%", ["탱커"], { statPercent: { def: 0.12 } }],
    ["t-zb-tough", "zang-ba", "강골", "HP +15%", ["생존"], { statPercent: { maxHp: 0.15 } }],
    ["t-zb-rally", "zang-ba", "의리", "ATK +10%", ["반격"], { statPercent: { atk: 0.1 } }],
    ["t-gs-xianzhen", "gao-shun", "함진영", "ATK +12%", ["돌파", "공격"], { statPercent: { atk: 0.12 } }],
    ["t-gs-silent", "gao-shun", "청렴", "전투 시작 기력 +20", ["공격"], { entryEnergy: 20 }],
    ["t-gs-iron", "gao-shun", "철군", "DEF/HP +8%", ["생존"], { statPercent: { def: 0.08, maxHp: 0.08 } }],
    ["t-mz-wealth", "mi-zhu", "거부", "회복 아이템 효과 +40%", ["회복", "지원"], { healItemBonus: 0.4 }],
    ["t-mz-merchant", "mi-zhu", "상인의 눈", "함정 감지 30%", ["탐색"], { passiveTrapDetection: 0.3 }],
    ["t-mz-faith", "mi-zhu", "충성", "INT +12%", ["회복"], { statPercent: { int: 0.12 } }],
]);
const A = {
    ysInf: { name: "원술군 보병", stats: [74, 84, 76, 88, 60], reach: "melee", skills: ["yt-stab"] },
    ysArch: { name: "원술군 궁병", stats: [62, 82, 64, 94, 62], reach: "ranged", skills: ["yt-volley"] },
    bandit: { name: "산적", stats: [70, 86, 66, 98, 50], reach: "melee", skills: ["bandit-club"] },
    lbCav: { name: "병주 기병", stats: [76, 92, 72, 108, 56], reach: "melee", skills: ["xiliang-charge"] },
    trap: { name: "함진영", stats: [86, 92, 90, 90, 58], reach: "melee", skills: ["dong-halberd"] },
    water: { name: "수군", stats: [70, 78, 70, 96, 80], reach: "ranged", skills: ["water-surge"] },
};
const u = (key, slot, scale) => scaledUnit(A[key].name, A[key].stats, A[key].reach, A[key].skills, slot, scale);
const T1 = 0.85;
const T2 = 1.28;
const T3 = 1.64;
const enemyGroups = [
    { id: "xz-bandits", name: "서주 산적", exp: 13, gold: 10, units: [u("bandit", "front-left", T1), u("bandit", "front-right", T1)], loot: [{ id: "bun", weight: 2 }, { id: "herb", weight: 2 }], lootChance: 0.3 },
    { id: "xz-ys-patrol", name: "원술군 순찰", exp: 14, gold: 10, units: [u("ysInf", "front-left", T1), u("ysArch", "rear-left", T1)], loot: [{ id: "herb", weight: 2 }, { id: "leather-armor", weight: 1 }], lootChance: 0.3 },
    { id: "xz-ys-squad", name: "원술군 보병대", exp: 15, gold: 11, units: [u("ysInf", "front-left", T1), u("ysInf", "front-right", T1), u("ysArch", "rear-left", T1)], loot: [{ id: "bun", weight: 2 }, { id: "iron-sword", weight: 1 }], lootChance: 0.3 },
    { id: "xz-ys-host", name: "중가 근위대", exp: 28, gold: 22, units: [u("ysInf", "front-left", T2), u("ysInf", "front-right", T2), u("ysArch", "rear-left", T2), u("ysArch", "rear-right", T2)], loot: [{ id: "medicine", weight: 2 }, { id: "silk-robe", weight: 1 }, { id: "scale-armor", weight: 1 }], lootChance: 0.35 },
    { id: "xz-raiders", name: "병주 기병대", exp: 28, gold: 20, units: [u("lbCav", "front-left", T2), u("lbCav", "front-right", T2), u("ysArch", "rear-left", T2)], loot: [{ id: "swift-boots", weight: 1 }, { id: "herb", weight: 2 }], lootChance: 0.35 },
    { id: "xz-turncoats", name: "배반자 무리", exp: 27, gold: 24, units: [u("bandit", "front-center", T2), u("ysInf", "front-left", T2), u("water", "rear-right", T2)], loot: [{ id: "fire-pot", weight: 1 }, { id: "war-fan", weight: 1 }], lootChance: 0.35 },
    { id: "xz-xianzhen", name: "함진영", exp: 47, gold: 30, units: [u("trap", "front-left", T3), u("trap", "front-center", T3), u("trap", "front-right", T3)], loot: [{ id: "dragon-armor", weight: 1 }, { id: "medicine", weight: 2 }], lootChance: 0.4 },
    { id: "xz-xiapi-guard", name: "하비 수비대", exp: 46, gold: 30, units: [u("lbCav", "front-left", T3), u("trap", "front-right", T3), u("water", "rear-left", T3), u("ysArch", "rear-right", T3)], loot: [{ id: "elixir", weight: 2 }, { id: "ancient-blade", weight: 1 }], lootChance: 0.4 },
    { id: "xz-flood-crew", name: "하비 수군", exp: 45, gold: 28, units: [u("water", "rear-left", T3), u("water", "rear-right", T3), u("lbCav", "front-center", T3)], loot: [{ id: "rice-sack", weight: 2 }, { id: "treatment-kit", weight: 1 }], lootChance: 0.4 },
    // bosses
    { id: "boss-ji-ling", name: "원술군 대장 기령", boss: true, exp: 80, gold: 60, duel: { unitIndex: 0, penalty: 0.5 },
        units: [boss("기령", [350, 114, 104, 100, 70], "melee", ["jl-trident"], "front-center"), u("ysInf", "front-left", T1 * 1.1), u("ysArch", "rear-left", T1 * 1.1)], loot: [{ id: "tiger-tally", weight: 1 }], lootChance: 1 },
    { id: "boss-yuan-shu", name: "중가 황제 원술", boss: true, exp: 140, gold: 100, recruit: { characterId: "zang-ba", chance: 0.35 },
        units: [boss("원술", [380, 96, 108, 96, 120], "ranged", ["ys-e-decree", "ys-e-jade"], "rear-left"), u("ysInf", "front-left", T2), u("ysInf", "front-right", T2), u("ysArch", "rear-right", T2)], loot: [{ id: "jade-seal", weight: 1 }], lootChance: 1 },
    { id: "boss-xiapi-lu-bu", name: "하비성 여포", boss: true, exp: 60, gold: 40, nextPhase: "boss-baimen", recruit: { characterId: "gao-shun", chance: 0.4 },
        units: [boss("여포", [440, 124, 112, 118, 70], "melee", ["lb-e-halberd", "lb-e-sweep"], "front-center"), boss("고순", [260, 112, 116, 96, 70], "melee", ["dong-halberd"], "front-left"), boss("진궁", [220, 80, 90, 104, 122], "ranged", ["cg-e-plot", "water-surge"], "rear-right")] },
    { id: "boss-baimen", name: "백문루의 여포", boss: true, exp: 0, gold: 0, phaseScene: "xz-baimen", recruit: { characterId: "chen-gong", chance: 0.4 },
        units: [boss("여포", [300, 130, 108, 124, 70], "melee", ["lb-e-sweep", "lb-e-unrivaled"], "front-center"), u("lbCav", "front-left", T3)] },
];
const scenes = [
    { id: "xz-intro", title: "서주를 둘러싼 다툼",
        lines: [
            { name: "해설", text: "흥평 원년, 서주목 도겸이 세상을 떠나며 유비에게 서주를 맡겼다." },
            { name: "해설", text: "그러나 남쪽의 원술은 서주를 노리고, 갈 곳 잃은 여포가 서주로 흘러든다." },
        ],
        variants: {
            "liu-bei": [{ speaker: "liu-bei", name: "유비", text: "도공의 부탁을 저버릴 수는 없다. 서주의 백성을 지키겠다." }, { name: "해설", text: "그러나 원술의 대군이 몰려오고, 여포는 소패에 머문다." }],
            "cao-cao": [{ speaker: "cao-cao", name: "조조", text: "여포를 서주에 두면 후환이 된다. 이번에야말로 끝을 보겠다." }, { name: "해설", text: "원술은 황제를 자칭하고, 여포는 하비에 웅거한다." }],
            "sun-quan": [{ name: "해설", text: "강동의 손책은 원술에게서 독립을 준비한다. 손권은 형의 명으로 서주의 정세를 살핀다." }, { speaker: "sun-quan", name: "손권", text: "원술의 그늘을 벗어날 때가 왔습니다." }],
        } },
    { id: "xz-f4", title: "원문사극",
        lines: [
            { speaker: "여포", name: "여포", text: "백오십 보 밖의 화극 가지를 맞히면 양군은 물러나라. 하늘의 뜻이다!" },
            { name: "해설", text: "여포의 화살이 화극에 꽂혔지만, 원술의 장수 기령은 물러나지 않았다." },
        ] },
    { id: "xz-ji-ling-down", title: "기령 격퇴",
        lines: [{ speaker: "기령", name: "기령", text: "주공께서… 가만두지 않으실 것이다!" }, { name: "해설", text: "기령이 물러났다. 남쪽에서는 원술이 옥새를 앞세워 황제를 칭한다." }] },
    { id: "xz-f6", title: "배신의 밤",
        lines: [
            { name: "해설", text: "성을 지키던 장수가 술에 취한 틈을 타 여포가 서주를 차지했다." },
            { name: "해설", text: "흩어진 병사를 모을 것인가, 곧장 원술을 칠 것인가." },
        ],
        choices: [
            { label: "흩어진 병사를 모은다", effects: [{ kind: "heal", ratio: 0.3 }, { kind: "food", amount: -10 }] },
            { label: "곧장 진군한다", effects: [{ kind: "exp", amount: 40 }] },
        ] },
    { id: "xz-yuan-shu-down", title: "꿀물 한 그릇",
        lines: [{ speaker: "원술", name: "원술", text: "꿀물… 꿀물 한 그릇만…" }, { name: "해설", text: "자칭 황제 원술의 세력이 무너졌다. 이제 남은 것은 하비의 여포." }] },
    { id: "xz-f9", title: "하비 수공",
        lines: [
            { name: "해설", text: "기수와 사수의 둑을 터뜨려 하비성을 물에 잠기게 한다. 물은 시간이 갈수록 차오른다." },
            { name: "해설", text: "수위가 높아지면 군량이 젖고 부대가 지친다. (상단 '수위' 표시)" },
        ] },
    { id: "xz-baimen", title: "백문루",
        lines: [{ speaker: "여포", name: "여포", text: "성문을 연 자가 누구냐! 좋다, 이 여포의 마지막 무용을 보여주마!" }] },
    { id: "xz-lu-bu-down", title: "여포의 최후",
        lines: [
            { speaker: "진궁", name: "진궁", text: "나를 죽이시오. 노모와 처자를 부탁할 뿐이오." },
            { name: "해설", text: "백문루에서 여포가 사로잡혔다. 천하무쌍의 용장도 결국 끈에 묶였다." },
        ] },
    { id: "xz-outro", title: "서주 평정",
        lines: [{ name: "해설", text: "서주는 평정되었다. 그러나 북쪽에서는 하북을 통일한 원소가 남하를 준비한다." }],
        variants: {
            "liu-bei": [{ speaker: "liu-bei", name: "유비", text: "서주를 지키지 못한 내 탓이다. 그러나 아직 끝나지 않았다." }, { name: "해설", text: "북쪽에서는 원소가 남하를 준비한다." }],
            "cao-cao": [{ speaker: "cao-cao", name: "조조", text: "여포는 사라졌다. 이제 원소와 천하를 다툴 차례다." }, { name: "해설", text: "관도에서 하북과 중원의 운명이 갈린다." }],
            "sun-quan": [{ speaker: "sun-quan", name: "손권", text: "원술이 무너졌으니 강동은 자유입니다. 형님께 알려야겠습니다." }, { name: "해설", text: "북쪽에서는 원소가 남하를 준비한다." }],
        } },
];
const events = [
    { id: "ev-xz-mizhu", title: "미축의 군자금", text: "서주의 거상 미축이 사재를 털어 군자금을 내놓겠다고 한다.", choices: [
            { label: "감사히 받는다", effects: [{ kind: "gold", amount: 60 }] },
            { label: "백성에게 나눠 준다", effects: [{ kind: "exp", amount: 35 }] }
        ] },
    { id: "ev-xz-wine", title: "술독", text: "성벽 아래 술독이 잔뜩 쌓여 있다. 장비가 눈을 반짝인다.", choices: [
            { label: "깨뜨린다", effects: [{ kind: "exp", amount: 25 }] },
            { label: "한 잔만", effects: [{ kind: "heal", ratio: 0.25 }, { kind: "food", amount: -5 }] }
        ] },
    { id: "ev-xz-dike", title: "무너진 둑", text: "불어난 물에 보급 수레가 갇혀 있다.", choices: [
            { label: "구해 낸다", effects: [{ kind: "food", amount: 20 }, { kind: "damage", ratio: 0.08 }] },
            { label: "지나친다", effects: [] }
        ] },
];
const EVENTS = [{ id: "ev-xz-mizhu", weight: 2 }, { id: "ev-xz-wine", weight: 2 }, { id: "ev-xz-dike", weight: 1 }, { id: "ev-shrine", weight: 1 }, { id: "ev-caravan", weight: 1 }, { id: "ev-wounded", weight: 1 }];
const FLOOD = { type: "flood", params: { interval: 30, harm: 3 } };
const RAIN = [{ id: "rain", weight: 3 }, { id: "fog", weight: 2 }, { id: "night", weight: 1 }];
function xzFloor(depth) {
    const withEvents = (items, count, recruit, event) => objects(items, count, recruit, event).map((spec) => spec.kind === "event" ? { ...spec, pool: EVENTS } : spec);
    if (depth === 4)
        return { depth, enemyGroups: [{ id: "xz-ys-squad", weight: 1 }], enemyCount: [2, 3], traps: BASIC_TRAPS, trapCount: [1, 2], bossGroupId: "boss-ji-ling", safeZoneAfter: true, objects: withEvents(ITEM_POOL_EARLY, [1, 2], 0, 0) };
    if (depth === 8)
        return { depth, enemyGroups: [{ id: "xz-ys-host", weight: 1 }], enemyCount: [2, 3], traps: BASIC_TRAPS, trapCount: [1, 2], bossGroupId: "boss-yuan-shu", safeZoneAfter: true, objects: withEvents(ITEM_POOL_MID, [1, 2], 0, 0) };
    if (depth === 12)
        return { depth, enemyGroups: [{ id: "xz-xiapi-guard", weight: 1 }, { id: "xz-flood-crew", weight: 1 }], enemyCount: [2, 3], traps: BASIC_TRAPS, trapCount: [1, 2], bossGroupId: "boss-xiapi-lu-bu", objects: withEvents(ITEM_POOL_LATE, [1, 2], 0, 0), mechanics: [FLOOD], modifierChance: 0.5, modifiers: RAIN };
    const tier = depth <= 3 ? 1 : depth <= 7 ? 2 : 3;
    const groups = tier === 1
        ? (depth === 1 ? [{ id: "xz-bandits", weight: 3 }, { id: "xz-ys-patrol", weight: 1 }] : [{ id: "xz-bandits", weight: 2 }, { id: "xz-ys-patrol", weight: 2 }, { id: "xz-ys-squad", weight: 2 }])
        : tier === 2 ? [{ id: "xz-ys-host", weight: 2 }, { id: "xz-raiders", weight: 2 }, { id: "xz-turncoats", weight: 2 }]
            : [{ id: "xz-xianzhen", weight: 2 }, { id: "xz-xiapi-guard", weight: 2 }, { id: "xz-flood-crew", weight: 2 }];
    return {
        depth, enemyGroups: groups, enemyCount: tier === 1 ? [3, 4] : [3, 5], traps: BASIC_TRAPS, trapCount: [2, 2 + tier],
        objects: withEvents(tier === 1 ? ITEM_POOL_EARLY : tier === 2 ? ITEM_POOL_MID : ITEM_POOL_LATE, [2, 3], depth >= 2 && depth <= 10 ? 0.3 : 0, 0.35),
        ...(tier === 3 ? { mechanics: [FLOOD], modifierChance: 0.5, modifiers: RAIN } : { modifierChance: depth === 1 ? 0 : 0.3, modifiers: MODIFIERS }),
    };
}
export const E3_XUZHOU = {
    campaign: {
        id: ID, name: "서주 쟁탈", order: 3, era: "194–198",
        summary: "원술의 칭제와 여포의 배신. 원문사극에서 하비 수공, 백문루까지.",
        scenes: {
            intro: "xz-intro", outro: "xz-outro", floorEnter: { 4: "xz-f4", 6: "xz-f6", 9: "xz-f9" },
            bossDefeated: { "boss-ji-ling": "xz-ji-ling-down", "boss-yuan-shu": "xz-yuan-shu-down", "boss-baimen": "xz-lu-bu-down" },
        },
        floors: Array.from({ length: 12 }, (_, index) => xzFloor(index + 1)),
        shopItems: [{ id: "bun", weight: 3 }, { id: "rice-sack", weight: 3 }, { id: "herb", weight: 3 }, { id: "medicine", weight: 2 }, { id: "treatment-kit", weight: 2 }, { id: "fire-pot", weight: 1 }, { id: "elixir", weight: 1 }],
        shopEquipment: [{ id: "long-spear", weight: 1 }, { id: "horn-bow", weight: 1 }, { id: "war-fan", weight: 1 }, { id: "scale-armor", weight: 1 }, { id: "silk-robe", weight: 1 }, { id: "swift-boots", weight: 1 }],
    },
    characters, skills, skillNames, traits, enemyGroups, events, scenes,
    unlocks: [
        { id: "u-xuzhou", condition: { kind: "clear-campaign", campaignId: "anti-dong" }, unlock: { campaignId: ID } },
        { id: "u-mi-zhu", condition: { kind: "reach-depth", campaignId: ID, depth: 5 }, unlock: { characterId: "mi-zhu" } },
        { id: "u-xuzhou-clear", condition: { kind: "clear-campaign", campaignId: ID }, unlock: { achievement: "백문루" } },
    ],
};
//# sourceMappingURL=e3-xuzhou.js.map