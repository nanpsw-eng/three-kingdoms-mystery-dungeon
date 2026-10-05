// Functional story UI (S0): dialogue scenes and duel challenges. Visual design is owned by Codex
// (STORY_EXPANSION_PLAN §6) — keep markup simple and class-based so style.css can restyle it.
import type { PendingDecision, RunCommand, RunEngine } from "../../src/index.js";

export interface StoryUi {
  readonly run: RunEngine;
  readonly act: (command: RunCommand) => void;
  readonly render: () => void;
  readonly portrait: (key: string, size: number, alt?: string) => HTMLElement;
}

function el(tag: string, cls: string, ...children: (Node | string | null)[]): HTMLElement {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  for (const child of children) if (child !== null) node.append(child);
  return node;
}
/** Portrait beside text; inline layout so it works before Codex styles `.story-line`. */
function row(cls: string, ...children: (Node | string | null)[]): HTMLElement {
  const node = el("div", cls, ...children);
  node.style.cssText = "display:flex;gap:10px;align-items:flex-start;margin:8px 0";
  return node;
}
function btn(label: string, onclick: () => void, cls = ""): HTMLButtonElement {
  const node = document.createElement("button");
  node.textContent = label;
  if (cls) node.className = cls;
  node.addEventListener("click", onclick);
  return node;
}

export function isStoryPhase(phase: string): boolean {
  return phase === "scene" || phase === "duel";
}

/** Returns the sheet content for a pending scene or duel. */
export function storySheet(ui: StoryUi, pending: PendingDecision): HTMLElement[] {
  if (pending.kind === "scene") return sceneSheet(ui, pending.sceneId);
  if (pending.kind === "duel") return duelSheet(ui, pending.groupId, pending.champion);
  return [];
}

/** Line-by-line reveal state for the scene on screen (reset when a new scene id appears). */
let reveal = { key: "", shown: 1 };

function sceneSheet(ui: StoryUi, sceneId: string): HTMLElement[] {
  const scene = ui.run.scene(sceneId);
  if (scene === undefined) return [btn("계속", () => { ui.act({ type: "scene" }); ui.render(); }, "primary")];
  // A scene can repeat across runs, so key the reveal state by the run's state as well.
  const key = sceneId + "@" + ui.run.stateHash();
  if (reveal.key !== key) reveal = { key, shown: 1 };
  const total = scene.lines.length;
  const done = reveal.shown >= total;
  const lines = scene.lines.slice(0, reveal.shown).map((line) => row("story-line" + (line.speaker ? "" : " narration"),
    line.speaker ? ui.portrait(line.speaker, 48, line.name) : null,
    el("div", "story-text", line.speaker ? el("b", "", line.name) : null, el("p", "", line.text))));
  const next = (): void => { reveal.shown = Math.min(total, reveal.shown + 1); ui.render(); };
  const finish = (): void => { ui.act({ type: "scene" }); ui.render(); };
  const box = el("div", "story-scene", scene.title ? el("h2", "", scene.title) : null, ...lines);
  if (!done) { box.style.cursor = "pointer"; box.addEventListener("click", next); }
  const progress = el("small", "muted", `${Math.min(reveal.shown, total)} / ${total}`);
  let actions: HTMLElement[];
  if (!done) {
    const skip = btn("건너뛰기", () => { if (scene.choices.length > 0) { reveal.shown = total; ui.render(); } else finish(); });
    const bar = el("div", "row", btn("다음 ▶", next, "primary"), skip);
    bar.style.cssText = "display:grid;grid-template-columns:2fr 1fr;gap:6px";
    actions = [progress, bar];
  } else {
    actions = scene.choices.length > 0
      ? scene.choices.map((label, index) => btn(label, () => { ui.act({ type: "scene", choice: index }); ui.render(); }, "choice"))
      : [btn("계속", finish, "primary")];
  }
  return [box, ...actions];
}

