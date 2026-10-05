import type { SkillDefinition } from "../battle/action.js";
import type { CharacterDefinition } from "../run/types.js";
import {
  active, allyOne, allyUpTo, cleanse, enemyOne, enemyUpTo, energy, extraAction, heal, physical, revive, self, shift, status, strategy, ultimate,
} from "./skills.js";

// Stats: CHARACTER_ROSTER_MVP.md (BASELINE). Skill names: roster "Skill Direction".
type Row = [id: string, name: string, kind: "ruler" | "general", cls: CharacterDefinition["characterClass"], roles: string[],
  stats: [number, number, number, number, number], skills: string[], traits: string[]];

const ROWS: Row[] = [
  ["liu-bei", "유비", "ruler", "infantry", ["지원", "결속"], [103, 92, 98, 98, 108], ["liu-encourage", "liu-sword", "liu-banner"], ["t-liu-virtue", "t-liu-benevolence", "t-liu-oath"]],
  ["cao-cao", "조조", "ruler", "infantry", ["지휘", "제어"], [100, 103, 96, 105, 112], ["cao-sword", "cao-strategy", "cao-dominion"], ["t-cao-artofwar", "t-cao-ambition", "t-cao-employ"]],
  ["sun-quan", "손권", "ruler", "infantry", ["균형", "지원"], [105, 97, 105, 98, 105], ["sun-encourage", "sun-defense", "sun-unite"], ["t-sun-guard", "t-sun-wealth", "t-sun-jiangdong"]],
  ["guan-yu", "관우", "general", "infantry", ["처형", "반격", "광역"], [112, 116, 108, 98, 90], ["guan-slash", "guan-sweep", "guan-wargod"], ["t-guan-blade", "t-guan-pride", "t-guan-loyal"]],
  ["zhang-fei", "장비", "general", "infantry", ["탱커", "도발", "기절"], [120, 112, 118, 86, 78], ["zhang-roar", "zhang-bridge", "zhang-myriad"], ["t-zf-roar", "t-zf-iron", "t-zf-fury"]],
  ["zhao-yun", "조운", "general", "cavalry", ["돌파", "회피", "연속행동"], [104, 108, 100, 120, 90], ["zhao-break", "zhao-seven", "zhao-sevenfold"], ["t-zy-dragon", "t-zy-swift", "t-zy-guardian"]],
  ["huang-zhong", "황충", "general", "archer", ["후열저격", "치명타", "처형"], [94, 113, 90, 104, 88], ["huang-hundred", "huang-veteran", "huang-dingjun"], ["t-hz-eagle", "t-hz-veteran", "t-hz-steady"]],
  ["zhuge-liang", "제갈량", "general", "strategist", ["제어", "화공", "행동지연"], [88, 78, 84, 102, 120], ["zhuge-fire", "zhuge-maze", "zhuge-formation"], ["t-zg-wind", "t-zg-insight", "t-zg-bagua"]],
  ["zhang-liao", "장료", "general", "cavalry", ["기습", "돌파", "협공"], [106, 111, 103, 114, 96], ["liao-raid", "liao-charge", "liao-xiaoyao"], ["t-zl-raid", "t-zl-charge", "t-zl-terror"]],
  ["xiahou-dun", "하후돈", "general", "infantry", ["탱커", "반격", "생존"], [118, 108, 117, 88, 82], ["xiahou-wall", "xiahou-revenge", "xiahou-fierce"], ["t-xd-wall", "t-xd-onefeye", "t-xd-endure"]],
  ["jia-xu", "가후", "general", "strategist", ["독", "혼란", "디버프"], [90, 80, 88, 101, 118], ["jia-poison", "jia-discord", "jia-ruin"], ["t-jx-venom", "t-jx-schemer", "t-jx-survivor"]],
  ["taishi-ci", "태사자", "general", "archer", ["연사", "후열저격", "공격"], [98, 111, 94, 108, 88], ["taishi-volley", "taishi-bow", "taishi-shenting"], ["t-tc-volley", "t-tc-duel", "t-tc-faith"]],
  ["zhou-yu", "주유", "general", "strategist", ["화공", "광역", "제어"], [92, 84, 90, 106, 117], ["zhou-fire", "zhou-wind", "zhou-redcliff"], ["t-zhy-fire", "t-zhy-elegance", "t-zhy-command"]],
  ["gan-ning", "감녕", "general", "cavalry", ["기습", "치명타", "약탈"], [101, 113, 92, 116, 85], ["gan-night", "gan-bells", "gan-hundred"], ["t-gn-pirate", "t-gn-plunder", "t-gn-night"]],
  ["hua-tuo", "화타", "general", "support", ["회복", "해제", "부활"], [96, 70, 90, 100, 120], ["hua-salve", "hua-detox", "hua-qingnang"], ["t-ht-mafei", "t-ht-five", "t-ht-herbal"]],
];

