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

function sceneSheet(ui: StoryUi, sceneId: string): HTMLElement[] {
  const scene = ui.run.scene(sceneId);
  if (scene === undefined) return [btn("계속", () => { ui.act({ type: "scene" }); ui.render(); }, "primary")];
  const lines = scene.lines.map((line) => row("story-line" + (line.speaker ? "" : " narration"),
    line.speaker ? ui.portrait(line.speaker, 48, line.name) : null,
    el("div", "story-text", line.speaker ? el("b", "", line.name) : null, el("p", "", line.text))));
  const actions = scene.choices.length > 0
    ? scene.choices.map((label, index) => btn(label, () => { ui.act({ type: "scene", choice: index }); ui.render(); }, "choice"))
    : [btn("계속", () => { ui.act({ type: "scene" }); ui.render(); }, "primary")];
  return [el("div", "story-scene", scene.title ? el("h2", "", scene.title) : null, ...lines), ...actions];
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