function duelSheet(ui: StoryUi, groupId: string, champion: string): HTMLElement[] {
  const group = ui.run.group(groupId);
  const unit = group?.units.find((candidate) => candidate.name === champion);
  const fighters = ui.run.party().filter((member) => member.hp > 0);
  return [
    el("div", "story-scene duel",
      el("h2", "", "일기토 — " + champion),
      row("story-line", ui.portrait(champion, 48, champion), el("div", "story-text", el("b", "", champion), el("p", "", "나와 겨룰 자가 있느냐!"))),
      el("p", "muted", unit ? `HP ${unit.stats.maxHp} · ATK ${unit.stats.atk} · DEF ${unit.stats.def} · SPD ${unit.stats.spd}` : ""),
      el("p", "muted", "이기면 적장이 큰 부상을 입은 채 전투를 시작한다. 지면 나선 장수는 HP 1로 버티고 적의 기세가 오른다.")),
    ...fighters.map((member) => {
      const choice = btn("", () => { ui.act({ type: "duel", characterId: member.characterId }); ui.render(); }, "choice");
      choice.append(el("span", "", el("b", "", member.name + " 출전"), el("small", "", `HP ${member.hp}/${member.maxHp} · ATK ${member.stats.atk} · DEF ${member.stats.def} · SPD ${member.stats.spd}`)));
      return choice;
    }),
    btn("응하지 않는다", () => { ui.act({ type: "duel", characterId: null }); ui.render(); }),
  ];
}

/**
 * Art fallbacks for characters/enemies added by story campaigns until Codex draws them
 * (remove an entry once `web/assets` or portraits.ts has art for that key).
 */
const ART_ALIASES: Readonly<Record<string, string>> = {
  // E2 playable
  "lu-bu": "zhang-liao", "sun-jian": "sun-quan", "yuan-shao": "cao-cao", "cao-ren": "xiahou-dun", "hua-xiong": "화웅",
  // E2 enemies
  "여포": "zhang-liao", "동탁": "장각", "이유": "장량", "방화병": "황건 술사", "서량 친위대": "서량 기병",
  // E3 서주
  "chen-gong": "jia-xu", "zang-ba": "zhang-fei", "gao-shun": "xiahou-dun", "mi-zhu": "hua-tuo",
  "원술군 보병": "동탁군 극병", "원술군 궁병": "동탁군 궁병", "산적": "황건 기병", "병주 기병": "서량 기병", "함진영": "관문 수비대",
  "수군": "황건 술사", "기령": "화웅", "원술": "장량", "고순": "xiahou-dun", "진궁": "jia-xu",
  // E4 관도
  "xu-chu": "zhang-fei", "dian-wei": "xiahou-dun", "xun-yu": "zhuge-liang", "yan-liang": "zhang-liao", "wen-chou": "taishi-ci",
  "하북 보병": "동탁군 극병", "하북 강노병": "동탁군 궁병", "하북 기병": "서량 기병", "조조군 관문병": "관문 수비대", "오소 수비병": "황건 창병",
  "하북 대극사": "관문 수비대", "공수": "화웅", "맹탄": "화웅", "변희": "화웅", "왕식": "화웅", "안량": "zhang-liao", "문추": "taishi-ci", "원소": "cao-cao",
  // E5 적벽
  "lu-su": "hua-tuo", "huang-gai": "huang-zhong", "pang-tong": "jia-xu", "cheng-pu": "xiahou-dun",
  "조조군 보병": "동탁군 극병", "청주병": "황건 창병", "호표기": "서량 기병", "형주 수군": "황건 술사", "몽충": "관문 수비대",
  "조조군 궁병": "동탁군 궁병", "하후은": "화웅", "채모": "장량", "장윤": "화웅", "조조": "cao-cao", "허저": "zhang-fei",
  // E6 형주·익주
  "ma-chao": "zhao-yun", "wei-yan": "guan-yu", "fa-zheng": "jia-xu", "xu-huang": "xiahou-dun", "xiahou-yuan": "taishi-ci",
  "유장군 보병": "황건 창병", "서량 철기": "서량 기병", "위군 정예": "동탁군 극병", "위군 궁병": "동탁군 궁병", "복병": "황건 기병",
  "칠군 병사": "관문 수비대", "마초": "zhao-yun", "하후연": "taishi-ci", "방덕": "화웅", "우금": "xiahou-dun", "조인": "xiahou-dun",
  // E7 이릉
  "lu-xun": "zhou-yu", "lu-meng": "zhang-liao", "zhou-tai": "zhang-fei",
  "오군 보병": "황건 창병", "오군 궁병": "동탁군 궁병", "오군 복병": "황건 기병", "강동 수군": "황건 술사", "해번군": "관문 수비대",
  "감녕": "gan-ning", "주연": "taishi-ci", "주태": "zhang-fei", "육손": "zhou-yu",
  // E8 남만
  "meng-huo": "zhang-fei", "zhu-rong": "gan-ning", "ma-su": "jia-xu",
  "남만병": "황건 기병", "독침병": "황건 궁병", "코끼리 부대": "관문 수비대", "등갑병": "관문 수비대", "남만 무녀": "태평도 신도",
  "맹획": "zhang-fei", "맹우": "화웅", "축융": "gan-ning", "올돌골": "화웅",
  // E9 북벌
  "sima-yi": "cao-cao", "jiang-wei": "zhao-yun", "zhang-he": "zhang-liao", "deng-ai": "xiahou-dun",
  "위군 보병": "동탁군 극병", "위군 노병": "동탁군 궁병", "위군 기병": "서량 기병", "중장 보병": "관문 수비대", "보급로 습격대": "황건 기병",
  "강유": "zhao-yun", "장합": "zhang-liao", "사마의": "cao-cao",
};
export function artKey(key: string): string {
  return ART_ALIASES[key] ?? key;
}