const DEFAULT_SLOT: Record<CharacterDefinition["characterClass"], CharacterDefinition["defaultSlot"]> = {
  infantry: "front-center", cavalry: "front-left", archer: "rear-left", strategist: "rear-right", support: "rear-right",
};

export type CharacterRow = Row;
export function defineCharacters(rows: readonly Row[]): CharacterDefinition[] {
  return rows.map(([id, name, kind, cls, roles, [maxHp, atk, def, spd, int], skills, traits]) => ({
    id, name, kind, characterClass: cls, roleTags: roles, stats: { maxHp, atk, def, spd, int },
    reach: cls === "archer" || cls === "strategist" || cls === "support" ? "ranged" : "melee",
    skillIds: skills, traitIds: traits, defaultSlot: kind === "ruler" ? "front-right" : DEFAULT_SLOT[cls],
  }));
}

export const CHARACTERS: readonly CharacterDefinition[] = defineCharacters(ROWS);

export const CHARACTER_SKILLS: readonly SkillDefinition[] = [
  // 유비: 격려 / 인의검 / 한실의 기치
  active("liu-encourage", 30, allyOne(), [heal(22), energy(20)]),
  active("liu-sword", 30, enemyOne("front"), [physical(34)]),
  ultimate("liu-banner", allyUpTo(5), [heal(26), energy(15)]),
  // 조조: 간웅의 검 / 용병지략 / 위무천하
  active("cao-sword", 30, enemyOne("front"), [physical(36), status("defense-down", 2, { magnitude: 0.25 })]),
  active("cao-strategy", 30, allyOne(), [extraAction("targets", "interrupt"), heal(18)]),
  ultimate("cao-dominion", enemyUpTo(5), [strategy(48, { modifier: 0.8 }), shift(25)]),
  // 손권: 강동의 격려 / 수성지휘 / 강동결집
  active("sun-encourage", 25, allyOne(), [energy(25), heal(12)]),
  active("sun-defense", 30, allyOne(), [cleanse(), heal(20)]),
  ultimate("sun-unite", allyUpTo(5), [heal(30), cleanse()]),
  // 관우: 청룡참 / 위진천하 / 무신강림
  active("guan-slash", 35, enemyOne("front"), [physical(40)]),
  active("guan-sweep", 40, enemyUpTo(3, "front"), [physical(34, { modifier: 0.8 })]),
  ultimate("guan-wargod", enemyOne(), [physical(55, { critChance: 0.3 })]),
  // 장비: 일갈 / 장판교 / 만인지적
  active("zhang-roar", 25, enemyUpTo(3, "front"), [status("taunt", 2)]),
  active("zhang-bridge", 40, enemyOne("front"), [physical(30), status("stun", 1)]),
  ultimate("zhang-myriad", enemyUpTo(5), [physical(44, { modifier: 0.75 }), status("taunt", 2)]),
  // 조운: 돌파 / 칠진출입 / 칠진칠출
  active("zhao-break", 30, enemyOne(), [physical(34)]),
  active("zhao-seven", 35, self, [extraAction("actor")]),
  ultimate("zhao-sevenfold", enemyUpTo(3), [physical(46, { modifier: 0.8 }), extraAction("actor")]),
  // 황충: 백보천양 / 노익장 / 정군산 일격
  active("huang-hundred", 35, enemyOne(), [physical(38, { critChance: 0.3 })]),
  active("huang-veteran", 25, enemyOne(), [physical(30), energy(15, "actor")]),
  ultimate("huang-dingjun", enemyOne(), [physical(55, { critChance: 0.5 })]),
  // 제갈량: 화계 / 팔진교란 / 팔진도
  active("zhuge-fire", 35, enemyUpTo(2), [strategy(32, { modifier: 0.8 }), status("burn", 2, { magnitude: 4 })]),
  active("zhuge-maze", 30, enemyOne(), [shift(35), status("confusion", 1)]),
  ultimate("zhuge-formation", enemyUpTo(5), [strategy(38, { modifier: 0.7 }), status("confusion", 1), status("timeline-delay", 1, { magnitude: 20 })]),
  // 장료: 기습돌격 / 돌진 / 소요진 돌파
  active("liao-raid", 30, enemyOne(), [physical(34), shift(20)]),
  active("liao-charge", 35, enemyOne("front"), [physical(38)]),
  ultimate("liao-xiaoyao", enemyUpTo(3), [physical(48, { modifier: 0.8 })]),
  // 하후돈: 철벽 / 복수의 일격 / 맹하후
  active("xiahou-wall", 25, enemyUpTo(3, "front"), [status("taunt", 2), heal(15, "actor")]),
  active("xiahou-revenge", 35, enemyOne("front"), [physical(40)]),
  ultimate("xiahou-fierce", enemyOne("front"), [physical(50), heal(30, "actor")]),
  // 가후: 독계 / 이간계 / 완계
  active("jia-poison", 30, enemyOne(), [strategy(20), status("poison", 3, { stacks: 2, magnitude: 5 })]),
  active("jia-discord", 35, enemyOne(), [status("confusion", 1), status("defense-down", 2, { magnitude: 0.2 })]),
  ultimate("jia-ruin", enemyUpTo(5), [status("poison", 3, { stacks: 2, magnitude: 5 }), status("defense-down", 2, { magnitude: 0.25 })]),
  // 태사자: 연사 / 강궁 / 신정의 활
  active("taishi-volley", 30, enemyUpTo(2), [physical(28, { modifier: 0.85 })]),
  active("taishi-bow", 35, enemyOne(), [physical(36, { critChance: 0.15 })]),
  ultimate("taishi-shenting", enemyUpTo(3), [physical(46, { modifier: 0.8 })]),
  // 주유: 화공 / 동남풍 / 적벽화공
  active("zhou-fire", 40, enemyUpTo(3), [strategy(32, { modifier: 0.75 }), status("burn", 2, { magnitude: 4 })]),
  active("zhou-wind", 30, allyUpTo(2), [energy(20)]),
  ultimate("zhou-redcliff", enemyUpTo(5), [strategy(48, { modifier: 0.75 }), status("burn", 3, { stacks: 3, magnitude: 4 })]),
  // 감녕: 야습 / 금범연격 / 백기겁영
  active("gan-night", 30, enemyOne(), [physical(34, { critChance: 0.25 })]),
  active("gan-bells", 40, enemyOne("front"), [physical(30), extraAction("actor")]),
  ultimate("gan-hundred", enemyUpTo(3), [physical(46, { modifier: 0.8 }), status("bleed", 2, { stacks: 2, magnitude: 4 })]),
  // 화타: 금창술 / 해독 / 청낭비술
  active("hua-salve", 25, allyOne(), [heal(36)]),
  active("hua-detox", 20, allyOne(), [cleanse()]),
  ultimate("hua-qingnang", allyUpTo(2, "any"), [revive(0.5), heal(25)]),
];

