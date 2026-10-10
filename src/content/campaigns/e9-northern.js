import { BASIC_TRAPS, ITEM_POOL_EARLY, ITEM_POOL_LATE, ITEM_POOL_MID, MODIFIERS, objects } from "../campaigns.js";
import { defineCharacters } from "../characters.js";
import { boss, scaledUnit } from "../enemies.js";
import { uniqueTraits } from "../module.js";
import { active, allyOne, allyUpTo, enemyOne, enemyUpTo, energy, extraAction, heal, physical, shift, status, strategy, ultimate } from "../skills.js";
const ID = "northern";
const characters = defineCharacters([
    ["sima-yi", "사마의", "ruler", "strategist", ["제어", "지구전", "지휘"], [100, 90, 100, 100, 118], ["sy-patience", "sy-scheme", "sy-gaoping"], ["t-sy-wolf", "t-sy-patience", "t-sy-clan"]],
    ["jiang-wei", "강유", "general", "cavalry", ["돌파", "지휘", "공격"], [106, 112, 100, 108, 104], ["jw-spear", "jw-plan", "jw-successor"], ["t-jw-successor", "t-jw-courage", "t-jw-tianshui"]],
    ["zhang-he", "장합", "general", "cavalry", ["기습", "돌파", "생존"], [108, 112, 104, 110, 86], ["zh-flank", "zh-adapt", "zh-jieting"], ["t-zh-adapt", "t-zh-veteran", "t-zh-swift"]],
    ["deng-ai", "등애", "general", "infantry", ["기습", "탐색", "공격"], [108, 108, 104, 100, 104], ["da-yinping", "da-survey", "da-chengdu"], ["t-da-yinping", "t-da-farmer", "t-da-stutter"]],
]);
const skills = [
    active("sy-patience", 30, allyUpTo(3), [energy(15), heal(10)]),
    active("sy-scheme", 35, enemyOne(), [strategy(30), status("confusion", 1)]),
    ultimate("sy-gaoping", enemyUpTo(5), [strategy(44, { modifier: 0.75 }), status("timeline-delay", 1, { magnitude: 20 })]),
    active("jw-spear", 35, enemyOne(), [physical(38)]),
    active("jw-plan", 30, allyOne(), [extraAction("targets", "interrupt"), energy(10)]),
    ultimate("jw-successor", enemyUpTo(3), [physical(46, { modifier: 0.8 })]),
    active("zh-flank", 30, enemyOne(), [physical(34), shift(20)]),
    active("zh-adapt", 30, enemyUpTo(2), [physical(28, { modifier: 0.85 })]),
    ultimate("zh-jieting", enemyUpTo(3), [physical(46, { modifier: 0.8 }), status("defense-down", 2, { magnitude: 0.2 })]),
    active("da-yinping", 30, enemyOne(), [physical(36, { critChance: 0.2 })]),
    active("da-survey", 25, allyUpTo(2), [energy(15)]),
    ultimate("da-chengdu", enemyUpTo(3), [physical(46, { modifier: 0.8 }), shift(20)]),
    // enemies
    active("wei-e-halberd", 35, enemyOne("front"), [physical(34)]),
    active("wei-e-crossbow", 35, enemyUpTo(2), [physical(26, { modifier: 0.85 })]),
    active("zh-e-flank", 35, enemyOne(), [physical(40), shift(15)]),
    active("sy-e-wait", 35, enemyUpTo(3), [strategy(28, { modifier: 0.8 }), status("defense-down", 2, { magnitude: 0.15 })]),
    ultimate("sy-e-wolf", enemyUpTo(5), [strategy(44, { modifier: 0.72 }), shift(20)]),
    active("jw-e-spear", 35, enemyOne(), [physical(38)]),
];
const skillNames = {
    "sy-patience": "지구전", "sy-scheme": "응시랑고", "sy-gaoping": "고평릉",
    "jw-spear": "천수의 창", "jw-plan": "담력", "jw-successor": "승상의 후계",
    "zh-flank": "교변", "zh-adapt": "임기응변", "zh-jieting": "가정 돌파",
    "da-yinping": "음평 기습", "da-survey": "지형 측량", "da-chengdu": "성도 입성",
    "wei-e-halberd": "극격", "wei-e-crossbow": "강노", "zh-e-flank": "교변", "sy-e-wait": "지구전", "sy-e-wolf": "낭고상", "jw-e-spear": "천수의 창",
};
const traits = uniqueTraits([
    ["t-sy-wolf", "sima-yi", "낭고상", "INT +12%", ["제어"], { statPercent: { int: 0.12 } }],
    ["t-sy-patience", "sima-yi", "인내", "HP/DEF +10%", ["지구전", "생존"], { statPercent: { maxHp: 0.1, def: 0.1 } }],
    ["t-sy-clan", "sima-yi", "사마씨", "함정 감지 30%", ["탐색"], { passiveTrapDetection: 0.3 }],
    ["t-jw-successor", "jiang-wei", "후계자", "ATK/INT +6%", ["지휘"], { statPercent: { atk: 0.06, int: 0.06 } }],
    ["t-jw-courage", "jiang-wei", "담대", "전투 시작 기력 +25", ["공격"], { entryEnergy: 25 }],
    ["t-jw-tianshui", "jiang-wei", "천수의 기린아", "SPD +8%", ["돌파", "속도"], { statPercent: { spd: 0.08 } }],
    ["t-zh-adapt", "zhang-he", "교변", "SPD +8%", ["기습", "속도"], { statPercent: { spd: 0.08 } }],
    ["t-zh-veteran", "zhang-he", "숙장", "HP/DEF +8%", ["생존"], { statPercent: { maxHp: 0.08, def: 0.08 } }],
    ["t-zh-swift", "zhang-he", "명장", "ATK +10%", ["돌파"], { statPercent: { atk: 0.1 } }],
    ["t-da-yinping", "deng-ai", "음평", "전투 시작 기력 +25", ["기습"], { entryEnergy: 25 }],
    ["t-da-farmer", "deng-ai", "둔전", "회복 아이템 효과 +30%", ["탐색"], { healItemBonus: 0.3 }],
    ["t-da-stutter", "deng-ai", "애애", "ATK +10%", ["공격"], { statPercent: { atk: 0.1 } }],
]);
const A = {
    inf: { name: "위군 보병", stats: [80, 88, 82, 88, 60], reach: "melee", skills: ["wei-e-halberd"] },
    xbow: { name: "위군 노병", stats: [66, 90, 66, 92, 62], reach: "ranged", skills: ["wei-e-crossbow"] },
    cav: { name: "위군 기병", stats: [78, 94, 74, 108, 56], reach: "melee", skills: ["xiliang-charge"] },
    heavy: { name: "중장 보병", stats: [94, 92, 100, 80, 56], reach: "melee", skills: ["wei-e-halberd"] },
    raider: { name: "보급로 습격대", stats: [72, 92, 70, 106, 58], reach: "melee", skills: ["wu-e-ambush"] },
};
const u = (key, slot, scale) => scaledUnit(A[key].name, A[key].stats, A[key].reach, A[key].skills, slot, scale);
const T1 = 0.88;
const T2 = 1.2;
const T3 = 1.62;
const enemyGroups = [
    { id: "nb-pickets", name: "위군 초병", exp: 12, gold: 9, units: [u("inf", "front-left", T1), u("xbow", "rear-left", T1)], loot: [{ id: "bun", weight: 2 }, { id: "herb", weight: 2 }], lootChance: 0.3 },
    { id: "nb-squad", name: "위군 보병대", exp: 14, gold: 10, units: [u("inf", "front-left", T1), u("inf", "front-right", T1), u("xbow", "rear-left", T1)], loot: [{ id: "herb", weight: 2 }, { id: "iron-sword", weight: 1 }], lootChance: 0.3 },
    { id: "nb-riders", name: "위군 경기병", exp: 14, gold: 11, units: [u("cav", "front-left", T1), u("cav", "front-right", T1)], loot: [{ id: "swift-boots", weight: 1 }, { id: "bun", weight: 2 }], lootChance: 0.3 },
    { id: "nb-assault", name: "가정 공격대", exp: 28, gold: 20, units: [u("inf", "front-left", T2), u("heavy", "front-right", T2), u("xbow", "rear-left", T2)], loot: [{ id: "medicine", weight: 2 }, { id: "scale-armor", weight: 1 }], lootChance: 0.35 },
    { id: "nb-cavalry", name: "위군 철기", exp: 28, gold: 22, units: [u("cav", "front-left", T2), u("cav", "front-center", T2), u("cav", "front-right", T2)], loot: [{ id: "long-spear", weight: 1 }, { id: "herb", weight: 2 }], lootChance: 0.35 },
    { id: "nb-archers", name: "위군 노병대", exp: 27, gold: 20, units: [u("xbow", "rear-left", T2), u("xbow", "rear-right", T2), u("heavy", "front-center", T2)], loot: [{ id: "horn-bow", weight: 1 }, { id: "fire-pot", weight: 1 }], lootChance: 0.35 },
    { id: "nb-raiders", name: "보급로 습격대", exp: 46, gold: 30, units: [u("raider", "front-left", T3), u("raider", "front-right", T3), u("xbow", "rear-left", T3)], loot: [{ id: "rice-sack", weight: 3 }, { id: "elixir", weight: 1 }], lootChance: 0.45 },
    { id: "nb-wuzhang", name: "오장원 수비대", exp: 48, gold: 32, units: [u("heavy", "front-left", T3), u("heavy", "front-right", T3), u("xbow", "rear-left", T3), u("xbow", "rear-right", T3)], loot: [{ id: "dragon-armor", weight: 1 }, { id: "medicine", weight: 2 }], lootChance: 0.4 },
    { id: "nb-elite", name: "위군 정예", exp: 47, gold: 30, units: [u("cav", "front-left", T3), u("inf", "front-center", T3), u("cav", "front-right", T3), u("xbow", "rear-left", T3)], loot: [{ id: "ancient-blade", weight: 1 }, { id: "treatment-kit", weight: 1 }], lootChance: 0.4 },
    // bosses
    { id: "boss-jiang-wei", name: "천수의 강유", boss: true, exp: 80, gold: 60, duel: { unitIndex: 0, penalty: 0.5 }, recruit: { characterId: "jiang-wei", chance: 0.5 },
        units: [boss("강유", [290, 104, 96, 104, 90], "melee", ["jw-e-spear"], "front-center"), u("inf", "front-left", T1 * 1.1), u("xbow", "rear-left", T1 * 1.1)], loot: [{ id: "tiger-tally", weight: 1 }], lootChance: 1 },
    { id: "boss-zhang-he", name: "가정의 장합", boss: true, exp: 140, gold: 100, recruit: { characterId: "zhang-he", chance: 0.3 },
        units: [boss("장합", [380, 116, 104, 112, 80], "melee", ["zh-e-flank", "wei-e-halberd"], "front-center"), u("cav", "front-left", T2), u("cav", "front-right", T2), u("xbow", "rear-left", T2)], loot: [{ id: "dragon-armor", weight: 1 }], lootChance: 1 },
    { id: "boss-sima-yi", name: "오장원 사마의", boss: true, exp: 60, gold: 40, nextPhase: "boss-sima-yi-2",
        units: [boss("사마의", [460, 98, 116, 100, 130], "ranged", ["sy-e-wait", "wei-e-crossbow"], "rear-left"), u("heavy", "front-left", T3), u("heavy", "front-right", T3), u("xbow", "rear-right", T3)] },
    { id: "boss-sima-yi-2", name: "낭고상 사마의", boss: true, exp: 0, gold: 0, phaseScene: "nb-sima-rage",
        units: [boss("사마의", [320, 100, 112, 104, 134], "ranged", ["sy-e-wait", "sy-e-wolf"], "rear-left"), u("cav", "front-center", T3)] },
];
const scenes = [
    { id: "nb-intro", title: "출사표",
        lines: [
            { name: "해설", text: "건흥 6년, 제갈량이 북벌의 깃발을 올렸다. 기산으로 나아가 장안을 노린다." },
            { speaker: "zhuge-liang", name: "제갈량", text: "신은 몸을 굽혀 온 힘을 다하여, 죽은 뒤에야 그치겠습니다." },
        ],
        variants: {
            "cao-cao": [{ name: "해설", text: "위는 조예의 시대. 촉의 북벌을 막기 위해 사마의가 다시 기용된다." }, { speaker: "zhuge-liang", name: "제갈량", text: "죽은 뒤에야 그치겠습니다." }],
            "sun-quan": [{ name: "해설", text: "손권은 황제를 칭하고 촉과 동맹을 다졌다. 북쪽 전선의 승패가 오의 운명도 좌우한다." }, { speaker: "zhuge-liang", name: "제갈량", text: "죽은 뒤에야 그치겠습니다." }],
            "sima-yi": [{ speaker: "sima-yi", name: "사마의", text: "제갈량은 신중하나 결단이 부족하다. 지키기만 하면 저절로 무너진다." }],
        } },
    { id: "nb-jiang-wei-down", title: "기린아",
        lines: [{ speaker: "zhuge-liang", name: "제갈량", text: "내 평생의 병법을 전할 사람을 이제야 만났구나." }, { name: "해설", text: "천수의 젊은 장수 강유가 창을 거두었다." }] },
    { id: "nb-f6", title: "가정",
        lines: [
            { name: "해설", text: "보급로의 요충 가정. 이곳을 지키지 못하면 북벌 전체가 무너진다." },
            { name: "해설", text: "위군의 공세가 파도처럼 이어진다. 버티며 길을 찾아라. (상단 '공세')" },
        ],
        choices: [
            { label: "길목에 진을 친다 (정석)", effects: [{ kind: "heal", ratio: 0.2 }] },
            { label: "산 위에 진을 친다 (마속의 안)", effects: [{ kind: "exp", amount: 50 }, { kind: "food", amount: -15 }] },
        ] },
    { id: "nb-zhang-he-down", title: "읍참마속",
        lines: [{ name: "해설", text: "장합을 물리쳤지만 가정은 이미 흔들렸다. 군율을 세우기 위해 눈물을 머금고 마속을 벤다." }] },
    { id: "nb-f11", title: "목우유마",
        lines: [{ name: "해설", text: "험한 잔도를 넘는 보급 수레, 목우와 유마가 군량을 실어 나른다. 위군은 그 보급로를 노린다. (상단 '보급')" }] },
    { id: "nb-sima-rage", title: "죽은 공명이 산 중달을 쫓다",
        lines: [{ speaker: "사마의", name: "사마의", text: "목상이었다고…? 아직 끝나지 않았다. 내 목이 붙어 있는지 확인해 보아라!" }] },
    { id: "nb-sima-down", title: "오장원의 별",
        lines: [
            { name: "해설", text: "가을바람이 부는 오장원. 하늘의 큰 별 하나가 진영 위로 떨어졌다." },
            { speaker: "zhuge-liang", name: "제갈량", text: "다시는 적을 치지 못하겠구나… 유유창천이여, 어찌 이리도 끝이 없는가." },
        ] },
    { id: "nb-outro", title: "에필로그 — 천하의 끝",
        lines: [
            { name: "해설", text: "제갈량이 떠나고, 삼국의 영웅들도 하나둘 역사 속으로 사라졌다." },
            { name: "해설", text: "263년 촉한이, 280년 오가 무너지고, 천하는 사마씨의 진으로 하나가 되었다." },
            { name: "해설", text: "그러나 도원의 맹세와 적벽의 불길, 오장원의 별은 이야기로 남아 오늘까지 전해진다." },
            { name: "해설", text: "— 삼국지 미스터리 던전, 끝. 명성을 높여 다시 도전할 수 있다. —" },
        ],
        variants: {
            "liu-bei": [
                { speaker: "liu-bei", name: "유비", text: "(꿈속에서) 운장, 익덕… 공명. 우리가 꿈꾼 한실의 부흥은 끝내 이루지 못했으나, 그 뜻은 남으리라." },
                { name: "해설", text: "280년, 천하는 진으로 하나가 되었다. 그러나 도원의 맹세는 이야기로 남았다." },
                { name: "해설", text: "— 삼국지 미스터리 던전, 끝. 명성을 높여 다시 도전할 수 있다. —" },
            ],
            "cao-cao": [
                { speaker: "cao-cao", name: "조조", text: "(꿈속에서) 천하가 나를 저버릴지언정, 내가 천하를 저버리지는 않겠다. 위의 기틀은 내가 세웠다." },
                { name: "해설", text: "그러나 그 위를 이은 것은 사마씨였다. 280년, 진이 천하를 하나로 묶었다." },
                { name: "해설", text: "— 삼국지 미스터리 던전, 끝. 명성을 높여 다시 도전할 수 있다. —" },
            ],
            "sun-quan": [
                { speaker: "sun-quan", name: "손권", text: "(꿈속에서) 강동은 끝까지 강동이었다. 아버님, 형님, 부끄럽지 않게 지켰습니다." },
                { name: "해설", text: "280년, 마지막까지 버틴 오도 무너지고 천하는 진으로 하나가 되었다." },
                { name: "해설", text: "— 삼국지 미스터리 던전, 끝. 명성을 높여 다시 도전할 수 있다. —" },
            ],
            "sima-yi": [
                { speaker: "sima-yi", name: "사마의", text: "기다린 자가 이긴다. 내 자손이 천하를 거두리라." },
                { name: "해설", text: "280년, 사마염의 진이 오를 멸하고 천하를 통일했다." },
                { name: "해설", text: "— 삼국지 미스터리 던전, 끝. 명성을 높여 다시 도전할 수 있다. —" },
            ],
        } },
];
const events = [
    { id: "ev-nb-empty-fort", title: "공성계", text: "성문을 활짝 열고 성루에서 거문고를 탄다. 적이 의심하여 물러날 것인가.", choices: [
            { label: "거문고를 탄다", effects: [{ kind: "exp", amount: 45 }, { kind: "damage", ratio: 0.05 }] },
            { label: "성문을 닫는다", effects: [{ kind: "heal", ratio: 0.2 }] }
        ] },
    { id: "ev-nb-wheat", title: "농서의 보리", text: "농서의 보리가 익었다. 위군보다 먼저 거둘 수 있을까.", choices: [
            { label: "서둘러 거둔다", effects: [{ kind: "food", amount: 25 }, { kind: "damage", ratio: 0.05 }] },
            { label: "포기한다", effects: [] }
        ] },
    { id: "ev-nb-dress", title: "여인의 옷", text: "싸움에 응하지 않는 적장에게 여인의 옷을 보내 도발해 볼까.", choices: [
            { label: "보낸다", effects: [{ kind: "exp", amount: 30 }] },
            { label: "점잖게 기다린다", effects: [{ kind: "food", amount: 10 }] }
        ] },
];
const EVENTS = [{ id: "ev-nb-empty-fort", weight: 1 }, { id: "ev-nb-wheat", weight: 2 }, { id: "ev-nb-dress", weight: 2 }, { id: "ev-shrine", weight: 1 }, { id: "ev-caravan", weight: 1 }];
const SIEGE = { type: "siege-waves", params: { interval: 40 } };
const OX = { type: "wooden-ox", params: { interval: 30, food: 6, raidEvery: 2 } };
const AUTUMN = [{ id: "strong-wind", weight: 2 }, { id: "night", weight: 2 }, { id: "fog", weight: 1 }];
function nbFloor(depth) {
    const withEvents = (items, count, recruit, event) => objects(items, count, recruit, event).map((spec) => spec.kind === "event" ? { ...spec, pool: EVENTS } : spec);
    if (depth === 5)
        return { depth, enemyGroups: [{ id: "nb-squad", weight: 1 }], enemyCount: [2, 3], traps: BASIC_TRAPS, trapCount: [1, 2], bossGroupId: "boss-jiang-wei", safeZoneAfter: true, objects: withEvents(ITEM_POOL_EARLY, [1, 2], 0, 0) };
    if (depth === 10)
        return { depth, enemyGroups: [{ id: "nb-assault", weight: 1 }], enemyCount: [2, 3], traps: BASIC_TRAPS, trapCount: [1, 2], bossGroupId: "boss-zhang-he", safeZoneAfter: true, objects: withEvents(ITEM_POOL_MID, [1, 2], 0, 0), mechanics: [SIEGE] };
    if (depth === 15)
        return { depth, enemyGroups: [{ id: "nb-wuzhang", weight: 1 }, { id: "nb-elite", weight: 1 }], enemyCount: [2, 3], traps: BASIC_TRAPS, trapCount: [1, 2], bossGroupId: "boss-sima-yi", objects: withEvents(ITEM_POOL_LATE, [1, 2], 0, 0), modifierChance: 0.6, modifiers: AUTUMN };
    const tier = depth <= 4 ? 1 : depth <= 9 ? 2 : 3;
    const groups = tier === 1
        ? (depth <= 2 ? [{ id: "nb-pickets", weight: 3 }, { id: "nb-squad", weight: 1 }] : [{ id: "nb-pickets", weight: 2 }, { id: "nb-squad", weight: 2 }, { id: "nb-riders", weight: 2 }])
        : tier === 2 ? [{ id: "nb-assault", weight: 2 }, { id: "nb-cavalry", weight: 2 }, { id: "nb-archers", weight: 2 }]
            : [{ id: "nb-raiders", weight: 3 }, { id: "nb-wuzhang", weight: 2 }, { id: "nb-elite", weight: 2 }];
    return {
        depth, enemyGroups: groups, enemyCount: tier === 1 ? [3, 4] : [3, 5], traps: BASIC_TRAPS, trapCount: [2, 2 + tier],
        objects: withEvents(tier === 1 ? ITEM_POOL_EARLY : tier === 2 ? ITEM_POOL_MID : ITEM_POOL_LATE, [2, 3], depth >= 2 && depth <= 12 ? 0.3 : 0, 0.35),
        ...(tier === 1 ? { modifierChance: depth === 1 ? 0 : 0.3, modifiers: MODIFIERS }
            : tier === 2 ? { mechanics: [SIEGE], modifierChance: 0.3, modifiers: MODIFIERS }
                : { mechanics: [OX], modifierChance: 0.5, modifiers: AUTUMN }),
    };
}
export const E9_NORTHERN = {
    campaign: {
        id: ID, name: "북벌", order: 9, era: "228–234",
        summary: "출사표와 함께 시작된 마지막 원정. 천수의 강유, 가정의 장합, 그리고 오장원의 사마의. — 엔딩",
        scenes: {
            intro: "nb-intro", outro: "nb-outro", floorEnter: { 6: "nb-f6", 11: "nb-f11" },
            bossDefeated: { "boss-jiang-wei": "nb-jiang-wei-down", "boss-zhang-he": "nb-zhang-he-down", "boss-sima-yi-2": "nb-sima-down" },
        },
        floors: Array.from({ length: 15 }, (_, index) => nbFloor(index + 1)),
        shopItems: [{ id: "bun", weight: 3 }, { id: "rice-sack", weight: 2 }, { id: "herb", weight: 3 }, { id: "medicine", weight: 2 }, { id: "treatment-kit", weight: 2 }, { id: "fire-pot", weight: 1 }, { id: "elixir", weight: 1 }, { id: "scout-map", weight: 1 }],
        shopEquipment: [{ id: "long-spear", weight: 1 }, { id: "horn-bow", weight: 1 }, { id: "war-fan", weight: 1 }, { id: "scale-armor", weight: 1 }, { id: "tiger-tally", weight: 1 }, { id: "dragon-armor", weight: 1 }],
    },
    characters, skills, skillNames, traits, enemyGroups, events, scenes,
    unlocks: [
        { id: "u-northern", condition: { kind: "clear-campaign", campaignId: "nanman" }, unlock: { campaignId: ID } },
        { id: "u-deng-ai", condition: { kind: "reach-depth", campaignId: ID, depth: 12 }, unlock: { characterId: "deng-ai" } },
        { id: "u-sima-yi", condition: { kind: "clear-campaign", campaignId: ID }, unlock: { characterId: "sima-yi", achievement: "오장원 — 삼국지 완주" } },
    ],
};
//# sourceMappingURL=e9-northern.js.map