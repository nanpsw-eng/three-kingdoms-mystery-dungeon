// Field-only miniature atlas. Portraits, combat identity and domain content are unchanged.
export interface FieldSprite { image: HTMLImageElement; sx: number; sy: number; width: number; height: number }
const names = [
  "liu-bei", "cao-cao", "sun-quan", "recruit", "spear-unit", "archer-unit",
  "cavalry-unit", "mage-unit", "guard-unit", "boss-unit", "rice", "medicine",
  "herb", "scroll", "chest", "sword", "spear", "bow",
  "fan", "armor", "treasure", "gate", "stairs", "trap",
] as const;
const sprites = new Map<string, FieldSprite>();
async function loadSheet(path: string, keys: readonly string[], columns: number, bands: readonly number[], columnBands?: readonly (readonly number[])[]): Promise<void> {
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = reject; image.src = path; });
    const canvas = document.createElement("canvas"); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!; ctx.drawImage(image, 0, 0);
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    // Fit the opaque subject, not transparent sheet margins, into one map cell.
    keys.forEach((name, index) => {
      const row = Math.floor(index / columns);
      // Source row bands are measured; alpha bounds remove only transparent margins.
      const edges = columnBands?.[row];
      const left = Math.round((edges?.[index % columns] ?? index % columns / columns) * canvas.width), top = Math.round(bands[row]! * canvas.height / 1024);
      const right = Math.round((edges?.[index % columns + 1] ?? (index % columns + 1) / columns) * canvas.width), bottom = Math.round(bands[row + 1]! * canvas.height / 1024);
      let x0 = right, y0 = bottom, x1 = left, y1 = top;
      for (let y = top; y < bottom; y++) for (let x = left; x < right; x++) if (pixels[(y * canvas.width + x) * 4 + 3]! > 64) {
        x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
      }
      if (x1 >= x0 && y1 >= y0) sprites.set(name, { image, sx: x0, sy: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 });
    });
  } catch { /* optional art: existing tokens and procedural renderer remain playable */ }
}
export async function loadFieldArt(): Promise<void> {
  await Promise.all([
    loadSheet("assets/field/ink-miniatures-v1.webp", names, 6, [0, 280, 565, 790, 1024]),
    loadSheet("assets/field/ink-regular-miniatures-v1.webp", ["regular-spear", "regular-archer", "southern-warrior", "southern-archer"], 2, [0, 512, 1024], [[0, .5, 1], [0, .55, 1]]),
  ]);
}
export function fieldSprite(key: string): FieldSprite | undefined { return sprites.get(key); }
export function fieldUnit(key: string, boss = false, ally = false): string {
  if (boss || key.startsWith("boss-")) return /jiao|bao|liang/.test(key) ? "mage-unit" : "boss-unit";
  if (["liu-bei", "cao-cao", "sun-quan"].includes(key)) return key;
  if (ally) return "recruit";
  if (/nanman|tribal|southern/.test(key)) return /archer|bow/.test(key) ? "southern-archer" : "southern-warrior";
  if (/archer|bow|crossbow/.test(key)) return key.startsWith("yt-") ? "archer-unit" : "regular-archer";
  if (/cavalry|raider|horse/.test(key)) return "cavalry-unit";
  if (/sorcerer|chanter|mage|taoist/.test(key)) return "mage-unit";
  if (/guard|heavy|rattan/.test(key)) return "guard-unit";
  return key.startsWith("yt-") ? "spear-unit" : "regular-spear";
}
export function fieldItem(id: string): string {
  if (/rice|bun/.test(id)) return "rice";
  if (/medicine|elixir|treatment|fire-pot|smoke/.test(id)) return "medicine";
  if (id === "herb") return "herb";
  if (/scroll|map/.test(id)) return "scroll";
  if (/sword|blade/.test(id)) return "sword";
  if (/spear/.test(id)) return "spear";
  if (/bow/.test(id)) return "bow";
  if (/fan/.test(id)) return "fan";
  if (/armor|robe/.test(id)) return "armor";
  if (/seal|boots|tally/.test(id)) return "treasure";
  return "chest";
}