export const CHARACTER_SKILL_NAMES: Readonly<Record<string, string>> = {
  "liu-encourage": "격려", "liu-sword": "인의검", "liu-banner": "한실의 기치",
  "cao-sword": "간웅의 검", "cao-strategy": "용병지략", "cao-dominion": "위무천하",
  "sun-encourage": "강동의 격려", "sun-defense": "수성지휘", "sun-unite": "강동결집",
  "guan-slash": "청룡참", "guan-sweep": "위진천하", "guan-wargod": "무신강림",
  "zhang-roar": "일갈", "zhang-bridge": "장판교", "zhang-myriad": "만인지적",
  "zhao-break": "돌파", "zhao-seven": "칠진출입", "zhao-sevenfold": "칠진칠출",
  "huang-hundred": "백보천양", "huang-veteran": "노익장", "huang-dingjun": "정군산 일격",
  "zhuge-fire": "화계", "zhuge-maze": "팔진교란", "zhuge-formation": "팔진도",
  "liao-raid": "기습돌격", "liao-charge": "돌진", "liao-xiaoyao": "소요진 돌파",
  "xiahou-wall": "철벽", "xiahou-revenge": "복수의 일격", "xiahou-fierce": "맹하후",
  "jia-poison": "독계", "jia-discord": "이간계", "jia-ruin": "완계",
  "taishi-volley": "연사", "taishi-bow": "강궁", "taishi-shenting": "신정의 활",
  "zhou-fire": "화공", "zhou-wind": "동남풍", "zhou-redcliff": "적벽화공",
  "gan-night": "야습", "gan-bells": "금범연격", "gan-hundred": "백기겁영",
  "hua-salve": "금창술", "hua-detox": "해독", "hua-qingnang": "청낭비술",
};
