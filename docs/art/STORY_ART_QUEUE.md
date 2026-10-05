# 스토리 확장 아트 대기열 (Codex 참고)

- 기준 화풍: `DEC-025` 수묵 그래픽 노블 (`docs/art/VISUAL_BIBLE_V1.md`). `PORTRAIT_GUIDE.md`의 도트 방향은 SUPERSEDED.
- 아래 키는 현재 `web/src/story.ts`의 `ART_ALIASES`로 **기존 그림을 임시 대체** 중이다. 그림이 생기면 해당 별칭 줄을 지우면 된다(Claude가 병합 시 정리).
- 키 규칙: 플레이어 장수 = 캐릭터 id, 적/보스 = 유닛 이름(한글).

| 전역 | 플레이어 장수 (id) | 적·보스 (유닛 이름) |
|---|---|---|
| E2 반동탁연합 | lu-bu, sun-jian, yuan-shao, cao-ren, hua-xiong | 여포, 동탁, 이유, 방화병, 서량 친위대 |
| E3 서주 쟁탈 | chen-gong, zang-ba, gao-shun, mi-zhu | 원술군 보병, 원술군 궁병, 산적, 병주 기병, 함진영, 수군, 기령, 원술, 고순, 진궁 |
| E4 관도대전 | xu-chu, dian-wei, xun-yu, yan-liang, wen-chou | 하북 보병, 하북 강노병, 하북 기병, 조조군 관문병, 오소 수비병, 하북 대극사, 공수, 맹탄, 변희, 왕식, 안량, 문추, 원소 |
| E5 적벽대전 | lu-su, huang-gai, pang-tong, cheng-pu | 조조군 보병, 청주병, 호표기, 형주 수군, 몽충, 조조군 궁병, 하후은, 채모, 장윤, 조조, 허저 |

이후 전역(E5~E9)이 추가될 때마다 이 표에 행을 덧붙인다.
