# DEC-025 — Ink Graphic Novel Art Direction

- State: `APPROVED`
- Date: `2026-10-05`
- Scope: Visual Design / Art Direction only

## Decision

게임의 최종 시각 방향은 **현대 수묵 그래픽 노블 × 삼국지 연환화**로 고정한다.

기존의 procedural pixel portrait, 16/32px character art, black/gold lacquer UI는 개발 이력과 fallback으로 유지할 수 있으나 **최종 Visual Source of Truth가 아니다**.

## Core Visual Language

### Palette
- Ink Black: `#171513`
- Warm Hanji: `#E8DDC4`
- Vermilion: `#A64032` ~ `#B34535`
- Muted Gray: `#756C63`
- Cool Blue Gray: `#77838D` — 제한적으로 사용

### Character
- 수묵 번짐 + 강한 선화 + 절제된 채색.
- 초상화/전신/탐험용 간이 캐릭터가 동일한 인물 실루엣과 의상 언어를 공유한다.
- 최종 초상화에 강제 pixelization을 사용하지 않는다.
- 작은 탐험 캐릭터는 단순화하되 generic pixel-chibi로 만들지 않는다.

### Map
- 기존 Procedural Grid / Room / Corridor topology는 그대로 유지한다.
- 바닥·벽·복도는 한지와 먹선 기반으로 표현한다.
- 미탐색 Fog of War는 먹이 고이는/번지는 수묵 안개로 표현한다.
- 계단, 보물상자, 항아리, 함정, 술법진, 적/플레이어 마커는 동일한 삽화형 icon language를 사용한다.

### UI
- 한지 바탕 + 먹색 구획선 + 붓글씨형 section label.
- 주홍은 Primary Action, Enemy/Warning, 인장 같은 의미 강조에 제한한다.
- 기존의 무거운 black/gold lacquer frame은 메인 UI 언어에서 제거한다.
- 장식보다 정보 계층과 모바일 가독성을 우선한다.

### Effects
- Slash: 먹 붓질/칼선
- Fire: 주홍·등색 번짐
- Smoke/Fog: 먹구름 번짐
- Heal: 절제된 옥색 원형 기운
- Buff: 상승 붓획
- Debuff: 자색/먹색 소용돌이

## Engineering Boundary

다음 Domain Logic은 아트 변경을 이유로 재작성하지 않는다.
- `src/battle/`
- `src/dungeon/`
- `src/run/`
- `src/content/`

Visual replacement는 우선 다음 surface에서 수행한다.
- `web/src/sprites.ts`
- `web/src/portraits.ts`
- `web/src/pixel.ts`
- `web/src/map.ts`
- `web/src/assets.ts`
- `web/style.css`

## Supersession

`docs/art/PORTRAIT_GUIDE.md`의 기존 SNES/pixel portrait 방향은 **final art direction 관점에서 SUPERSEDED**다. 파일 자체는 역사적 기록/fallback 용도로 유지한다.

## Human Gate

이 아트 방향을 다른 스타일로 material change하려면 사용자 승인이 필요하다.
