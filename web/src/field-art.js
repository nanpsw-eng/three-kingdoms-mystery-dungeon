// Shared modern figures/items: the same source is used on the field and battle stage.
import { MVP_CONTENT } from "../../src/content/index.js";
const names = [
    "liu-bei", "cao-cao", "sun-quan", "recruit", "spear-unit", "archer-unit",
    "cavalry-unit", "mage-unit", "guard-unit", "boss-unit", "rice", "medicine",
    "herb", "scroll", "chest", "sword", "spear", "bow",
    "fan", "armor", "treasure", "gate", "stairs", "trap",
];
const sprites = new Map();
async function loadSheet(path, keys, columns, bands, columnBands) {
    try {
        const image = new Image();
        await new Promise((resolve, reject) => { image.onload = () => resolve(); image.onerror = reject; image.src = path; });
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(image, 0, 0);
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        // Fit the opaque subject, not transparent sheet margins, into one map cell.
        keys.forEach((name, index) => {
            const row = Math.floor(index / columns);
            // Source row bands are measured; alpha bounds remove only transparent margins.
            const edges = columnBands?.[row];
            const left = Math.round((edges?.[index % columns] ?? index % columns / columns) * canvas.width), top = Math.round(bands[row] * canvas.height / 1024);
            const right = Math.round((edges?.[index % columns + 1] ?? (index % columns + 1) / columns) * canvas.width), bottom = Math.round(bands[row + 1] * canvas.height / 1024);
            let x0 = right, y0 = bottom, x1 = left, y1 = top;
            for (let y = top; y < bottom; y++)
                for (let x = left; x < right; x++)
                    if (pixels[(y * canvas.width + x) * 4 + 3] > 64) {
                        x0 = Math.min(x0, x);
                        y0 = Math.min(y0, y);
                        x1 = Math.max(x1, x);
                        y1 = Math.max(y1, y);
                    }
            if (x1 >= x0 && y1 >= y0)
                sprites.set(name, { image, sx: x0, sy: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 });
        });
    }
    catch { /* optional art: existing tokens and procedural renderer remain playable */ }
}
export async function loadFieldArt() {
    await Promise.all([
        loadSheet("assets/modern/characters-v1.webp", ["liu-bei", "cao-cao", "sun-quan", "guan-yu", "zhang-fei", "zhao-yun", "zhuge-liang", "regular-spear", "cavalry-unit", "regular-archer", "recruit", "support-unit", "spear-unit", "archer-unit", "mage-unit", "boss-unit"], 4, [0, 256, 512, 768, 1024], [[0, .25, .5, .75, 1], [0, .25, .53, .76, 1], [0, .25, .5, .75, 1], [0, .25, .5, .75, 1]]),
        loadSheet("assets/modern/objects-v1.webp", ["rice", "medicine", "herb", "scroll", "chest", "sword", "spear", "bow", "fan", "armor", "treasure", "gate", "stairs", "trap", "torch", "sorcery"], 4, [0, 256, 512, 768, 1024]),
        loadSheet("assets/modern/terrain-v1.webp", ["terrain-floor", "terrain-warm", "terrain-wall-cap", "terrain-wall-face"], 2, [0, 512, 1024]),
    ]);
    // A failed atlas keeps the existing optional-art fallback playable.
    if (!sprites.has("liu-bei"))
        await loadSheet("assets/field/ink-miniatures-v1.webp", names.slice(0, 10), 6, [0, 280, 565, 790, 1024]);
}
export function fieldSprite(key) { return sprites.get({ "guard-unit": "boss-unit", "southern-warrior": "regular-spear", "southern-archer": "regular-archer" }[key] ?? key); }
export function fieldUnit(key, boss = false, ally = false) {
    if (/zhang-(jiao|bao|liang)/.test(key))
        return "mage-unit";
    if (boss || key.startsWith("boss-"))
        return /jiao|bao|liang/.test(key) ? "mage-unit" : "boss-unit";
    if (["liu-bei", "cao-cao", "sun-quan", "guan-yu", "zhang-fei", "zhao-yun", "zhuge-liang"].includes(key))
        return key;
    const character = MVP_CONTENT.characters.find(c => c.id === key || c.name === key);
    if (character)
        return { infantry: "regular-spear", cavalry: "cavalry-unit", archer: "regular-archer", strategist: "recruit", support: "support-unit" }[character.characterClass];
    if (ally)
        return "recruit";
    if (/nanman|tribal|southern/.test(key))
        return /archer|bow/.test(key) ? "southern-archer" : "southern-warrior";
    if (/archer|bow|crossbow|궁병|궁수|활/.test(key))
        return /yt-|황건/.test(key) ? "archer-unit" : "regular-archer";
    if (/cavalry|raider|horse|기병|약탈/.test(key))
        return "cavalry-unit";
    if (/sorcerer|chanter|mage|taoist|술사|도사|장각|장보|장량/.test(key))
        return "mage-unit";
    if (/guard|heavy|rattan|중갑|호위/.test(key))
        return "boss-unit";
    if (/황건/.test(key))
        return "spear-unit";
    return key.startsWith("yt-") ? "spear-unit" : "regular-spear";
}
const urls = new Map();
/** Runtime atlas extraction, preserving alpha; body and head crops share one figure. */
export function fieldImageUrl(key, head = false, item = false) {
    const role = item ? fieldItem(key) : fieldUnit(key);
    const cacheKey = role + (head ? ":head" : ":body");
    if (urls.has(cacheKey))
        return urls.get(cacheKey);
    const s = sprites.get(role);
    if (!s)
        return undefined;
    const canvas = document.createElement("canvas");
    canvas.width = head ? 128 : 192;
    canvas.height = head ? 128 : 224;
    const ctx = canvas.getContext("2d");
    const sourceHeight = head ? s.height * .38 : s.height;
    const sourceWidth = head ? Math.min(s.width * .55, s.height * .48) : s.width;
    const scale = Math.min(canvas.width / sourceWidth, canvas.height / sourceHeight);
    ctx.drawImage(s.image, s.sx + (s.width - sourceWidth) / 2, s.sy, sourceWidth, sourceHeight, (canvas.width - sourceWidth * scale) / 2, (canvas.height - sourceHeight * scale) / 2, sourceWidth * scale, sourceHeight * scale);
    const url = canvas.toDataURL();
    urls.set(cacheKey, url);
    return url;
}
export function fieldItem(id) {
    if (/rice|bun/.test(id))
        return "rice";
    if (/medicine|elixir|treatment|fire-pot|smoke/.test(id))
        return "medicine";
    if (id === "herb")
        return "herb";
    if (/scroll|map/.test(id))
        return "scroll";
    if (/sword|blade/.test(id))
        return "sword";
    if (/spear/.test(id))
        return "spear";
    if (/bow/.test(id))
        return "bow";
    if (/fan/.test(id))
        return "fan";
    if (/armor|robe/.test(id))
        return "armor";
    if (/seal|boots|tally/.test(id))
        return "treasure";
    return "chest";
}
//# sourceMappingURL=field-art.js.map