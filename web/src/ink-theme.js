// Prefer the approved high-resolution art board; keep CSS colours as safe fallbacks.
import { paintingUrl } from './assets.js';
export function applyInkTheme() {
    for (const name of ['paper', 'ink', 'vermilion', 'mountains']) {
        const url = paintingUrl('ui:' + name);
        if (url)
            document.documentElement.style.setProperty('--ui-' + name, `url("${url}")`);
    }
}
//# sourceMappingURL=ink-theme.js.map