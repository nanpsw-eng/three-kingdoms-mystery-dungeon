# S0 기반 시스템 — 근거 보고

- 날짜: 2026-10-05 · 브랜치 `feature/story-expansion` · 근거 계획: `STORY_EXPANSION_PLAN.md` §4·§5 (DEC-024)

## 구현 범위
| ID | 내용 | 위치 |
|---|---|---|
| X1 스토리 장면 | 전역 intro/outro, 층 진입(`floorEnter`), 보스 격파(`bossDefeated`), 페이즈 전환 장면. 군주별 대사(`variants`), 선택지 효과(`RunEffect`) | `src/run/types.ts`, `src/run/engine.ts`(`scene` 단계·명령), `src/content/scenes.ts` |
| X2 연표 데이터 | 전역 `order`·`era`·`summary` (화면은 S1 이후) | `src/content/campaigns.ts` |
| X3 기믹 플러그인 | 층 단위 턴 종료 훅 레지스트리 + 7종 등록(화재 추격·수공·야습·화공 확산·매복·장기·공세) | `src/dungeon/mechanics.ts`, `DungeonEngine.mechanicStatus()` |
| X5 일기토 | 적 그룹 `duel` → 전투 전 `duel` 단계. 1:1 Smart Auto 결투, 승리 시 적장 HP×(1−penalty), 패배 시 출전 장수 HP 1·적 기력 +30, 거절 가능 | `RunEngine.#fightDuel`, 상수 `src/run/balance.ts` |
| X6 적장 등용 | 적 그룹 `recruit{characterId, chance}` → 격파 후 영입 제안, 영입 시 `applyRunToMeta`에서 영구 해금 | `#offerEnemyRecruit`, `src/run/meta.ts` |
| X7 다단계 보스 | `nextPhase` 체인: 같은 조우에서 다음 페이즈 전투 연속(사이 특성 선택·장면 허용, 퇴각·기습 없음) | `#finishBattle` |
| X9 콘텐츠 검증 | 참조 무결성(스킬·특성·그룹·장면·기믹·전리품·해금·페이즈 순환·층 순서·최종 보스) | `src/content/validate.ts` |
| UI | 장면·일기토 시트, HUD 기믹 상태 | `web/src/story.ts`(신규), `main.ts`·`text.ts` 최소 접점 |

## 검증 (실행함)
| 항목 | 결과 |
|---|---|
| `npm test` | 142 passed / 0 failed (신규 `test/story.test.mjs` 7건 포함) |
| 결정론 | 동일 seed+명령 → 동일 `stateHash` (장면·일기토·페이즈·등용 경로) |
| `validateContent(MVP_CONTENT)` | 오류 0건 |
| E1 시뮬 (smart, 200회) | 클리어율 35.0% — 게이트 20~35% 상단. 근거 `docs/reports/sim/s0-yellow-turban-smart-200.json` |
| 웹 빌드 + UI 스모크(Chromium 390×844) | PASS, 인트로 장면 렌더 확인. 콘솔 오류는 외부 폰트 인증서 1건(샌드박스 프록시, 기존과 동일) |

## 미검증 / 다음
- 사람 플레이: 장면 분량·템포, 일기토 선택 체감 `NOT_RUN`
- E1에는 일기토·등용 미적용(역사 고증상 해당 보스 없음) → S1(화웅·여포·동탁)부터 적용
- 연표 화면(X2 UI)은 전역 수가 늘어나는 S1에서 추가
