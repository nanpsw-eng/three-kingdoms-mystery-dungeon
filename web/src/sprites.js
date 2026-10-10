import { finish } from "./pixel.js";
import { assetTile } from "./assets.js";
// Procedural 16×16 pixel-art sprites (no image assets). Each figure is composed from parts
// (head gear, hair, beard, robe, armor, weapon) and auto-outlined, so every character reads distinctly.
export const SPRITE_SIZE = 16;
const OUTLINE = "#1a120c";
class Px {
    g = Array.from({ length: SPRITE_SIZE }, () => Array(SPRITE_SIZE).fill(null));
    set(x, y, c) { if (x >= 0 && y >= 0 && x < SPRITE_SIZE && y < SPRITE_SIZE)
        this.g[y][x] = c; }
    rect(x, y, w, h, c) { for (let j = 0; j < h; j++)
        for (let i = 0; i < w; i++)
            this.set(x + i, y + j, c); }
    line(points, c) { for (const [x, y] of points)
        this.set(x, y, c); }
    vline(x, y0, y1, c) { for (let y = y0; y <= y1; y++)
        this.set(x, y, c); }
    outline() {
        const filled = (x, y) => this.g[y]?.[x] != null && this.g[y][x] !== OUTLINE;
        const marks = [];
        for (let y = 0; y < SPRITE_SIZE; y++)
            for (let x = 0; x < SPRITE_SIZE; x++) {
                if (this.g[y][x] != null)
                    continue;
                if (filled(x + 1, y) || filled(x - 1, y) || filled(x, y + 1) || filled(x, y - 1))
                    marks.push([x, y]);
            }
        for (const [x, y] of marks)
            this.set(x, y, OUTLINE);
    }
}
const STEEL = "#c9d2db";
const STEEL_DARK = "#7d8794";
const WOOD = "#8a5a2b";
const GOLD = "#e8b84a";
function paintFigure(spec) {
    const p = new Px();
    const boots = spec.boots ?? "#3a2a1e";
    // legs & boots
    p.rect(5, 13, 2, 2, spec.robe);
    p.rect(9, 13, 2, 2, spec.robe);
    p.rect(5, 14, 2, 1, boots);
    p.rect(9, 14, 2, 1, boots);
    // body (robe) with trim and belt
    p.rect(4, 9, 8, 5, spec.robe);
    p.vline(7, 9, 13, spec.robeTrim);
    p.vline(8, 9, 13, spec.robeTrim);
    p.rect(4, 11, 8, 1, spec.armor ?? spec.robeTrim);
    if (spec.armor) {
        p.rect(3, 9, 2, 2, spec.armor);
        p.rect(11, 9, 2, 2, spec.armor);
        p.rect(5, 9, 6, 1, spec.armor);
    }
    // arms & hands
    p.rect(3, 10, 1, 2, spec.robe);
    p.rect(12, 10, 1, 2, spec.robe);
    p.set(3, 12, spec.skin);
    p.set(12, 12, spec.skin);
    // head
    p.rect(5, 3, 6, 6, spec.skin);
    p.rect(4, 4, 1, 4, spec.skin);
    p.rect(11, 4, 1, 4, spec.skin);
    // hair base
    p.rect(5, 2, 6, 2, spec.hair);
    p.set(4, 3, spec.hair);
    p.set(11, 3, spec.hair);
    p.set(4, 4, spec.hair);
    p.set(11, 4, spec.hair);
    // eyes / mouth
    p.set(6, 5, OUTLINE);
    p.set(9, 5, OUTLINE);
    if (spec.eyepatch) {
        p.set(6, 5, "#111111");
        p.set(5, 4, "#111111");
        p.set(7, 4, "#111111");
        p.set(5, 5, "#111111");
        p.set(7, 5, "#111111");
    }
    p.set(7, 7, "#7a3b2a");
    p.set(8, 7, "#7a3b2a");
    // beard
    const bc = spec.beardColor ?? spec.hair;
    switch (spec.beard) {
        case "long":
            p.rect(6, 7, 4, 2, bc);
            p.rect(6, 9, 4, 2, bc);
            p.rect(7, 11, 2, 1, bc);
            break;
        case "full":
            p.rect(4, 6, 1, 3, bc);
            p.rect(11, 6, 1, 3, bc);
            p.rect(5, 7, 6, 2, bc);
            p.rect(6, 9, 4, 1, bc);
            p.set(7, 7, "#7a3b2a");
            break;
        case "goatee":
            p.rect(7, 8, 2, 2, bc);
            p.set(6, 7, bc);
            p.set(9, 7, bc);
            break;
        case "mustache":
            p.set(6, 7, bc);
            p.set(9, 7, bc);
            p.set(7, 7, bc);
            p.set(8, 7, bc);
            break;
        case "short":
            p.rect(5, 8, 6, 1, bc);
            p.rect(6, 7, 1, 1, bc);
            p.rect(9, 7, 1, 1, bc);
            break;
        case "none": break;
    }
    // head gear
    const hc = spec.hatColor;
    const trim = spec.hatTrim ?? GOLD;
    switch (spec.hat) {
        case "crown":
            p.rect(4, 1, 8, 2, hc);
            p.rect(3, 0, 10, 1, hc);
            p.set(4, 0, trim);
            p.set(11, 0, trim);
            p.rect(5, 2, 6, 1, trim);
            break;
        case "helmet":
            p.rect(4, 1, 8, 3, hc);
            p.set(7, 0, hc);
            p.set(8, 0, hc);
            p.rect(4, 3, 8, 1, trim);
            break;
        case "plume-helmet":
            p.rect(4, 1, 8, 3, hc);
            p.rect(4, 3, 8, 1, trim);
            p.set(7, 0, "#c0392b");
            p.set(8, 0, "#c0392b");
            p.set(9, 0, "#c0392b");
            break;
        case "headscarf":
            p.rect(4, 1, 8, 3, hc);
            p.set(12, 3, hc);
            p.set(12, 4, hc);
            p.set(13, 5, hc);
            break;
        case "headband":
            p.rect(4, 3, 8, 1, hc);
            p.set(12, 3, hc);
            p.set(13, 4, hc);
            break;
        case "scholar":
            p.rect(5, 0, 6, 3, hc);
            p.rect(4, 2, 8, 1, hc);
            p.rect(6, 1, 4, 1, trim);
            break;
        case "turban":
            p.rect(4, 2, 8, 2, hc);
            p.set(5, 1, hc);
            p.set(10, 1, hc);
            p.rect(6, 1, 4, 1, trim);
            break;
        case "hood":
            p.rect(4, 1, 8, 3, hc);
            p.rect(3, 3, 1, 5, hc);
            p.rect(12, 3, 1, 5, hc);
            break;
        case "topknot":
            p.rect(7, 0, 2, 2, spec.hair);
            p.set(6, 1, trim);
            p.set(9, 1, trim);
            break;
        case "bun":
            p.rect(7, 0, 2, 2, spec.hair);
            p.rect(6, 1, 4, 1, hc);
            break;
        case "fur":
            p.rect(4, 1, 8, 3, hc);
            p.rect(3, 2, 10, 1, hc);
            p.set(5, 1, trim);
            p.set(8, 1, trim);
            break;
        case "horned":
            p.rect(4, 1, 8, 3, hc);
            p.rect(4, 3, 8, 1, trim);
            p.set(3, 0, trim);
            p.set(3, 1, trim);
            p.set(12, 0, trim);
            p.set(12, 1, trim);
            break;
        case "bald":
            p.rect(5, 2, 6, 1, spec.skin);
            break;
        case "bandana":
            p.rect(4, 2, 8, 2, hc);
            p.set(12, 3, hc);
            p.set(13, 3, hc);
            p.set(12, 4, trim);
            break;
    }
    // weapon (held in the right hand at x=12, extending along x=13..15)
    const wc = spec.weaponColor ?? STEEL;
    switch (spec.weapon) {
        case "twin-swords":
            p.vline(13, 7, 12, wc);
            p.vline(2, 7, 12, wc);
            p.set(13, 12, GOLD);
            p.set(2, 12, GOLD);
            break;
        case "sword":
            p.vline(13, 6, 12, wc);
            p.set(13, 12, GOLD);
            p.set(14, 11, GOLD);
            p.set(12, 11, GOLD);
            break;
        case "guandao":
            p.vline(13, 3, 15, WOOD);
            p.rect(14, 0, 1, 5, wc);
            p.set(13, 1, wc);
            p.set(13, 2, wc);
            p.set(15, 1, wc);
            p.set(12, 3, "#2e7d4f");
            break;
        case "snake-spear":
            p.vline(13, 3, 15, "#3a2a1e");
            p.line([[13, 0], [14, 1], [13, 2], [12, 1]], wc);
            p.set(12, 3, "#c0392b");
            break;
        case "spear":
            p.vline(13, 2, 15, WOOD);
            p.set(13, 0, wc);
            p.set(13, 1, wc);
            p.set(12, 1, wc);
            p.set(14, 1, wc);
            p.set(12, 3, "#c0392b");
            break;
        case "bow":
            p.line([[14, 4], [15, 5], [15, 6], [15, 7], [15, 8], [15, 9], [15, 10], [14, 11]], WOOD);
            p.vline(13, 5, 10, "#efe6d2");
            break;
        case "fan":
            p.rect(13, 7, 3, 3, "#f4f1ea");
            p.set(14, 6, "#f4f1ea");
            p.set(13, 10, WOOD);
            p.set(14, 8, "#d0c8b8");
            break;
        case "halberd":
            p.vline(13, 2, 15, WOOD);
            p.rect(13, 0, 1, 2, wc);
            p.rect(14, 2, 2, 2, wc);
            p.set(12, 2, wc);
            break;
        case "scroll":
            p.rect(13, 9, 2, 4, "#e9dcb5");
            p.set(13, 8, WOOD);
            p.set(13, 13, WOOD);
            break;
        case "staff":
            p.vline(13, 1, 15, WOOD);
            p.rect(12, 0, 3, 2, wc);
            break;
        case "gourd":
            p.rect(13, 10, 2, 3, "#c58f3a");
            p.rect(13, 8, 2, 1, "#c58f3a");
            p.set(14, 7, WOOD);
            break;
        case "talisman":
            p.rect(13, 7, 2, 4, "#f2d24a");
            p.set(13, 8, "#c0392b");
            p.set(14, 9, "#c0392b");
            break;
        case "shield":
            p.rect(0, 8, 4, 6, wc);
            p.rect(1, 9, 2, 4, spec.robeTrim);
            p.vline(13, 6, 13, STEEL);
            break;
        case "great-blade":
            p.vline(13, 2, 15, "#3a2a1e");
            p.rect(14, 0, 2, 7, wc);
            p.set(13, 0, wc);
            p.set(15, 7, STEEL_DARK);
            break;
        case "bells":
            p.vline(13, 6, 12, wc);
            p.set(14, 8, GOLD);
            p.set(14, 10, GOLD);
            p.set(2, 9, GOLD);
            break;
        case "none": break;
    }
    finish(p.g);
    return p;
}
const PEACH = "#f1c27d";
const TAN = "#d9a066";
/** Character id → figure. */
export const CHARACTER_FIGURES = {
    "liu-bei": { skin: PEACH, hair: "#2b1d14", hat: "crown", hatColor: "#2f6b3a", beard: "short", robe: "#3f8a4c", robeTrim: GOLD, weapon: "twin-swords" },
    "cao-cao": { skin: PEACH, hair: "#1d1a24", hat: "crown", hatColor: "#24304f", hatTrim: "#c0392b", beard: "goatee", robe: "#2b3a67", robeTrim: "#c0392b", weapon: "sword" },
    "sun-quan": { skin: PEACH, hair: "#3b2a2a", hat: "crown", hatColor: "#8e1f1f", beard: "short", beardColor: "#6b3fa0", robe: "#a83232", robeTrim: GOLD, weapon: "sword" },
    "guan-yu": { skin: "#b5402f", hair: "#1a1410", hat: "headscarf", hatColor: "#2e7d4f", beard: "long", beardColor: "#140f0c", robe: "#2e7d4f", robeTrim: "#d8c37a", weapon: "guandao", weaponColor: "#dfe6ee" },
    "zhang-fei": { skin: TAN, hair: "#140f0c", hat: "headband", hatColor: "#3b3b45", beard: "full", beardColor: "#140f0c", robe: "#3b3b45", robeTrim: "#8a8a99", armor: "#5a5a6a", weapon: "snake-spear" },
    "zhao-yun": { skin: PEACH, hair: "#2b1d14", hat: "plume-helmet", hatColor: "#dfe6ee", hatTrim: "#3a6ea5", beard: "none", robe: "#e9eef3", robeTrim: "#3a6ea5", armor: "#b8c4d0", weapon: "spear" },
    "huang-zhong": { skin: TAN, hair: "#e8e8e8", hat: "helmet", hatColor: "#b4642d", beard: "long", beardColor: "#f2f2f2", robe: "#c0763a", robeTrim: "#6b3a1a", armor: "#8a4b22", weapon: "bow" },
    "zhuge-liang": { skin: PEACH, hair: "#1d1a24", hat: "scholar", hatColor: "#1f2433", hatTrim: "#4a5a80", beard: "mustache", robe: "#ece7da", robeTrim: "#2f4a7a", weapon: "fan" },
    "zhang-liao": { skin: PEACH, hair: "#2b1d14", hat: "helmet", hatColor: "#4a3470", hatTrim: GOLD, beard: "mustache", robe: "#5b3f8c", robeTrim: GOLD, armor: "#7a64a6", weapon: "halberd" },
    "xiahou-dun": { skin: PEACH, hair: "#1d1a24", hat: "helmet", hatColor: "#24304f", hatTrim: "#7d8794", beard: "short", robe: "#2b3a67", robeTrim: "#7d8794", armor: "#4a5a80", weapon: "spear", eyepatch: true },
    "jia-xu": { skin: "#e5c08f", hair: "#3a3a3a", hat: "scholar", hatColor: "#2f2a33", hatTrim: "#6d5a7a", beard: "goatee", beardColor: "#4a4a4a", robe: "#3a3340", robeTrim: "#6d5a7a", weapon: "scroll" },
    "taishi-ci": { skin: TAN, hair: "#2b1d14", hat: "headband", hatColor: "#c0392b", beard: "short", robe: "#2f7d7a", robeTrim: "#a8d5d1", armor: "#3f9c97", weapon: "bow" },
    "zhou-yu": { skin: PEACH, hair: "#1d1a24", hat: "topknot", hatColor: GOLD, beard: "none", robe: "#b03a4a", robeTrim: "#f4f1ea", weapon: "sword" },
    "gan-ning": { skin: TAN, hair: "#2b1d14", hat: "bandana", hatColor: "#c0392b", hatTrim: GOLD, beard: "mustache", robe: "#7a4a24", robeTrim: "#d9a441", armor: "#5e3a1c", weapon: "bells" },
    "hua-tuo": { skin: PEACH, hair: "#e8e8e8", hat: "bun", hatColor: "#4f7a4a", beard: "long", beardColor: "#f2f2f2", robe: "#7fae7a", robeTrim: "#e9dcb5", weapon: "gourd" },
};
/** Enemy archetype / boss name → figure. */
export const ENEMY_FIGURES = {
    "황건 창병": { skin: TAN, hair: "#2b1d14", hat: "headband", hatColor: "#f2c230", beard: "none", robe: "#7a5a3a", robeTrim: "#f2c230", weapon: "spear" },
    "황건 궁병": { skin: TAN, hair: "#2b1d14", hat: "headband", hatColor: "#f2c230", beard: "short", robe: "#6b5a3a", robeTrim: "#f2c230", weapon: "bow" },
    "황건 기병": { skin: TAN, hair: "#2b1d14", hat: "turban", hatColor: "#f2c230", beard: "mustache", robe: "#5e3a1c", robeTrim: "#f2c230", armor: "#7a4a24", weapon: "sword" },
    "황건 술사": { skin: "#e5c08f", hair: "#2b1d14", hat: "hood", hatColor: "#d9a82a", beard: "goatee", robe: "#e0b33a", robeTrim: "#8e1f1f", weapon: "staff", weaponColor: "#f2d24a" },
    "태평도 신도": { skin: "#e5c08f", hair: "#2b1d14", hat: "bald", hatColor: "#f2c230", beard: "none", robe: "#e8c24a", robeTrim: "#c0392b", weapon: "talisman" },
    "장보": { skin: TAN, hair: "#1d1a24", hat: "turban", hatColor: "#e07b20", hatTrim: "#f2c230", beard: "full", beardColor: "#1d1a24", robe: "#e07b20", robeTrim: "#f2c230", weapon: "staff", weaponColor: "#c0392b" },
    "장량": { skin: TAN, hair: "#1d1a24", hat: "turban", hatColor: "#7a3fa0", hatTrim: "#f2c230", beard: "goatee", robe: "#6b3a8c", robeTrim: "#f2c230", weapon: "staff", weaponColor: "#7ae0a0" },
    "장각": { skin: "#e5c08f", hair: "#e8e8e8", hat: "scholar", hatColor: "#f2c230", hatTrim: "#c0392b", beard: "long", beardColor: "#f2f2f2", robe: "#f2c230", robeTrim: "#8e1f1f", weapon: "staff", weaponColor: "#ffef8a" },
    "동탁군 극병": { skin: TAN, hair: "#1d1a24", hat: "helmet", hatColor: "#3a2a2a", hatTrim: "#8e1f1f", beard: "short", robe: "#4a2626", robeTrim: "#8e1f1f", armor: "#5a3a3a", weapon: "halberd" },
    "서량 기병": { skin: TAN, hair: "#2b1d14", hat: "fur", hatColor: "#8a6a4a", hatTrim: "#d9c3a0", beard: "mustache", robe: "#6b4a2a", robeTrim: "#d9c3a0", weapon: "spear" },
    "동탁군 궁병": { skin: TAN, hair: "#1d1a24", hat: "helmet", hatColor: "#3a2a2a", hatTrim: "#8e1f1f", beard: "none", robe: "#4a2626", robeTrim: "#c9a46a", weapon: "bow" },
    "관문 수비대": { skin: TAN, hair: "#1d1a24", hat: "helmet", hatColor: "#4a4a55", hatTrim: "#8e1f1f", beard: "short", robe: "#3a3a44", robeTrim: "#8e1f1f", armor: "#6a6a78", weapon: "shield", weaponColor: "#8e1f1f" },
    "화웅": { skin: TAN, hair: "#140f0c", hat: "horned", hatColor: "#2a2228", hatTrim: "#c9a46a", beard: "full", beardColor: "#7a2a1a", robe: "#2a2228", robeTrim: "#8e1f1f", armor: "#4a3a40", weapon: "great-blade" },
};
const cache = new Map();
const urlCache = new Map();
function toCanvas(p) {
    const canvas = document.createElement("canvas");
    canvas.width = SPRITE_SIZE;
    canvas.height = SPRITE_SIZE;
    const ctx = canvas.getContext("2d");
    for (let y = 0; y < SPRITE_SIZE; y++)
        for (let x = 0; x < SPRITE_SIZE; x++) {
            const c = p.g[y][x];
            if (c) {
                ctx.fillStyle = c;
                ctx.fillRect(x, y, 1, 1);
            }
        }
    return canvas;
}
const FALLBACK = { skin: TAN, hair: "#2b1d14", hat: "headband", hatColor: "#888", beard: "none", robe: "#666", robeTrim: "#999", weapon: "sword" };
export function figureCanvas(key) {
    let canvas = cache.get(key);
    if (canvas === undefined) {
        canvas = toCanvas(paintFigure(CHARACTER_FIGURES[key] ?? ENEMY_FIGURES[key] ?? FALLBACK));
        cache.set(key, canvas);
    }
    return canvas;
}
export function figureUrl(key) {
    let url = urlCache.get(key);
    if (url === undefined) {
        url = figureCanvas(key).toDataURL();
        urlCache.set(key, url);
    }
    return url;
}
// ---------- item icons: 12×12 hand-pixelled glyphs ----------
const ICON_PALETTE = {
    k: OUTLINE, w: "#f4f1ea", c: "#e9dcb5", y: "#f2c230", o: "#e07b20", r: "#c0392b", R: "#8e1f1f", g: "#4f9a4a", G: "#2e6b2e",
    b: "#3a6ea5", B: "#24304f", s: STEEL, S: STEEL_DARK, n: "#8a5a2b", N: "#5e3a1c", p: "#7a4aa0", t: "#3fa7a0", e: "#d9a066", x: "#555555",
};
const ICONS = {
    bun: ["............", "............", "....kkkk....", "...kwwwwk...", "..kwwccwwk..", "..kwcwwcwk..", ".kwwwccwwwk.", ".kcwwwwwwck.", ".kcccccccck.", "..kkkkkkkk..", "............", "............"],
    "rice-sack": ["............", "....kkkk....", "...knNNnk...", "....kNNk....", "...kccccck..", "..kccccccck.", "..kccrrcck..", "..kcrccrck..", "..kccrrcck..", "..kcccccck..", "...kkkkkk...", "............"],
    herb: ["............", "......kk....", ".....kgGk...", "..kk.kgk....", ".kgGkkgk.kk.", ".kGgggkkkgGk", "..kkkGgggGk.", ".....kGkkk..", ".....kGk....", ".....kNk....", ".....kNk....", "......k....."],
    medicine: ["............", "....kkkk....", "....kNNk....", "...kkkkkk...", "..krrrrrrk..", "..krwwwwrk..", "..krwrrwrk..", "..krwwwwrk..", "..krrrrrrk..", "..krrrrrrk..", "...kkkkkk...", "............"],
    "treatment-kit": ["............", "....kkkk....", "....k..k....", ".kkkkkkkkkk.", ".kwwwwwwwwk.", ".kwwwrrwwwk.", ".kwwrrrrwwk.", ".kwwwrrwwwk.", ".kwwwwwwwwk.", ".kkkkkkkkkk.", "............", "............"],
    "identify-scroll": ["............", ".kkkkkkkkkk.", ".kNcccccccNk", "..kcxxxxck..", "..kcccccck..", "..kcxxxcck..", "..kcccccck..", "..kcxxxxck..", "..kccccrck..", ".kNcccccccNk", ".kkkkkkkkkk.", "............"],
    "scout-map": ["............", ".kkkkkkkkkk.", ".kcccgccbbk.", ".kccgggcbbk.", ".kcccgcccck.", ".kcrcccccck.", ".kcccrrrcck.", ".kcbbcccrck.", ".kcbbcccxck.", ".kcccccccck.", ".kkkkkkkkkk.", "............"],
    "fire-pot": ["......o.....", ".....oyo....", "......k.....", "....kNNk....", "...kkkkkk...", "..kxxxxxxk..", "..kxRxxRxk..", "..kxxxxxxk..", "..kxxxxxxk..", "...kxxxxk...", "....kkkk....", "............"],
    "smoke-bomb": ["....xx.x....", "...x.xx.x...", "......k.....", ".....kNk....", "....kkkkk...", "...kSSSSSk..", "..kSsSSSSSk.", "..kSSSSSSSk.", "..kSSSSSSSk.", "...kSSSSSk..", "....kkkkk...", "............"],
    elixir: ["............", ".....kk.....", ".....kNk....", "....kkkk....", "...ktttk....", "..kttttttk..", "..kttwttttk.", "..ktttttttk.", "...kttttttk.", "....kkkkk...", "............", "............"],
    "iron-sword": ["..........k.", ".........ksk", "........ksk.", ".......ksk..", "......ksk...", ".....ksk....", "..k.ksk.....", "...kyk......", "...kyk......", "..kNkk......", ".kNk........", "..k........."],
    "long-spear": ["..........kk", "........kssk", "........ksk.", ".......kNk..", "......kNk...", ".....kNk....", "....kNk.....", "...kNk......", "..kNk.......", ".kNk........", "kNk.........", "k..........."],
    "horn-bow": ["...kk.......", "..knnk......", "..kn.wk.....", ".kn...wk....", ".kn....wk...", ".kn.....w...", ".kn....wk...", ".kn...wk....", "..kn.wk.....", "..knnk......", "...kk.......", "............"],
    "war-fan": ["............", "..kkkkkkk...", ".kwwwwwwwk..", ".kwcwcwcwk..", "..kwwwwwk...", "...kwcwk....", "....kwk.....", ".....kk.....", ".....kNk....", ".....kNk....", "......k.....", "............"],
    "ancient-blade": ["...........k", "..........kp", ".........kpk", "........kpk.", ".......kpk..", "......kpk...", "..k..kpk....", "...kyyk.....", "...kyk......", "..kRkk......", ".kRk........", "..k........."],
    "leather-armor": ["............", "..kkk..kkk..", ".kNNNkkNNNk.", ".kNnnNNnnNk.", "..kNnnnnNk..", "..kNnNNnNk..", "..kNnnnnNk..", "..kNnNNnNk..", "..kNnnnnNk..", "..kkkkkkkk..", "............", "............"],
    "scale-armor": ["............", "..kkk..kkk..", ".kSSSkkSSSk.", ".kSsSsSsSSk.", "..ksSsSsSk..", "..kSsSsSsk..", "..ksSsSsSk..", "..kSsSsSsk..", "..ksSsSsSk..", "..kkkkkkkk..", "............", "............"],
    "silk-robe": ["............", "..kkk..kkk..", ".kbbbkkbbbk.", ".kbbbyybbbk.", "..kbbyybbk..", "..kbbyybbk..", "..kbbyybbk..", "..kbbyybbk..", ".kbbbyybbbk.", ".kkkkkkkkkk.", "............", "............"],
    "dragon-armor": ["............", "..kkk..kkk..", ".kGGGkkGGGk.", ".kGgGgyGgGk.", "..kgGgGgGk..", "..kGgGyGgk..", "..kgGgGgGk..", "..kGgyGgGk..", "..kgGgGgGk..", "..kkkkkkkk..", "............", "............"],
    "jade-seal": ["............", "............", "....kkkk....", "....kggk....", "...kkggkk...", "..kgggggk...", "..kgtgtggk..", "..kggggggk..", "..kgtggtgk..", "..kkkkkkkk..", "..krrrrrrk..", "..kkkkkkkk.."],
    "swift-boots": ["............", "...kkkk.....", "...kbbk.....", "...kbbk.....", "...kbbk.....", "...kbbk.....", "...kbbbkk...", "...kbbbbbk..", "..kbbbbbbbk.", "..kNNNNNNNk.", "..kkkkkkkkk.", "............"],
    "tiger-tally": ["............", "...kkkkk....", "..kyyyyyk...", ".kyykyyyykk.", ".kyyyyyyyyk.", ".kykykykyyk.", ".kyyyyyyyyk.", "..kyyyyyyk..", "...kykyk....", "...kk.kk....", "............", "............"],
    "unknown-item": ["............", "...kkkkkk...", "..kcccccck..", ".kccwwwwcck.", ".kccw..wcck.", ".kccwwwwcck.", ".kcc..wcck..", ".kcc..wcck..", "..kcccccck..", "...kkkkkk...", "....kNNk....", "....kkkk...."],
};
export const ICON_IDS = Object.keys(ICONS);
export function iconCanvas(id) {
    const art = assetTile("item-" + id);
    if (art !== null) {
        const artKey = "ink-icon:" + id;
        let canvas = cache.get(artKey);
        if (canvas === undefined) {
            canvas = document.createElement("canvas");
            canvas.width = 26;
            canvas.height = 26;
            const ctx = canvas.getContext("2d");
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(art.image, art.sx, art.sy, art.size, art.size, 0, 0, 26, 26);
            cache.set(artKey, canvas);
        }
        return canvas;
    }
    const key = "icon:" + id;
    let canvas = cache.get(key);
    if (canvas !== undefined)
        return canvas;
    const rows = ICONS[id] ?? ICONS["identify-scroll"];
    canvas = document.createElement("canvas");
    canvas.width = 12;
    canvas.height = 12;
    const ctx = canvas.getContext("2d");
    rows.forEach((row, y) => [...row].forEach((ch, x) => { const c = ICON_PALETTE[ch]; if (c) {
        ctx.fillStyle = c;
        ctx.fillRect(x, y, 1, 1);
    } }));
    // Keep fallback canvases cached separately; if the manifest finishes loading later, the ink version can replace them.
    cache.set(key, canvas);
    return canvas;
}
export function iconUrl(id) {
    const artLoaded = assetTile("item-" + id) !== null;
    const key = (artLoaded ? "ink-icon:" : "icon:") + id;
    let url = urlCache.get(key);
    if (url === undefined) {
        url = iconCanvas(id).toDataURL();
        urlCache.set(key, url);
    }
    return url;
}
/** Small <img> element showing a pixel sprite at an integer scale. */
export function spriteImg(url, size, alt, cls = "px") {
    const img = document.createElement("img");
    img.src = url;
    img.width = size;
    img.height = size;
    img.alt = alt;
    img.className = cls;
    img.decoding = "async";
    return img;
}
//# sourceMappingURL=sprites.js.map