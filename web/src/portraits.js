// Procedural 32×32 bust portraits that share the FigureSpec parts with the 16×16 field sprites.
import { assetPortrait } from "./assets.js";
import { finish, shade } from "./pixel.js";
import { CHARACTER_FIGURES, ENEMY_FIGURES } from "./sprites.js";
const N = 32;
const GOLD = "#e8b84a";
const STEEL = "#c9d2db";
const WOOD = "#8a5a2b";
class P {
    g = Array.from({ length: N }, () => Array(N).fill(null));
    set(x, y, c) { if (x >= 0 && y >= 0 && x < N && y < N)
        this.g[y][x] = c; }
    rect(x, y, w, h, c) { for (let j = 0; j < h; j++)
        for (let i = 0; i < w; i++)
            this.set(x + i, y + j, c); }
    /** Filled ellipse-ish blob. */
    oval(cx, cy, rx, ry, c) {
        for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
            for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
                if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1)
                    this.set(x, y, c);
            }
    }
}
function weaponBehind(p, spec) {
    const wc = spec.weaponColor ?? STEEL;
    switch (spec.weapon) {
        case "guandao":
            p.rect(27, 4, 1, 28, WOOD);
            p.oval(26, 4, 3, 4, wc);
            p.rect(26, 1, 2, 3, wc);
            p.set(27, 9, "#2e7d4f");
            p.set(26, 10, "#2e7d4f");
            break;
        case "snake-spear":
            p.rect(27, 6, 1, 26, "#3a2a1e");
            for (let i = 0; i < 6; i++)
                p.set(27 + (i % 2 ? 1 : -1), i, wc);
            p.set(27, 6, "#c0392b");
            p.set(26, 7, "#c0392b");
            break;
        case "spear":
            p.rect(27, 4, 1, 28, WOOD);
            p.rect(26, 1, 3, 3, wc);
            p.set(27, 0, wc);
            p.set(26, 5, "#c0392b");
            p.set(28, 5, "#c0392b");
            break;
        case "halberd":
            p.rect(27, 3, 1, 29, WOOD);
            p.rect(27, 0, 1, 3, wc);
            p.rect(28, 3, 3, 4, wc);
            p.rect(24, 4, 3, 2, wc);
            break;
        case "bow":
            for (let y = 3; y < 30; y++) {
                const x = 26 + Math.round(Math.sin(((y - 3) / 26) * Math.PI) * 3);
                p.set(x, y, WOOD);
                p.set(x + 1, y, shade(WOOD, -0.3));
            }
            for (let y = 4; y < 29; y++)
                p.set(25, y, "#efe6d2");
            break;
        case "staff":
            p.rect(27, 3, 1, 29, WOOD);
            p.oval(27, 3, 2.5, 2.5, wc);
            p.set(27, 3, "#ffffff");
            break;
        case "great-blade":
            p.rect(26, 8, 2, 24, "#3a2a1e");
            p.rect(25, 0, 4, 10, wc);
            p.rect(29, 2, 1, 7, shade(wc, -0.3));
            break;
        case "sword":
        case "twin-swords":
        case "bells":
            p.rect(26, 2, 2, 16, wc);
            p.rect(25, 17, 4, 1, GOLD);
            p.rect(26, 18, 2, 3, "#5e3a1c");
            if (spec.weapon === "twin-swords") {
                p.rect(4, 2, 2, 16, wc);
                p.rect(3, 17, 4, 1, GOLD);
                p.rect(4, 18, 2, 3, "#5e3a1c");
            }
            if (spec.weapon === "bells") {
                p.set(24, 22, GOLD);
                p.set(29, 20, GOLD);
            }
            break;
        case "shield":
            p.oval(5, 24, 5, 7, wc);
            p.oval(5, 24, 2.5, 4, spec.robeTrim);
            p.set(5, 24, GOLD);
            break;
        default: break;
    }
}
function weaponFront(p, spec) {
    switch (spec.weapon) {
        case "fan":
            p.oval(23, 24, 5, 5, "#f4f1ea");
            for (let i = 0; i < 5; i++)
                p.set(19 + i * 2, 21, "#d0c8b8");
            p.rect(22, 27, 2, 5, WOOD);
            break;
        case "scroll":
            p.rect(20, 23, 8, 6, "#e9dcb5");
            p.rect(19, 23, 1, 6, WOOD);
            p.rect(28, 23, 1, 6, WOOD);
            for (const y of [25, 27])
                p.rect(21, y, 6, 1, "#7a6a50");
            break;
        case "gourd":
            p.oval(24, 27, 3.5, 3.5, "#c58f3a");
            p.oval(24, 22, 2.5, 2.5, "#c58f3a");
            p.rect(24, 18, 1, 2, WOOD);
            p.set(23, 26, "#e0b060");
            break;
        case "talisman":
            p.rect(22, 20, 6, 10, "#f2d24a");
            p.rect(24, 21, 2, 7, "#c0392b");
            p.set(23, 23, "#c0392b");
            p.set(26, 25, "#c0392b");
            break;
        default: break;
    }
}
/** Brows, almond eyes with a sclera glint, nose and mouth. */
function drawFace(p, spec, fierce) {
    const skin = spec.skin;
    const skinShadow = shade(skin, -0.18);
    const brow = spec.hair === "#e8e8e8" ? "#bdbdbd" : shade(spec.hair, -0.2);
    if (fierce) {
        p.rect(11, 11, 4, 1, brow);
        p.rect(17, 11, 4, 1, brow);
        p.set(14, 12, brow);
        p.set(17, 12, brow);
    }
    else {
        p.rect(11, 11, 3, 1, brow);
        p.rect(18, 11, 3, 1, brow);
    }
    // lash line, then pupil with a white sclera pixel on the outer side
    p.rect(12, 13, 3, 1, "#2a1a12");
    p.rect(17, 13, 3, 1, "#2a1a12");
    p.set(13, 14, "#0b0806");
    p.set(18, 14, "#0b0806");
    p.set(12, 14, "#f4f1ea");
    p.set(19, 14, "#f4f1ea");
    p.set(14, 14, skinShadow);
    p.set(17, 14, skinShadow);
    if (spec.eyepatch) {
        p.rect(11, 12, 4, 4, "#111111");
        for (let x = 9; x <= 22; x++)
            p.set(x, x < 11 ? 11 : 10, "#111111");
    }
    p.set(16, 15, skinShadow);
    p.set(16, 16, skinShadow);
    p.set(15, 17, skinShadow);
    p.set(11, 17, shade(skin, 0.12));
    p.rect(14, 19, 4, 1, "#8a3b2a");
}
function paintPortrait(spec, fierce) {
    const p = new P();
    const skin = spec.skin;
    const skinShadow = shade(skin, -0.18);
    weaponBehind(p, spec);
    // shoulders / torso
    const robe = spec.robe;
    p.oval(15.5, 31, 13, 8, robe);
    p.rect(3, 26, 26, 6, robe);
    p.rect(3, 29, 26, 3, shade(robe, -0.2));
    if (spec.armor) {
        p.oval(6, 25, 5, 3.5, spec.armor);
        p.oval(25, 25, 5, 3.5, spec.armor);
        p.rect(6, 25, 2, 1, shade(spec.armor, 0.3));
        p.rect(23, 25, 2, 1, shade(spec.armor, 0.3));
        for (let x = 4; x <= 27; x += 3)
            p.set(x, 27, shade(spec.armor, -0.3));
    }
    // robe folds and sash
    for (const x of [7, 11, 21, 25])
        p.rect(x, 28, 1, 4, shade(robe, -0.28));
    for (const x of [8, 22])
        p.rect(x, 27, 1, 3, shade(robe, 0.18));
    p.rect(9, 30, 14, 1, spec.armor ?? shade(spec.robeTrim, -0.15));
    p.rect(15, 30, 2, 1, GOLD);
    // collar (V neck with trim)
    for (let i = 0; i < 6; i++) {
        p.set(12 + i, 23 + i, spec.robeTrim);
        p.set(19 - i, 23 + i, spec.robeTrim);
        p.set(13 + i, 23 + i, spec.robeTrim);
        p.set(18 - i, 23 + i, spec.robeTrim);
    }
    p.rect(14, 23, 4, 3, skinShadow);
    // neck
    p.rect(13, 19, 6, 5, skin);
    p.rect(13, 22, 6, 1, skinShadow);
    // head
    p.oval(15.5, 14, 7, 8, skin);
    p.rect(20, 10, 2, 9, skinShadow);
    p.set(19, 19, skinShadow);
    p.set(18, 20, skinShadow);
    p.rect(10, 17, 1, 2, skinShadow);
    // ears
    p.oval(8.5, 14.5, 1.5, 2, skin);
    p.oval(22.5, 14.5, 1.5, 2, skinShadow);
    // hair mass
    p.oval(15.5, 8, 7.5, 4, spec.hair);
    p.rect(8, 8, 2, 7, spec.hair);
    p.rect(22, 8, 2, 7, spec.hair);
    p.rect(10, 9, 12, 1, spec.hair);
    for (const [x, y] of [[11, 6], [12, 5], [14, 5], [15, 6], [17, 5]])
        p.set(x, y, shade(spec.hair, 0.28));
    drawFace(p, spec, fierce);
    // beard
    const bc = spec.beardColor ?? spec.hair;
    const bcHi = shade(bc, 0.25);
    switch (spec.beard) {
        case "long":
            // drooping mustache, mouth kept visible, then a tapered V of strands
            p.rect(11, 17, 4, 1, bc);
            p.rect(17, 17, 4, 1, bc);
            p.set(11, 18, bc);
            p.set(20, 18, bc);
            p.rect(11, 19, 3, 2, bc);
            p.rect(18, 19, 3, 2, bc);
            p.rect(12, 20, 8, 1, bc);
            for (let y = 21; y < 32; y++) {
                const half = Math.max(1, 5 - Math.floor((y - 21) / 2));
                p.rect(16 - half, y, half * 2, 1, bc);
            }
            for (let y = 21; y < 31; y++) {
                if (y % 3 !== 0) {
                    p.set(14, y, bcHi);
                }
                if (y % 3 === 1 && y < 27)
                    p.set(17, y, bcHi);
            }
            break;
        case "full":
            p.rect(9, 14, 2, 6, bc);
            p.rect(21, 14, 2, 6, bc);
            p.oval(15.5, 20, 6.5, 3.5, bc);
            p.rect(14, 19, 4, 1, "#5a2a1a");
            for (const [x, y] of [[10, 18], [13, 22], [18, 22], [21, 18], [16, 23]])
                p.set(x, y, bcHi);
            break;
        case "goatee":
            p.rect(12, 17, 3, 1, bc);
            p.rect(17, 17, 3, 1, bc);
            p.set(12, 18, bc);
            p.set(19, 18, bc);
            p.rect(15, 20, 2, 3, bc);
            p.set(15, 23, bc);
            break;
        case "mustache":
            p.rect(12, 17, 3, 1, bc);
            p.rect(17, 17, 3, 1, bc);
            p.set(11, 18, bc);
            p.set(20, 18, bc);
            break;
        case "short":
            p.rect(10, 17, 12, 3, bc);
            p.rect(12, 20, 8, 1, bc);
            p.rect(14, 19, 4, 1, "#5a2a1a");
            break;
        case "none": break;
    }
    // head gear
    const hc = spec.hatColor;
    const trim = spec.hatTrim ?? GOLD;
    switch (spec.hat) {
        case "crown":
            p.rect(7, 2, 18, 2, hc);
            p.rect(7, 2, 18, 1, shade(hc, 0.25));
            p.rect(10, 4, 12, 4, hc);
            p.rect(10, 7, 12, 1, trim);
            p.rect(15, 4, 2, 3, trim);
            for (const x of [7, 9, 22, 24]) {
                p.rect(x, 4, 1, 4, trim);
                p.set(x, 8, "#e0e0e0");
            }
            break;
        case "helmet":
        case "plume-helmet":
        case "horned":
            p.oval(15.5, 8, 8.5, 5.5, hc);
            p.rect(7, 9, 18, 2, trim);
            p.rect(12, 4, 2, 4, shade(hc, 0.3));
            p.rect(7, 11, 2, 5, hc);
            p.rect(23, 11, 2, 5, hc);
            if (spec.hat === "plume-helmet") {
                p.rect(15, 0, 2, 3, "#c0392b");
                p.rect(14, 1, 4, 1, "#c0392b");
                p.set(15, 3, GOLD);
                p.set(16, 3, GOLD);
            }
            if (spec.hat === "horned") {
                for (let i = 0; i < 6; i++) {
                    p.set(6 - Math.floor(i / 2), 6 - i, trim);
                    p.set(25 + Math.floor(i / 2), 6 - i, trim);
                    p.set(7 - Math.floor(i / 2), 6 - i, trim);
                    p.set(24 + Math.floor(i / 2), 6 - i, trim);
                }
            }
            break;
        case "headscarf":
            p.oval(15.5, 7, 8.5, 5, hc);
            p.rect(7, 7, 18, 3, hc);
            p.rect(7, 9, 18, 1, shade(hc, -0.25));
            p.rect(24, 9, 3, 3, hc);
            p.rect(25, 12, 2, 6, hc);
            p.rect(26, 18, 1, 3, shade(hc, -0.25));
            break;
        case "headband":
            p.rect(8, 9, 16, 2, hc);
            p.rect(24, 10, 2, 2, hc);
            p.rect(25, 12, 2, 4, hc);
            p.rect(24, 16, 1, 2, hc);
            break;
        case "scholar":
            p.rect(11, 0, 10, 8, hc);
            p.rect(9, 7, 14, 2, hc);
            p.rect(11, 3, 10, 1, trim);
            p.rect(15, 0, 2, 8, shade(hc, 0.2));
            break;
        case "turban":
            p.oval(15.5, 7, 9, 4.5, hc);
            p.rect(7, 8, 18, 2, shade(hc, -0.2));
            p.rect(13, 3, 6, 2, trim);
            p.oval(16, 6, 1.5, 1.5, trim);
            break;
        case "hood":
            p.oval(15.5, 9, 9.5, 7, hc);
            p.rect(6, 12, 3, 13, hc);
            p.rect(23, 12, 3, 13, hc);
            p.oval(15.5, 15, 6.5, 6.5, skin);
            p.rect(9, 10, 14, 1, shade(hc, -0.25));
            drawFace(p, spec, fierce);
            break;
        case "topknot":
            p.oval(15.5, 3, 3, 2.5, spec.hair);
            p.rect(11, 3, 10, 1, trim);
            break;
        case "bun":
            p.oval(15.5, 3, 3.5, 3, spec.hair);
            p.rect(12, 5, 8, 2, hc);
            break;
        case "fur":
            p.oval(15.5, 7, 10, 5, hc);
            p.rect(6, 9, 20, 2, trim);
            for (const x of [8, 12, 18, 23])
                p.set(x, 5, trim);
            break;
        case "bald":
            p.oval(15.5, 8, 7, 4, skin);
            p.rect(11, 6, 1, 1, "#c0392b");
            p.rect(20, 6, 1, 1, "#c0392b");
            p.rect(8, 10, 2, 5, spec.hair);
            p.rect(22, 10, 2, 5, spec.hair);
            break;
        case "bandana":
            p.oval(15.5, 7, 8.5, 4, hc);
            p.rect(7, 8, 18, 2, hc);
            p.rect(24, 9, 4, 2, hc);
            p.rect(26, 11, 2, 4, trim);
            break;
    }
    weaponFront(p, spec);
    finish(p.g);
    return p;
}
/** Dithered faction backdrop painted behind the bust (after outlining, so it never gets an outline). */
function backdrop(p, faction) {
    const [inner, outer] = faction;
    for (let y = 0; y < N; y++)
        for (let x = 0; x < N; x++) {
            if (p.g[y][x] != null)
                continue;
            const d = Math.hypot(x - 15.5, y - 13);
            const c = d < 10 ? inner : d < 14 ? ((x + y) % 2 === 0 ? inner : outer) : outer;
            p.set(x, y, c);
        }
}
const FACTION_BG = {
    shu: ["#244a34", "#16301f"], wei: ["#223152", "#141d33"], wu: ["#4a2020", "#2e1414"],
    neutral: ["#21413f", "#142a28"], yellow: ["#4a3c18", "#2e2510"], dong: ["#3a1d24", "#241116"],
};
const FACTION = {
    "liu-bei": "shu", "guan-yu": "shu", "zhang-fei": "shu", "zhao-yun": "shu", "huang-zhong": "shu", "zhuge-liang": "shu",
    "cao-cao": "wei", "zhang-liao": "wei", "xiahou-dun": "wei", "jia-xu": "wei",
    "sun-quan": "wu", "taishi-ci": "wu", "zhou-yu": "wu", "gan-ning": "wu", "hua-tuo": "neutral",
};
export function factionOf(key) {
    return FACTION[key] ?? (/동탁|서량|관문|화웅/.test(key) ? "dong" : "yellow");
}
const cache = new Map();
const BOSSES = new Set(["장보", "장량", "장각", "화웅"]);
const FIERCE = new Set(["zhang-fei", "guan-yu", "xiahou-dun", "gan-ning", "zhang-liao", "cao-cao"]);
export function portraitUrl(key) {
    const external = assetPortrait(key);
    if (external !== undefined)
        return external;
    let url = cache.get(key);
    if (url !== undefined)
        return url;
    const spec = CHARACTER_FIGURES[key] ?? ENEMY_FIGURES[key];
    const canvas = document.createElement("canvas");
    canvas.width = N;
    canvas.height = N;
    if (spec !== undefined) {
        const p = paintPortrait(spec, FIERCE.has(key) || BOSSES.has(key) || key in ENEMY_FIGURES);
        backdrop(p, FACTION_BG[factionOf(key)]);
        const ctx = canvas.getContext("2d");
        for (let y = 0; y < N; y++)
            for (let x = 0; x < N; x++) {
                const c = p.g[y][x];
                if (c) {
                    ctx.fillStyle = c;
                    ctx.fillRect(x, y, 1, 1);
                }
            }
    }
    url = canvas.toDataURL();
    cache.set(key, url);
    return url;
}
//# sourceMappingURL=portraits.js.map