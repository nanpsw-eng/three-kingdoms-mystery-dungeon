# Visual Bible v1 — 현대 수묵 그래픽 노블

Status: `APPROVED_BASELINE`
Art Decision: `docs/decisions/DEC-025-ART_DIRECTION.md`

## Reference Boards

Repository reference thumbnails:
- `docs/art/reference/visual-bible-v1.jpg`
- `docs/art/reference/ruler-comparison-v1.jpg`
- `docs/art/reference/gameplay-target-v1.jpg`

> 위 이미지는 Repository에서 빠르게 확인하기 위한 downscaled reference다. 고해상도 원본은 ChatGPT 작업공간에서 생성되었으며, 이후 원본 Asset Pipeline이 정리되면 동일 디자인 기준으로 고해상도 master를 재-export한다. 텍스트 규칙과 위 3개 reference를 함께 Visual Source of Truth로 사용한다.

## 1. Visual Hierarchy

1. Warm Hanji neutral ground
2. Black ink structure / typography / silhouette
3. Vermilion semantic accent
4. Character-specific muted palette
5. Environmental wash/effects

화면마다 새 장식 언어를 만들지 않는다.

## 2. Character Masters

### 유비
- Palette: warm ivory / muted beige / subdued crimson / ink black
- Impression: 인의, 결속, 온화하지만 약하지 않은 권위
- Silhouette: 문무를 겸한 군주, 열린 자세, 정제된 수염과 상투
- Avoid: 지나치게 젊은 미소년, 황금 갑옷 과잉, 성직자 같은 표현

### 조조
- Palette: charcoal / black / deep crimson / muted bronze
- Impression: 지략, 결단, 냉철한 위엄
- Silhouette: 무게 중심이 낮고 단단한 지휘관, 날카로운 시선
- Avoid: 순수 악역 표정, 과도한 판타지 갑주

### 손권
- Palette: cool blue gray / dark green / beige / ink
- Impression: 균형, 통찰, 젊은 권위
- Silhouette: 유비보다 젊고 조조보다 유연한 남방 군주
- Avoid: 조운과 혼동되는 무장형 미소년 실루엣

### Consistency Rule
각 캐릭터는 다음 3종이 반드시 같은 사람으로 보여야 한다.
- Bust portrait
- Full-body combat/event illustration
- Simplified exploration token

## 3. Map / Dungeon Language

- Grid geometry는 명확히 읽혀야 한다.
- Explored floor: 밝은 한지/석재 먹선.
- Wall: 두꺼운 먹 테두리와 거친 석재 brush texture.
- Corridor: 방보다 좁고 방향성이 강한 선.
- Unexplored: 평면 검정이 아니라 번진 먹안개.
- Stair: 흑백 고대 건축식 계단 icon.
- Chest / Pot / Trap / Sorcery Formation: 삽화형 object icon.
- Player / Enemy: small illustrated marker, silhouette 우선.
- Environment Modifier는 tile readability를 훼손하지 않는 overlay로 처리.

## 4. Item Icon Language

모든 item icon은 작은 화면에서 1초 내 구별 가능해야 한다.
- Food: 그릇/쌀/주머니
- Potion/Medicine: 둥근 약병/호리병
- Scroll: 말린 죽간/두루마리
- Weapon: 단순한 검/창/활 실루엣
- Armor: 흉갑 중심
- Treasure: 궤/옥새/부적 등 고유 외형

색보다 silhouette가 먼저 구별되어야 한다.

## 5. UI Component Language

### Panel
- 한지 바탕
- 1~2px 먹선
- 일부 모서리만 거친 붓결
- 불필요한 금테 금지

### Section Header
- 검은 붓칠 strip + 미색/백색 제목
- 중요한 경고만 주홍 인장/붓칠

### Primary Buttons
- Attack / Confirm 같은 primary: muted vermilion
- Skill / Auto / Bag: ink-charcoal 또는 muted blue/green
- Touch target: 최소 44px

### Bars
- HP: muted vermilion
- Energy: warm ochre
- neutral backing: paper gray / ink outline
- 과도한 glossy gradient 금지

### Timeline
- 작은 초상 또는 실루엣 chip
- 순서가 정보의 핵심이며 장식이 우선하지 않는다.

## 6. VFX

- Hit/Slash: 짧은 먹 붓획 + 순간 백색 highlight
- Fire/Burn: 주홍/등색 먹 번짐
- Poison: 탁한 청록
- Smoke/Fog: 회흑색 수묵
- Heal: 연한 옥색 원형 brush ring
- Buff: 상승 획
- Debuff/Confusion: 먹+자색 swirl
- KO: 채도 저하 + 먹 번짐

## 7. Typography

- Display/section: 한글 명조/붓글씨 계열의 절제된 사용
- Body/stat: 모바일 가독성 우선 고딕
- 숫자/stat은 tabular alignment 유지
- 배경 texture가 글자 contrast를 침범하지 않도록 한다.

## 8. Do Not

- generic glossy mobile-fantasy UI
- SSR/gacha rarity frame
- heavy gold-border system
- photorealistic full-scene rendering
- anime/pixel/matte-painting을 한 화면에서 혼합
- procedural pixelized portrait를 final asset으로 사용
- texture 때문에 정보가 흐려지는 디자인

## 9. Implementation Strategy

기존 DOM/Canvas behavioral contract를 보존한다.

1. CSS design tokens를 ink-paper system으로 전환
2. Title → Dungeon → Battle 한 vertical slice 먼저 완성
3. 군주 3인 portrait/full-body/token을 master sample로 적용
4. Map tile/Fog/object language 적용
5. Item icons 적용
6. 나머지 12 장수와 적/보스 확장
7. 누락 Asset은 기존 procedural fallback 허용
8. 전체 교체 완료 후 fallback 축소

모든 단계에서 `npm test`, `npm run build:web`, UI smoke를 회귀검증한다.
