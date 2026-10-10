const REGISTRY = new Map();
export function registerMechanic(type, factory) {
    REGISTRY.set(type, factory);
}
export function createMechanics(specs) {
    return specs.map((spec) => {
        const factory = REGISTRY.get(spec.type);
        if (factory === undefined)
            throw new Error("Unknown floor mechanic: " + spec.type);
        return factory(spec.params ?? {});
    });
}
export function knownMechanics() {
    return [...REGISTRY.keys()].sort();
}
/**
 * E2 낙양 화재 추격: the capital burns. After `limit` turns the fire reaches the party:
 * every `interval` turns it deals `ratio` max-HP damage (can KO) and alerts the floor.
 */
registerMechanic("burning-capital", (params) => {
    const limit = params.limit ?? 120;
    const interval = params.interval ?? 2;
    const ratio = params.ratio ?? 0.04;
    return {
        type: "burning-capital",
        onTurnEnd(ctx) {
            if (ctx.turn === Math.floor(limit / 2))
                ctx.emit("낙양의 불길이 번지고 있다. 서둘러 빠져나가야 한다!");
            if (ctx.turn === limit) {
                ctx.emit("불길이 덮쳐 왔다! 계단을 찾아라!");
                ctx.alertAll();
            }
            if (ctx.turn > limit && (ctx.turn - limit) % interval === 0)
                ctx.damageParty(ratio, true);
        },
        status(turn) {
            const left = limit - turn;
            return { label: "화재", value: left > 0 ? left + "턴" : "번짐", urgent: left <= 20 };
        },
    };
});
/**
 * E3/E6 수공: rising water. Every `interval` turns the water rises one stage; from stage `harm`
 * on, each rise costs food (supplies soaked) and damages the party lightly.
 */
registerMechanic("flood", (params) => {
    const interval = params.interval ?? 30;
    const harm = params.harm ?? 3;
    let stage = 0;
    return {
        type: "flood",
        onTurnEnd(ctx) {
            if (ctx.turn === 0 || ctx.turn % interval !== 0)
                return;
            stage += 1;
            if (stage === 1)
                ctx.emit("물이 차오르기 시작했다.");
            if (stage >= harm) {
                ctx.addFood(-3);
                ctx.damageParty(0.03, false);
                ctx.emit("물에 잠긴 통로에서 군량이 젖는다!");
            }
        },
        status() { return { label: "수위", value: String(stage), urgent: stage >= harm }; },
    };
});
/** E4 오소 야습 / E9 보급 호송: a timed objective; food bonus if the stairs are reached quickly. */
registerMechanic("night-raid", (params) => {
    const limit = params.limit ?? 90;
    return {
        type: "night-raid",
        onTurnEnd(ctx) {
            if (ctx.turn === limit) {
                ctx.emit("날이 밝았다. 적이 경계를 강화한다!");
                ctx.alertAll();
                ctx.reinforce();
            }
        },
        status(turn) { const left = limit - turn; return { label: "야음", value: left > 0 ? left + "턴" : "발각", urgent: left <= 15 }; },
    };
});
/** E5/E7 화공: fire spreads through the floor over time and periodically scorches the party. */
registerMechanic("spreading-fire", (params) => {
    const start = params.start ?? 60;
    const interval = params.interval ?? 10;
    const ratio = params.ratio ?? 0.05;
    return {
        type: "spreading-fire",
        onTurnEnd(ctx) {
            if (ctx.turn === start)
                ctx.emit("불길이 번지기 시작했다!");
            if (ctx.turn > start && (ctx.turn - start) % interval === 0)
                ctx.damageParty(ratio, false);
        },
        status(turn) { return { label: "화염", value: turn < start ? (start - turn) + "턴" : "확산", urgent: turn >= start - 10 }; },
    };
});
/** E6 매복 / E8 남만: hidden troops ambush periodically from out of view. */
registerMechanic("ambush", (params) => {
    const interval = params.interval ?? 40;
    const chance = params.chance ?? 0.5;
    return {
        type: "ambush",
        onTurnEnd(ctx) {
            if (ctx.turn > 0 && ctx.turn % interval === 0 && ctx.rng.chance(chance)) {
                ctx.reinforce();
                ctx.emit("복병이다!");
            }
        },
    };
});
/** E8 독천·장기: miasma slowly poisons the party unless food is spent on remedies. */
registerMechanic("miasma", (params) => {
    const interval = params.interval ?? 15;
    return {
        type: "miasma",
        onTurnEnd(ctx) {
            if (ctx.turn > 0 && ctx.turn % interval === 0) {
                ctx.damageParty(0.02, false);
                ctx.addFood(-1);
            }
        },
        status() { return { label: "장기", value: "중독", urgent: false }; },
    };
});
/** E9 거점 방어: enemies keep coming in waves; holding out longer is rewarded via the stairs only after `hold` turns. */
registerMechanic("siege-waves", (params) => {
    const interval = params.interval ?? 25;
    return {
        type: "siege-waves",
        onTurnEnd(ctx) {
            if (ctx.turn > 0 && ctx.turn % interval === 0) {
                ctx.reinforce();
                ctx.emit("적의 공세가 이어진다!");
            }
        },
        status(turn) { return { label: "공세", value: String(Math.floor(turn / interval) + 1) + "파", urgent: false }; },
    };
});
/** E5 장판파 추격: the pursuing army closes in — reinforcements arrive every `interval` turns and the floor is alerted. */
registerMechanic("pursuit", (params) => {
    const interval = params.interval ?? 35;
    const grace = params.grace ?? 20;
    return {
        type: "pursuit",
        onTurnEnd(ctx) {
            if (ctx.turn === grace)
                ctx.emit("뒤에서 추격대의 말발굽 소리가 들린다!");
            if (ctx.turn > grace && (ctx.turn - grace) % interval === 0) {
                ctx.reinforce();
                ctx.alertAll();
                ctx.emit("추격대가 따라붙었다!");
            }
        },
        status(turn) {
            if (turn < grace)
                return { label: "추격", value: (grace - turn) + "턴", urgent: false };
            const next = interval - ((turn - grace) % interval);
            return { label: "추격", value: next + "턴", urgent: next <= 8 };
        },
    };
});
/** E9 목우유마 보급 호송: supply carts arrive every `interval` turns (+food) while raiders shadow the convoy. */
registerMechanic("wooden-ox", (params) => {
    const interval = params.interval ?? 30;
    const food = params.food ?? 6;
    const raidEvery = params.raidEvery ?? 2;
    let convoys = 0;
    return {
        type: "wooden-ox",
        onTurnEnd(ctx) {
            if (ctx.turn === 0 || ctx.turn % interval !== 0)
                return;
            convoys += 1;
            ctx.addFood(food);
            ctx.emit("목우유마 보급대가 도착했다. 군량 +" + food);
            if (convoys % raidEvery === 0) {
                ctx.reinforce();
                ctx.emit("위군이 보급로를 노린다!");
            }
        },
        status(turn) { return { label: "보급", value: (interval - (turn % interval)) + "턴", urgent: false }; },
    };
});
//# sourceMappingURL=mechanics.js.map