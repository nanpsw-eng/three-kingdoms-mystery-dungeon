# 캐릭터 초상화 제작 가이드 (C안 · AI 이미지)

목표: 장수 15명 + 적·보스 13종의 초상화를 AI 이미지 도구로 만들고, 게임이 실행 중에 자동으로 **48×48 도트(28색)**로 변환해 사용한다. 원본은 회화풍이어도 되지만, 아래 공통 스타일을 지켜야 28종이 한 세트로 보인다.

## 1. 파일 규격
- 정사각형 1024×1024 PNG (최소 512×512)
- **흉상**(머리~가슴), 얼굴이 화면 위쪽 1/3~1/2, 시선은 정면 또는 살짝 오른쪽
- 배경: 단색 짙은 먹색 `#1b1511` (변환 시 배경이 그대로 들어가므로 무늬·풍경 금지)
- 글자·서명·워터마크·테두리 금지
- 파일명: 아래 표의 `id` 그대로 (예: `guan-yu.png`)

## 2. 공통 스타일 프롬프트 (모든 캐릭터 앞에 붙여 사용)
```
16-bit SNES-era JRPG character portrait, bust shot, Romance of the Three Kingdoms,
late Han dynasty China, bold readable silhouette, strong rim light from upper left,
limited muted palette, painterly pixel-art style, solid dark background #1b1511,
no text, no watermark, no frame, centered, square composition
```
- 같은 도구·같은 스타일 설정(가능하면 스타일 레퍼런스/시드 고정)으로 연속 생성
- 첫 3장(유비·조조·손권)을 먼저 만들어 톤을 확정한 뒤 그 이미지를 스타일 레퍼런스로 나머지 생성 권장

## 3. 캐릭터별 프롬프트 (공통 스타일 뒤에 이어 붙임)

### 군주
| id | 이름 | 프롬프트 |
|---|---|---|
| liu-bei | 유비 | benevolent warlord, gentle eyes, short black beard, green robe with gold trim, jade crown with bead strings, twin swords on back |
| cao-cao | 조조 | cunning ambitious warlord, sharp eyes, thin goatee, dark navy robe with crimson trim, black crown, sword at shoulder |
| sun-quan | 손권 | young southern lord, purple-tinged beard, crimson robe with gold trim, red crown, calm commanding look |

### 장수
| id | 이름 | 프롬프트 |
|---|---|---|
| guan-yu | 관우 | red-faced general, very long flowing black beard, green headscarf and green robe, Green Dragon Crescent Blade glaive |
| zhang-fei | 장비 | fierce wild-eyed general, thick bristly black beard, dark steel armor, serpent spear |
| zhao-yun | 조운 | handsome young general, silver-white armor with blue trim, white helmet with red tassel, spear, no beard |
| huang-zhong | 황충 | veteran old archer, long white beard and white hair, orange-bronze armor, longbow |
| zhuge-liang | 제갈량 | serene strategist, black scholar's hat, white robe with navy trim, white crane-feather fan, thin mustache |
| zhang-liao | 장료 | stern cavalry general, purple armor with gold trim, purple helmet, halberd, mustache |
| xiahou-dun | 하후돈 | one-eyed general with black eyepatch, navy armor and helmet, spear, short beard |
| jia-xu | 가후 | sly middle-aged advisor, dark grey robe, black scholar's hat, goatee, holding a scroll |
| taishi-ci | 태사자 | loyal archer general, red headband, teal armor, short beard, bow |
| zhou-yu | 주유 | elegant handsome commander, hair in topknot with gold pin, crimson and white robe, sword, no beard |
| gan-ning | 감녕 | former river pirate general, red bandana, brown leather armor, bells on belt, mustache, roguish grin |
| hua-tuo | 화타 | legendary old physician, white hair bun, long white beard, light green robe, medicine gourd |

### 적·보스
| id | 이름 | 프롬프트 |
|---|---|---|
| yt-spear | 황건 창병 | Yellow Turban rebel spearman, yellow headband, worn brown tunic, spear |
| yt-archer | 황건 궁병 | Yellow Turban rebel archer, yellow headband, short beard, bow |
| yt-raider | 황건 기병 | Yellow Turban raider, yellow turban, leather armor, mustache, sword |
| yt-sorcerer | 황건 술사 | Yellow Turban sorcerer, yellow hood, goatee, staff with talisman |
| yt-chanter | 태평도 신도 | Way of Peace fanatic, shaved head, yellow robe, paper talisman |
| boss-zhang-bao | 장보 | Zhang Bao the sorcerer general, orange turban and robe, full black beard, red-orb staff, menacing |
| boss-zhang-liang | 장량 | Zhang Liang the sorcerer general, purple turban and robe, goatee, green-orb staff, menacing |
| boss-zhang-jiao | 장각 | Zhang Jiao the Lord of Heaven, golden tall hat and golden robe, long white beard, glowing staff, ominous aura |
| dong-halberd | 동탁군 극병 | Dong Zhuo's soldier, dark red lacquered armor and helmet, halberd |
| xiliang-cavalry | 서량 기병 | Xiliang horseman, fur hat, brown leather, spear, weathered face |
| dong-archer | 동탁군 궁병 | Dong Zhuo's archer, dark red armor and helmet, bow |
| gate-guard | 관문 수비대 | heavy gate guard, steel armor, large red shield |
| boss-hua-xiong | 화웅 | Hua Xiong the fearsome general, horned black helmet, dark armor, red beard, huge broad blade |

## 4. 전달 방법
1. 생성한 PNG를 채팅에 첨부(파일명 유지)하거나 `web/assets/portraits/` 에 커밋
2. Claude가 `web/assets/manifest.json` 의 `"portraits"` 목록에 id를 추가 → 다음 빌드부터 해당 캐릭터만 교체, 나머지는 기존 도트 초상화 유지
3. 변환 품질 조정: `portraitPixels`(기본 48), `portraitColors`(기본 28)

## 5. 권리 확인 (필수)
- 사용하는 AI 도구의 약관에서 **상업적 이용 허용 여부**를 확인 (유료 플랜에서만 허용하는 도구가 있음)
- 실존 작품(기존 게임·만화)의 캐릭터를 모방하라는 지시는 넣지 않는다
- 정식 출시 단계에서 외주 작가(D안)로 교체 시에도 같은 id·규격을 쓰면 코드 변경 없음
