# Balance Seed v0.1

Status: `SEED / NOT_VALIDATED`

이 문서의 숫자는 구현 초기값이며 최종 밸런스가 아니다.

## Battle

### Base
- Crit chance: 5%
- Crit damage: 150%
- Base evasion: 3%
- Random variance: 0.95~1.05

### Skill Power
- Basic attack: 18
- Light skill: 26~32
- Standard skill: 32~38
- Heavy skill: 38~44
- Ultimate: 42~55
- AoE per-target multiplier: 0.70~0.85

### Energy
- Max: 100
- Basic attack: +18
- Hit received: +8
- Guard: +20
- Kill: +12
- Critical: +5
- Ultimate: -100

### Surprise
- Initial energy bonus: +15 candidate
- Timeline advantage: about 20% candidate

### KO Recovery
- Post-battle recovery: about 10% max HP candidate

## Dungeon
- Food max: 100
- Food consumption: 1 / 10 turns candidate
- Natural heal: ~1% Max HP / 3 turns candidate
- Rooms: 5~9 per standard floor
- Secret floor occurrence: about 15~25% of eligible floors
- Floor modifier occurrence: about 25~35% of eligible floors

## Growth
- Party level cap: 10
- Trait levels: 2 / 4 / 6 / 8 / 10
- Trait reroll: 2 per Run
- Trait related-tag weight: ×1.5~2.0
- Character base-stat spread target: roughly 10~20%

## Economy
- Shared inventory: 10 slots
- Equipment slots: weapon / armor / treasure
- Equipment enhancement cap candidate: +3

## Validation Required
- Average battle actions
- Auto vs Manual performance delta
- Character win rates
- Party-composition bias
- Average fights per floor
- Food consumption distribution
- 15F completion time
- Run failure causes
- Trait pick diversity

All items above: `NOT_RUN`.
