# Battle Specification v0.1

Status: `BASELINE`

## 1. Formation
- 최대 5 vs 5
- 전열: 좌/중/우 3슬롯
- 후열: 좌/우 2슬롯
- 전투 중 위치 변경은 1행동 소비
- 일부 스킬은 무료/강제 이동 가능

## 2. Targeting
- 근접 기본공격: 적 전열이 존재하면 전열만 가능
- 궁병: 기본공격으로 전/후열 타기팅 가능
- 기병: 기본은 전열, 돌파 스킬로 후열 가능
- 군사/지원: 스킬별 규칙
- 전열 전원 KO 시 후열 노출

## 3. Timeline
SPD 기반 개별 행동 순서.

초기 공식 후보:
`ActionDelay = 10000 / SPD × ActionSpeedModifier`

Timeline manipulation:
- delay
- advance
- extra action
- interrupt

## 4. Core Stats
- HP
- ATK
- DEF
- SPD
- INT

파생 스탯은 장비/특성/스킬에서 발생한다.

## 5. Damage Seed
Physical:
`Damage = SkillPower × (ATK / TargetDEF)^0.75 × RandomVariance × Modifier`

Strategy DEF:
`StrategyDEF = DEF × 0.5 + INT × 0.5`

Strategy:
`Damage = SkillPower × (INT / TargetStrategyDEF)^0.75 × RandomVariance × Modifier`

`RandomVariance = 0.95~1.05`

위 값은 `BALANCE_SEED`, 검증 전 확정 밸런스가 아니다.

## 6. Critical / Evasion
- Base Crit: 5%
- Crit Damage: 150%
- Base Evasion: 약 3%

높은 회피는 고유 스킬/특성으로만 제공한다.

## 7. Morale / Energy
기력 최대 100.

초기 Seed:
- 기본공격 +18
- 피격 +8
- 방어 +20
- 적 처치 +12
- 치명타 +5

궁극기: 100 소비.
전투 종료 시 기본 0으로 초기화.

## 8. Status Effects
MVP 8종:
- Poison
- Burn
- Bleed
- Confusion
- Stun
- Taunt
- Defense Down
- Timeline Delay

독/화상/출혈은 최대 3중첩. 나머지는 기본 중첩 없음.

## 9. Commands
- Attack
- Active Skill 1~3
- Guard
- Formation Change
- Item
- Retreat
- Ultimate

## 10. Automation
Modes:
- Manual
- All Attack
- Repeat
- Smart Auto

Speed:
- ×1
- ×2
- ×3

Manual/Auto 모두 동일 command contract 사용.

Smart Auto 평가 요소:
- kill probability
- damage value
- ally death risk
- healing need
- high-value enemy
- next timeline action
- status value
- energy efficiency
- overkill
- position exposure
- boss context

소비 아이템은 기본 Auto에서 사용하지 않는다.

## 11. KO
- 군주 포함 HP 0 → KO
- 생존 장수 있으면 전투 계속
- 전원 KO → Run fail
- 승리 후 KO 장수는 최대 HP 약 10%로 복귀하는 Seed 사용

## 12. Retreat
일반/정예: 조건부 가능.
보스: 기본 불가.

퇴각 명령 후 다음 적 행동까지 생존하면 성공하는 규칙을 Seed로 둔다.
퇴각 후 보상 없음, 기력 초기화, 적 유지/회복, ALERT 유지.

## 13. Surprise
미발견 적 후방 접촉:
- 아군 Timeline 우위
- 초기 기력 보정

아군 후방 접촉당함:
- 적에게 동일 계열 보정

정확한 계수는 `BALANCE_SEED.md`에서 관리한다.
