// E1 황건적의 난 (184) — 연의 기준, 공통 역사 시점 + 군주별 대사 (STORY_EXPANSION_PLAN §1).
export const YT_SCENES = [
    {
        id: "yt-intro", title: "창천이사 황천당립",
        lines: [
            { name: "해설", text: "중평 원년, 거록의 장각이 '창천은 이미 죽었고 황천이 일어서리라' 외치며 봉기했다." },
            { name: "해설", text: "누런 두건을 두른 무리가 각지의 관아를 불태우고, 조정은 의용군을 모집한다." },
        ],
        variants: {
            "liu-bei": [
                { name: "해설", text: "탁현의 방문 앞, 한실의 종친 유비는 긴 한숨을 내쉰다." },
                { speaker: "liu-bei", name: "유비", text: "백성이 도탄에 빠졌는데 나는 짚신만 엮고 있구나. 이제 일어설 때다." },
            ],
            "cao-cao": [
                { name: "해설", text: "기도위 조조에게 영천의 황건적 토벌 명이 떨어졌다." },
                { speaker: "cao-cao", name: "조조", text: "난세는 곧 기회다. 이 난을 평정해 이름을 떨치겠다." },
            ],
            "sun-quan": [
                { name: "해설", text: "강동의 손견이 의병을 일으켜 북상한다. 어린 손권도 그 뒤를 따랐다." },
                { speaker: "sun-quan", name: "손권", text: "아버님의 깃발 아래, 강동의 이름을 천하에 알리겠습니다." },
            ],
        },
    },
    {
        id: "yt-f6", title: "광종으로",
        lines: [
            { name: "해설", text: "장보를 쓰러뜨렸지만 황건의 기세는 꺾이지 않았다. 길가에 굶주린 피난민이 줄을 잇는다." },
            { name: "해설", text: "행군을 서두를 것인가, 백성을 돌볼 것인가." },
        ],
        choices: [
            { label: "군량을 나눠 민심을 얻는다", effects: [{ kind: "food", amount: -15 }, { kind: "exp", amount: 40 }] },
            { label: "행군을 서두른다", effects: [{ kind: "food", amount: 10 }] },
        ],
    },
    {
        id: "yt-zhang-bao-down", title: "지공장군 격파",
        lines: [
            { speaker: "boss-zhang-bao", name: "장보", text: "형님… 황천의 시대가… 아직…" },
            { name: "해설", text: "요술을 부리던 장보가 쓰러졌다. 그러나 광종에는 장량이, 그리고 그 뒤에는 대현량사 장각이 있다." },
        ],
    },
    {
        id: "yt-zhang-liang-down", title: "인공장군 격파",
        lines: [
            { speaker: "boss-zhang-liang", name: "장량", text: "천공장군께서 너희를 용서치 않으리라!" },
            { name: "해설", text: "장량의 진이 무너지자 황건의 본진, 장각의 제단으로 가는 길이 열렸다." },
        ],
    },
    {
        id: "yt-f11", title: "태평도의 제단",
        lines: [
            { name: "해설", text: "공기가 무겁다. 부적이 바람에 날리고, 곳곳에서 주문 외는 소리가 들린다." },
            { name: "해설", text: "술법진을 밟으면 적이 기세를 얻는다. 조심해서 나아가자." },
        ],
    },
    {
        id: "yt-zhang-jiao-down", title: "천공장군의 최후",
        lines: [
            { speaker: "boss-zhang-jiao", name: "장각", text: "하늘이… 나를 버리는가…" },
            { name: "해설", text: "대현량사 장각이 쓰러지고, 누런 깃발이 하나둘 내려간다." },
        ],
    },
    {
        id: "yt-outro", title: "난의 끝, 난세의 시작",
        lines: [
            { name: "해설", text: "황건적의 난은 평정되었다. 그러나 공을 세운 이들에게 돌아온 것은 보잘것없는 벼슬뿐." },
            { name: "해설", text: "낙양에서는 십상시와 외척이 다투고, 서량의 동탁이 군대를 이끌고 수도로 향한다." },
        ],
        variants: {
            "liu-bei": [
                { speaker: "liu-bei", name: "유비", text: "백성을 구했으나 조정은 여전히 썩어 있구나. 아우들아, 우리의 길은 이제 시작이다." },
                { name: "해설", text: "그리고 낙양으로, 서량의 동탁이 군대를 이끌고 들어선다." },
            ],
            "cao-cao": [
                { speaker: "cao-cao", name: "조조", text: "황건은 쓸어냈다. 다음은 저 썩은 조정이다." },
                { name: "해설", text: "그리고 낙양으로, 서량의 동탁이 군대를 이끌고 들어선다." },
            ],
            "sun-quan": [
                { speaker: "sun-quan", name: "손권", text: "강동의 이름이 천하에 울렸다. 아버님, 다음은 어디입니까?" },
                { name: "해설", text: "그리고 낙양으로, 서량의 동탁이 군대를 이끌고 들어선다." },
            ],
        },
    },
];
export const YT_CAMPAIGN_SCENES = {
    intro: "yt-intro",
    outro: "yt-outro",
    floorEnter: { 6: "yt-f6", 11: "yt-f11" },
    bossDefeated: { "boss-zhang-bao": "yt-zhang-bao-down", "boss-zhang-liang": "yt-zhang-liang-down", "boss-zhang-jiao": "yt-zhang-jiao-down" },
};
//# sourceMappingURL=scenes.js.map