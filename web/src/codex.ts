// 도감·업적 screen (functional UI; visual design is Codex's — keep class-based markup).
import type { CodexView } from "../../src/index.js";

type Tab = "characters" | "bosses" | "achievements" | "items";
let tab: Tab = "characters";
let openId: string | null = null;

const CLASS: Record<string, string> = { infantry: "보병", cavalry: "기병", archer: "궁병", strategist: "책사", support: "지원" };

function el(tag: string, cls: string, ...children: (Node | string | null)[]): HTMLElement {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  for (const child of children) if (child !== null) node.append(child);
  return node;
}
function btn(label: string, onclick: () => void, cls = ""): HTMLButtonElement {
  const node = document.createElement("button");
  node.textContent = label;
  if (cls) node.className = cls;
  node.addEventListener("click", onclick);
  return node;
}

export interface CodexUi {
  readonly view: CodexView;
  readonly render: () => void;
  readonly close: () => void;
  readonly portrait: (key: string, size: number, alt?: string) => HTMLElement;
}

export function codexScreen(ui: CodexUi): HTMLElement {
  const { view } = ui;
  const count = (done: number, total: number) => ` ${done}/${total}`;
  const tabs = el("div", "row");
  tabs.style.cssText = "display:flex;gap:6px;flex-wrap:wrap";
  const tabDefs: [Tab, string][] = [
    ["characters", "장수" + count(view.characters.filter((c) => c.unlocked).length, view.characters.length)],
    ["bosses", "보스" + count(view.bosses.filter((b) => b.defeated).length, view.bosses.length)],
    ["achievements", "업적" + count(view.achievements.filter((a) => a.earned).length, view.achievements.length)],
    ["items", "물품" + count(view.items.filter((i) => i.seen).length, view.items.length)],
  ];
  for (const [id, label] of tabDefs) tabs.append(btn(label, () => { tab = id; openId = null; ui.render(); }, tab === id ? "selected" : ""));
  const body = el("div", "codex-body");
  body.style.cssText = "display:grid;gap:6px";
  if (tab === "characters") {
    for (const c of view.characters) {
      const open = openId === c.id && c.unlocked;
      const row = btn("", () => { openId = open ? null : c.id; ui.render(); }, "choice codex-entry" + (c.unlocked ? "" : " locked"));
      row.style.cssText = "display:flex;gap:10px;align-items:flex-start;width:100%;white-space:normal;text-align:left";
      const portrait = ui.portrait(c.id, open ? 120 : 40, c.name);
      row.setAttribute("aria-expanded", String(open));
      if (!c.unlocked) portrait.style.filter = "grayscale(1) brightness(0.35)";
      const title = (c.kind === "ruler" ? "군주 · " : "") + (c.unlocked ? c.name + " · " + (CLASS[c.characterClass] ?? "") : "🔒 " + c.name);
      const lines: (Node | string | null)[] = [el("b", "", title)];
      if (!c.unlocked) lines.push(el("small", "", "해금: " + (c.hint || "?") + (c.campaign ? " (" + c.campaign + ")" : "")));
      else if (!open) lines.push(el("small", "", c.note.slice(0, 40) + (c.note.length > 40 ? "…" : "")));
      else {
        const s = c.stats;
        lines.push(el("small", "", `HP ${s.maxHp} · ATK ${s.atk} · DEF ${s.def} · SPD ${s.spd} · INT ${s.int}`));
        lines.push(el("small", "", "스킬: " + c.skills.join(" · ")));
        lines.push(el("p", "codex-note", "정사 — " + c.note));
      }
      row.append(portrait, el("span", "", ...lines));
      body.append(row);
    }
  } else if (tab === "bosses") {
    let current = "";
    for (const b of view.bosses) {
      if (b.campaign !== current) { current = b.campaign; body.append(el("h3", "", current)); }
      body.append(el("div", "codex-entry" + (b.defeated ? "" : " locked"), b.defeated ? "⚔ " + b.name : "??? (미격파)"));
    }
  } else if (tab === "achievements") {
    for (const a of view.achievements) body.append(el("div", "codex-entry" + (a.earned ? "" : " locked"), el("b", "", (a.earned ? "🏅 " : "🔒 ") + a.name), el("small", "", " — " + a.hint)));
  } else {
    const grid = el("div", "");
    grid.style.cssText = "display:flex;flex-wrap:wrap;gap:6px";
    for (const i of view.items) grid.append(el("span", "codex-entry" + (i.seen ? "" : " locked"), i.seen ? i.name : "???"));
    body.append(grid);
  }
  return el("div", "panel codex", el("div", "codex-header", el("h2", "", "도감 · 업적"), btn("닫기", ui.close)), tabs, body);
}