export interface TimelineEntry {
  readonly id: string;
  readonly name: string;
  readonly era: string;
  readonly summary: string;
  readonly floors: number;
  readonly locked: boolean;
  readonly selected: boolean;
  readonly best: number;
  readonly cleared: boolean;
}

/** X2 연표: campaigns in historical order with progress; `onPick` selects an unlocked campaign. */
export function timelinePanel(entries: readonly TimelineEntry[], onPick: (id: string) => void): HTMLElement {
  const list = el("div", "campaign-timeline");
  list.style.cssText = "display:grid;gap:6px";
  for (const entry of entries) {
    const item = btn("", () => onPick(entry.id), "choice campaign-item" + (entry.selected ? " selected" : "") + (entry.locked ? " locked" : ""));
    item.disabled = entry.locked;
    item.style.cssText = "display:block;width:100%;max-width:100%;white-space:normal;overflow-wrap:anywhere;text-align:left";
    const progress = entry.cleared ? " · 평정" : entry.best > 0 ? ` · 최고 ${entry.best}/${entry.floors}F` : "";
    item.append(el("span", "",
      el("b", "", (entry.locked ? "🔒 " : "") + entry.era + " " + entry.name),
      el("small", "", entry.locked ? "이전 전역을 평정하면 열린다." : `${entry.floors}층${progress} — ${entry.summary}`)));
    list.append(item);
  }
  return el("div", "panel", el("h2", "", "전역 연표"), list);
}

/** X8 명성: choose the renown level for the selected campaign (shown once level 1 is unlocked). */
export function renownPanel(unlocked: number, selected: number, onPick: (level: number) => void): HTMLElement | null {
  if (unlocked <= 0) return null;
  const row = el("div", "row");
  row.style.cssText = "display:flex;gap:6px;flex-wrap:wrap";
  for (let level = 0; level <= unlocked; level += 1) {
    row.append(btn(level === 0 ? "일반" : "명성 " + level, () => onPick(level), level === selected ? "selected" : ""));
  }
  return el("div", "panel", el("h2", "", "명성"), el("p", "muted", "평정한 전역을 더 높은 명성으로 재도전한다. 명성 1단계마다 적 능력치 +4%, 전투 보상 +15%."), row);
}
