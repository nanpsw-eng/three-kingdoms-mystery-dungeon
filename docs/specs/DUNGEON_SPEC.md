# Dungeon Specification v0.1

Status: `BASELINE`

## 1. Run Structure
표준 12~15층.
MVP 황건전 15층:
- 1~4F 일반
- 5F 장보
- 안전 정비구역
- 6~9F 일반
- 10F 장량
- 안전 정비구역
- 11~14F 고난도
- 15F 장각

## 2. Procedural Generation
- 층당 5~9개 방
- 평균 약 7개
- Seed 기반 결정론적 생성
- 모든 필수 지점 Reachability 보장
- 시작방과 계단방 최소 거리 규칙
- 일부 막다른길과 Loop 허용

권장 알고리즘 초안:
Room placement → graph candidate → MST → optional extra edges → corridor carve → validation.

## 3. Vision
- 방: 입장 시 전체 공개
- 복도: 제한 시야
- 적 기본 복도 탐지 약 3칸 Seed
- 발견한 지형은 지도에 유지
- 움직이는 적은 현재 시야 기준 표시

## 4. Time
플레이어 1행동 = 던전 1턴.
턴 소비:
- move
- wait
- item
- search
- object interaction
- equipment change

제자리 방향전환: 0턴.

## 5. Enemy AI
최소 상태:
`IDLE → PATROL → ALERT → CHASE → SEARCH → ENGAGE`

방에서는 상호 즉시 발견.
복도에서는 방향/거리 기반 탐지.

## 6. Surprise
- 적 후방 미발견 접촉 → Player Surprise
- 플레이어 후방 접촉 → Enemy Surprise
- 정면/측면 → normal engagement

## 7. Food
기본 군량 100.
Seed: 10턴당 -1.

0일 때:
- 자연회복 중단
- 지속 피해 가능
- 전투 시작 페널티 가능

## 8. Natural Recovery
탐험 중만 적용.
Seed: 3턴마다 Max HP 약 1%.

따라서 회복은 군량·시간·증원 위험을 소비한다.

## 9. Floor Danger
UI 단계:
- 안정
- 경계
- 위험

정확한 남은 턴 수는 표시하지 않는다.
위험도 상승 시 증원/추적/수색 압박이 증가한다.

## 10. Reinforcement
장기 체류 시 낮은 빈도로 추가 적 생성.
- 현재 시야 Spawn 금지
- 먼 방 우선
- 계단 인접 제외
- 활성 적 수 Cap
- 증원 적 EXP/전리품 감소

## 11. Traps
기본 Hidden.
MVP 후보:
- 낙석
- 독침
- 화염진
- 구덩이
- 경보종
- 군량 손실
- 혼란진
- 전이진

주변 탐색은 1턴 소비.
발견한 함정은 적에게도 적용 가능.

## 12. Secret Areas
낮은 확률로 비밀방/숨은 통로.
평균적으로 15층 Run에서 2~4회 수준을 목표 Seed로 둔다.

AUTO는 자동으로 찾아내지 않고, 단서 발견 시 중지한다.

## 13. Floor Modifiers
전체 층의 일부에 적용.
예:
- Fog
- Night
- Strong Wind
- Dry
- Rain
- Smoke

새 스탯보다 기존 시야/화염/연막/탐지 규칙을 수정한다.

## 14. Auto Explore
미탐색 영역으로 동일 Turn Engine을 고속 실행.
다음에 즉시 중지:
- enemy
- trap hint
- item
- special room
- event
- stair
- recruit encounter
- secret hint
- low HP/food risk

## 15. Stairs
계단 사용 전 추가 탐색 가능.
사용 후 이전 층 복귀 불가.

## 16. Expedition-specific Mechanics
### Yellow Turban Rebellion
- Alarm Network
- Sorcery Formation

### Hulao Gate Preview
- Gates/Doors
- Stationary defenders
