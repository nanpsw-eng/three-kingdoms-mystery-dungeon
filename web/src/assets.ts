// Optional external art (CC0 tilesets, AI/commissioned portraits). Everything falls back to the
// procedural art when a file is missing, so the game always runs with zero assets.
//
// site/assets/manifest.json:
// {
//   "portraits": ["liu-bei", "guan-yu", ...],              // files: assets/portraits/<id>.png
//   "portraitPixels": 48, "portraitColors": 28,             // runtime pixelization (optional)
//   "tileset": { "image": "tiles/tilemap.png", "tile": 16, "gap": 0,
//                "map": { "floor": [[0,4],[1,4]], "wall-face": [[1,0]], "stairs": [[3,4]], ... } }
// }

import { ART_BINDINGS } from './art-bindings.js';

/** Enemy display names → ASCII asset ids (file names). Characters already use ASCII ids. */
export const ENEMY_ASSET_IDS: Readonly<Record<string, string>> = {
  "황건 창병": "yt-spear", "황건 궁병": "yt-archer", "황건 기병": "yt-raider", "황건 술사": "yt-sorcerer", "태평도 신도": "yt-chanter",
  "장보": "boss-zhang-bao", "장량": "boss-zhang-liang", "장각": "boss-zhang-jiao",
  "동탁군 극병": "dong-halberd", "서량 기병": "xiliang-cavalry", "동탁군 궁병": "dong-archer", "관문 수비대": "gate-guard", "화웅": "boss-hua-xiong",
  ...ART_BINDINGS,
};

interface TilesetSpec { readonly image: string; readonly tile: number; readonly gap?: number; readonly map: Readonly<Record<string, readonly (readonly [number, number])[]>> }
interface SurfaceSpec { readonly image: string; readonly map: Readonly<Record<string, readonly (readonly [number, number, number, number])[]>> }
interface Manifest { readonly portraits?: readonly string[]; readonly nativePortraits?: readonly string[]; readonly fullBodyIllustrations?: readonly string[]; readonly sharedPortraits?: Readonly<Record<string,string>>; readonly tokens?: readonly string[]; readonly portraitPixels?: number; readonly portraitColors?: number; readonly tileset?: TilesetSpec; readonly surfaces?: SurfaceSpec }

const portraits = new Map<string, string>();
const nativePortraits = new Map<string, string>();
const fullBodies = new Map<string, string>();
const tokens = new Map<string, HTMLImageElement>();
let tileset: { image: HTMLImageElement; spec: TilesetSpec } | null = null;
let surfaces: { image: HTMLImageElement; spec: SurfaceSpec } | null = null;

/** Original raster materials, selected by stable world-coordinate variants. */
export function assetSurface(name: string, variant = 0): { image: HTMLImageElement; sx: number; sy: number; width: number; height: number } | null {
  const rects = surfaces?.spec.map[name];
  if (!surfaces || !rects?.length) return null;
  const [sx, sy, width, height] = rects[Math.floor(variant * rects.length) % rects.length]!;
  return { image: surfaces.image, sx, sy, width, height };
}

export function fullBodyIllustration(key: string): string | undefined {
  return fullBodies.get(ENEMY_ASSET_IDS[key] ?? key);
}

export function assetToken(key: string): HTMLImageElement | undefined {
  return tokens.get(ENEMY_ASSET_IDS[key] ?? key);
}

export function nativeAssetPortrait(key: string): string | undefined {
  return nativePortraits.get(ENEMY_ASSET_IDS[key] ?? key);
}

export function assetPortrait(key: string): string | undefined {
  return portraits.get(ENEMY_ASSET_IDS[key] ?? key);
}

/** Returns a source rect in the loaded tileset for a named tile (variant picks among alternatives). */
export function assetTile(name: string, variant = 0): { image: HTMLImageElement; sx: number; sy: number; size: number } | null {
  if (tileset === null) return null;
  const cells = tileset.spec.map[name];
  if (!cells || cells.length === 0) return null;
  const [col, row] = cells[Math.floor(variant * cells.length) % cells.length]!;
  const step = tileset.spec.tile + (tileset.spec.gap ?? 0);
  return { image: tileset.image, sx: col * step, sy: row * step, size: tileset.spec.tile };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("missing " + src));
    image.src = src;
  });
}

