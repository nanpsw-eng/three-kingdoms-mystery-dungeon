# Modern RPG assets v1

Built-in imagegen으로 생성, PNG 원본을 같은 크기/alpha로 WebP(quality92) 포맷 변환했다. 이미지 합성·배경 제거·Python 그림 편집은 하지 않았다. 실제 게임은 atlas의 개별 셀을 읽어 사용한다. 그림에 UI 글자나 수치는 들어 있지 않다.

- characters-v1.webp: 1254×1254 RGBA, 16 equal cells, major identities7 and shared roles9. Source exec-9516ccd0-0899-4230-a865-a1654e2bb870.png.
- objects-v1.webp: 1254×1254 RGBA, 16 equal cells. Source exec-5a26a474-efbe-40d6-be69-ae652b32a79c.png.
- terrain-v1.webp: 1254×1254 RGB, 4 equal cells. Source exec-000e92b3-bfc6-44f4-8ac0-6115809413cc.png.

Prompt set: stylized-concept production sprite/terrain atlases for a modern Three Kingdoms 2D comic dungeon RPG. Clean thick charcoal outlines, readable cel-shading, warm highlights, restrained navy/emerald/ruby/gold. Characters: exact4×4 grid, full bodies/feet/weapons, isolated transparent cells: Liu Bei, Cao Cao, Sun Quan, Guan Yu / Zhang Fei, Zhao Yun, Zhuge Liang, imperial infantry / cavalry on foot, archer, scholar, healer / yellow-turban spear, archer, sorcerer, heavy boss. Objects: exact4×4 transparent grid: rice, potion, herb, scroll / chest, sword, spear, bow / fan, lamellar armor, jade seal, gate / descending stairs, spike trap, torch, purple ritual circle. Terrain: exact2×2 full-bleed tiles: slate floor, warm floor, wall cap, wall face; flat orthographic/top-down, no doors/torches. All: no text, labels, frames, UI, or background objects. Characters and objects explicitly requested actual alpha transparency.
