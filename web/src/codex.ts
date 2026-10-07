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
  readonly bossPortrait: (groupId: string, revealed: boolean) => HTMLElement;
  readonly itemIcon: (id: string, revealed: boolean) => HTMLElement;
}

export function codexScreen(ui: CodexUi): HTMLElement {
  const { view } = ui;
  const count = (done: number, total: number) => ` ${done}/${total}`;
  const tabs = el("nav", "codex-tabs");
  tabs.setAttribute("aria-label", "도감 분류");
  const tabDefs: [Tab, string][] = [
    ["characters", "장수" + count(view.characters.filter((c) => c.unlocked).length, view.characters.length)],
    ["bosses", "보스" + count(view.bosses.filter((b) => b.defeated).length, view.bosses.length)],
    ["achievements", "업적" + count(view.achievements.filter((a) => a.earned).length, view.achievements.length)],
    ["items", "물품" + count(view.items.filter((i) => i.seen).length, view.items.length)],
  ];
  for (const [id, label] of tabDefs) {
    const control = btn(label, () => {
      tab = id; openId = null; ui.render();
      document.getElementById("codex-tab-" + id)?.focus({ preventScroll: true });
    }, tab === id ? "selected" : "");
    control.id = "codex-tab-" + id;
    control.setAttribute("aria-pressed", String(tab === id));
    tabs.append(control);
  }
  const body = el("div", "codex-body");
  if (tab === "characters") {
    for (const c of view.characters) {
      const open = openId === c.id && c.unlocked;
      const row = btn("", () => {
        if (!c.unlocked) return;
        const scrollTop = body.scrollTop;
        openId = open ? null : c.id; ui.render();
        const nextBody = document.querySelector<HTMLElement>(".codex-body");
        if (nextBody) nextBody.scrollTop = scrollTop;
        document.getElementById("codex-character-" + c.id)?.focus({ preventScroll: true });
      }, "choice codex-entry codex-character" + (open ? " expanded" : "") + (c.unlocked ? "" : " locked"));
      row.id = "codex-character-" + c.id;
      if (!c.unlocked) row.setAttribute("aria-disabled", "true");
      const portrait = ui.portrait(c.id, open ? 120 : 48, c.name);
      row.setAttribute("aria-expanded", String(open));
      if (!c.unlocked) portrait.style.filter = "grayscale(1) brightness(0.35)";
      const title = (c.kind === "ruler" ? "군주 · " : "") + (c.unlocked ? c.name + " · " + (CLASS[c.characterClass] ?? "") : "미해금 · " + c.name);
      const lines: (Node | string | null)[] = [el("b", "codex-name", title)];
      if (!c.unlocked) lines.push(el("small", "", "해금: " + (c.hint || "?") + (c.campaign ? " (" + c.campaign + ")" : "")));
      else if (!open) lines.push(el("small", "", c.note.slice(0, 40) + (c.note.length > 40 ? "…" : "")));
      else {
        const s = c.stats;
        lines.push(el("small", "", `HP ${s.maxHp} · ATK ${s.atk} · DEF ${s.def} · SPD ${s.spd} · INT ${s.int}`));
        lines.push(el("small", "", "스킬: " + c.skills.join(" · ")));
        lines.push(el("p", "codex-note", "정사 — " + c.note));
      }
      row.append(portrait, el("span", "codex-copy", ...lines));
      body.append(row);
    }
  } else if (tab === "bosses") {
    let current = "";
    for (const b of view.bosses) {
      if (b.campaign !== current) { current = b.campaign; body.append(el("h3", "", current)); }
      body.append(el("div", "codex-entry codex-boss" + (b.defeated ? "" : " locked"), ui.bossPortrait(b.id, b.defeated), el("span", "codex-copy", b.defeated ? b.name : "??? (미격파)")));
    }
  } else if (tab === "achievements") {
    for (const a of view.achievements) body.append(el("div", "codex-entry codex-achievement" + (a.earned ? "" : " locked"), el("span", "achievement-seal" + (a.earned ? " earned" : ""), a.earned ? "達" : "未"), el("span", "codex-copy", el("b", "codex-name", a.name), el("small", "", a.hint))));
  } else {
    const grid = el("div", "");
    grid.className = "codex-items";
    for (const i of view.items) grid.append(el("div", "codex-entry codex-item" + (i.seen ? "" : " locked"), ui.itemIcon(i.id, i.seen), el("span", "", i.seen ? i.name : "???")));
    body.append(grid);
  }
  return el("div", "panel codex", el("div", "codex-header", el("h2", "", "도감 · 업적"), btn("닫기", ui.close)), tabs, body);
}
