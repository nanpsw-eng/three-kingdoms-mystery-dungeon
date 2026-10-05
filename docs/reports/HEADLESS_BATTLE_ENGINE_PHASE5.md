# Headless Battle Engine — Phase 5 Smart Auto Evidence

Status: `PASS_LOCAL / REMOTE_PERSISTED / CI_NOT_RUN`
Date: `2026-10-05`
Branch: `feature/headless-battle-engine`
Remote code/test HEAD before evidence update: `0aa1b34511303c84f11908e9c0b32d2fc5f5725a`

## Scope

Extend Smart Auto from basic attack/guard into the approved shared Battle command contract without adding item or retreat automation.

## Implemented

- `chooseSmartCommand` evaluates:
  - basic attack
  - guard
  - owned active skills
  - owned ultimate skills
- Candidate generation obeys the same legal targeting contract used by manual commands.
- Multi-target skills enumerate legal target combinations.
- Utility scoring includes:
  - expected damage and lethal value
  - overkill penalty
  - healing value from missing HP
  - status/control value
  - timeline advance/delay value
  - energy gain/drain value
  - formation-swap protection value
  - energy-cost penalty
- Ultimate-specific overkill penalty prevents wasting 100 energy on targets already removable by cheaper actions.
- Deterministic tie-breaking keeps Smart Auto replayable.
- Smart Auto does **not** generate `item` or `retreat` commands by default, matching the approved product baseline.
- `simulateSmartBattle` reuses the same Battle Engine and Smart command chooser.

## Verification

Local reconstructed regression:

```bash
npm test
```

Observed:
- TypeScript strict build: `PASS`
- Total headless tests: `59 passed / 0 failed`
- Smart Auto dedicated tests: `7 PASS`
- 100 seeded skill-aware Smart Auto battles: all terminated below the 500-action cap
- Same seed skill-aware simulation: deterministic result/hash

Dedicated Smart Auto checks:
1. avoids wasteful Ultimate when basic attack is lethal
2. uses Ultimate when its value clearly exceeds basic attack
3. prioritizes useful healing
4. can prefer high-value control
5. never auto-uses item or retreat
6. deterministic skill-aware simulation
7. 100-seed no-soft-lock run

Remote persistence checks:
- `BattleEngine.ownedSkills()`: present
- `chooseSmartCommand`: present
- Ultimate overkill policy: present
- `simulateSmartBattle`: present
- remote `test/smart-auto.test.mjs`: 7 tests present

## Verification Boundary

- Local reconstructed code/test evidence: `PASS`
- Remote GitHub Actions/check on exact HEAD: `NOT_RUN`
- Production/UI runtime: `NOT_RUN`
- Final AI quality/balance: `NOT_VALIDATED`

## Remaining Battle-Core Gaps

- status duration lifecycle integrated with battle time
- poison/burn/bleed runtime damage
- stun runtime skip
- confusion runtime behavior
- status cleansing/expiry hooks
- richer Smart Auto once actual status runtime semantics are active
- full roster/5v5 balance validation

## Next

Implement deterministic status lifecycle and DOT/control runtime behavior before adding character-specific skill data.