/** Median-cut palette of `count` colors over opaque pixels. */
function medianCut(pixels: number[][], count: number): number[][] {
  let boxes: number[][][] = [pixels];
  while (boxes.length < count) {
    let best = -1, bestRange = -1, bestChannel = 0;
    boxes.forEach((box, index) => {
      if (box.length < 2) return;
      for (let c = 0; c < 3; c++) {
        let lo = 255, hi = 0;
        for (const p of box) { lo = Math.min(lo, p[c]!); hi = Math.max(hi, p[c]!); }
        if (hi - lo > bestRange) { bestRange = hi - lo; best = index; bestChannel = c; }
      }
    });
    if (best < 0 || bestRange <= 0) break;
    const box = boxes[best]!.sort((a, b) => a[bestChannel]! - b[bestChannel]!);
    const mid = Math.floor(box.length / 2);
    boxes = [...boxes.slice(0, best), box.slice(0, mid), box.slice(mid), ...boxes.slice(best + 1)];
  }
  return boxes.map((box) => [0, 1, 2].map((c) => Math.round(box.reduce((sum, p) => sum + p[c]!, 0) / box.length)));
}

/** Downsamples a painting to N×N and snaps it to a small palette so it reads as pixel art. */
function pixelize(image: HTMLImageElement, size: number, colors: number): string {
  // stepwise halving keeps detail when shrinking large AI images
  let source: CanvasImageSource = image;
  let w = image.naturalWidth, h = image.naturalHeight;
  while (w / 2 > size * 2) {
    const step = document.createElement("canvas");
    step.width = Math.round(w / 2); step.height = Math.round(h / 2);
    const sctx = step.getContext("2d")!;
    sctx.imageSmoothingQuality = "high";
    sctx.drawImage(source, 0, 0, step.width, step.height);
    source = step; w = step.width; h = step.height;
  }
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  const side = Math.min(w, h);
  ctx.drawImage(source, (w - side) / 2, 0, side, side, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size);
  const opaque: number[][] = [];
  for (let i = 0; i < data.data.length; i += 4) if (data.data[i + 3]! > 128) opaque.push([data.data[i]!, data.data[i + 1]!, data.data[i + 2]!]);
  const palette = medianCut(opaque, colors);
  for (let i = 0; i < data.data.length; i += 4) {
    if (data.data[i + 3]! <= 128) { data.data[i + 3] = 0; continue; }
    let best = palette[0]!, bestDist = Infinity;
    for (const c of palette) {
      const d = (c[0]! - data.data[i]!) ** 2 * 0.3 + (c[1]! - data.data[i + 1]!) ** 2 * 0.59 + (c[2]! - data.data[i + 2]!) ** 2 * 0.11;
      if (d < bestDist) { bestDist = d; best = c; }
    }
    data.data[i] = best[0]!; data.data[i + 1] = best[1]!; data.data[i + 2] = best[2]!; data.data[i + 3] = 255;
  }
  ctx.putImageData(data, 0, 0);
  return canvas.toDataURL();
}

/** Loads whatever art the manifest lists; calls `onReady` once anything new is available. */
export async function loadAssets(onReady: () => void): Promise<void> {
  let manifest: Manifest;
  try {
    const response = await fetch("assets/manifest.json", { cache: "no-cache" });
    if (!response.ok) return;
    manifest = (await response.json()) as Manifest;
  } catch {
    return;
  }
  const size = manifest.portraitPixels ?? 48;
  const colors = manifest.portraitColors ?? 28;
  const jobs: Promise<void>[] = (manifest.portraits ?? []).map(async (id) => {
    try { portraits.set(id, pixelize(await loadImage("assets/portraits/" + id + ".png"), size, colors)); } catch { /* keep procedural */ }
  });
  for (const id of manifest.fullBodyIllustrations ?? []) {
    const src = "assets/portraits/" + id + "-full.webp";
    // Full-body masters are fetched by the visible <img>, not all on initial launch.
    fullBodies.set(id, src);
  }
  for (const id of manifest.tokens ?? []) {
    const src = "assets/tokens/" + id + ".svg";
    jobs.push(loadImage(src).then((image) => { tokens.set(id, image); }).catch(() => undefined));
  }
  for (const id of manifest.nativePortraits ?? []) {
    const src = "assets/portraits/" + id + ".webp";
    jobs.push(loadImage(src).then(() => { nativePortraits.set(id, src); }).catch(() => undefined));
  }
  // Ordinary units share a portrait by role; their map tokens retain faction identity.
  for (const [id, master] of Object.entries(manifest.sharedPortraits ?? {})) {
    const src = "assets/portraits/" + master + ".webp";
    jobs.push(loadImage(src).then(() => { nativePortraits.set(id, src); }).catch(() => undefined));
  }
  if (manifest.tileset !== undefined) {
    const spec = manifest.tileset;
    jobs.push(loadImage("assets/" + spec.image).then((image) => { tileset = { image, spec }; }).catch(() => undefined));
  }
  if (manifest.surfaces !== undefined) {
    const spec = manifest.surfaces;
    jobs.push(loadImage("assets/" + spec.image).then((image) => { surfaces = { image, spec }; }).catch(() => undefined));
  }
  await Promise.all(jobs);
  if (portraits.size > 0 || nativePortraits.size > 0 || fullBodies.size > 0 || tokens.size > 0 || tileset !== null) onReady();
}
