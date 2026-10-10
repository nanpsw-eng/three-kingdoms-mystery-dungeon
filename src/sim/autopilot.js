import { RunEngine } from "../run/engine.js";
/**
 * Deterministic baseline player policy for headless Run simulation (P13).
 * It is intentionally simple: explore, fight what it meets, heal/eat when low, take the first trait,
 * accept recruits, buy consumables in safe zones, leave the floor when explored or danger rises.
 */
export function runAutopilot(content, options) {
    const { onEvent: _onEvent, maxActions: _maxActions, ...runOptions } = options;
    const run = new RunEngine(content, { ...runOptions, battleMode: options.battleMode ?? "smart" });
    const maxActions = options.maxActions ?? 20_000;
    let actions = 0;
    let failCause = null;
    const note = (events) => {
        for (const event of events) {
            if (event.type === "run-failed")
                failCause = event.cause;
            options.onEvent?.(event, run);
        }
    };
    const act = (command) => { actions += 1; note(run.act(command)); };
    while (run.phase !== "cleared" && run.phase !== "failed" && actions < maxActions) {
        switch (run.phase) {
            case "battle":
                act({ type: "battle-mode", mode: options.battleMode ?? "smart" });
                break;
            case "trait-choice":
                act({ type: "choose-trait", traitId: run.pending()[0].kind === "trait" ? run.pending()[0].options[0] : "" });
                break;
            case "recruit":
                act({ type: "recruit", accept: true });
                break;
            case "event": {
                const pending = run.pending()[0];
                const event = run.event(pending.eventId);
                const affordable = event.choices.findIndex((choice) => choice.effects.every((effect) => effect.kind !== "gold" || effect.amount >= 0 || run.gold >= -effect.amount));
                act({ type: "event-choice", index: affordable >= 0 ? affordable : event.choices.length - 1 });
                break;
            }
            case "scene": {
                const pending = run.pending()[0];
                act({ type: "scene", ...(run.scene(pending.sceneId).choices.length > 0 ? { choice: 0 } : {}) });
                break;
            }
            case "duel": {
                // Answer the challenge with the healthiest strong general when fit; otherwise decline.
                const fit = run.party().filter((member) => member.hp / member.maxHp >= 0.8).sort((a, b) => b.stats.atk - a.stats.atk)[0];
                act({ type: "duel", characterId: fit?.characterId ?? null });
                break;
            }
            case "safe-zone": {
                const wants = ["treatment-kit", "medicine", "rice-sack", "herb", "bun", "elixir"];
                const index = run.shop().findIndex((offer) => !offer.sold && offer.price <= run.gold && wants.includes(offer.contentId) && run.inventory().length < 10);
                if (index >= 0)
                    act({ type: "shop-buy", offerIndex: index });
                else
                    act({ type: "leave-safe-zone" });
                break;
            }
            case "dungeon":
                dungeonTurn(run, act);
                break;
            default:
                break;
        }
    }
    const outcome = run.phase === "cleared" ? "cleared" : run.phase === "failed" ? "failed" : "stalled";
    return { summary: run.summary(), outcome, failCause, actions, stateHash: run.stateHash() };
}
function dungeonTurn(run, act) {
    const party = run.party();
    const bag = run.inventory();
    const findItem = (kind) => bag.find((entry) => entry.kind === "item" && run.item(entry.itemId)?.use.kind === kind)?.uid;
    const ko = party.find((member) => member.hp <= 0);
    const treat = findItem("treat");
    if (ko !== undefined && treat !== undefined) {
        act({ type: "use-item", uid: treat, targetId: ko.characterId });
        return;
    }
    const hurt = party.filter((member) => member.hp > 0 && member.hp / member.maxHp < 0.45).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
    const healUid = findItem("heal");
    if (hurt !== undefined && healUid !== undefined) {
        act({ type: "use-item", uid: healUid, targetId: hurt.characterId });
        return;
    }
    const foodUid = findItem("food");
    if (run.food <= 25 && foodUid !== undefined) {
        act({ type: "use-item", uid: foodUid });
        return;
    }
    for (const entry of bag) {
        if (entry.kind !== "equipment")
            continue;
        const slot = run.equipmentDef(entry.equipment.equipmentId).slot;
        const target = party.find((member) => member.equipment[slot] === undefined);
        if (target !== undefined) {
            act({ type: "equip", characterId: target.characterId, uid: entry.uid });
            return;
        }
    }
    const dungeon = run.dungeon;
    const stairs = dungeon.floor.stairs;
    const onStairs = dungeon.position.x === stairs.x && dungeon.position.y === stairs.y;
    const bossAlive = dungeon.floor.boss && !dungeon.bossDefeated;
    const urgent = dungeon.mechanicStatus().some((status) => status.urgent);
    const leaving = (dungeon.danger !== "stable" || run.food <= 10 || urgent) && dungeon.isExplored(stairs) && !bossAlive;
    if (onStairs && !bossAlive && (leaving || dungeon.frontierDirection() === null)) {
        act({ type: "dungeon", command: { type: "descend" } });
        return;
    }
    if (leaving) {
        const direction = dungeon.travelDirection(stairs);
        if (direction !== null) {
            act({ type: "dungeon", command: { type: "move", direction } });
            return;
        }
    }
    const visible = dungeon.visibleEnemies();
    // Rest (natural recovery) while hurt, the floor is calm and food allows it.
    const living = party.filter((member) => member.hp > 0);
    const hpRatio = living.reduce((sum, member) => sum + member.hp / member.maxHp, 0) / Math.max(1, living.length);
    if (visible.length === 0 && hpRatio < 0.7 && dungeon.danger === "stable" && run.food > 30 && !onStairs) {
        act({ type: "dungeon", command: { type: "wait" } });
        return;
    }
    if (visible.length > 0) {
        const target = [...visible].sort((a, b) => Math.abs(a.pos.x - dungeon.position.x) + Math.abs(a.pos.y - dungeon.position.y) - (Math.abs(b.pos.x - dungeon.position.x) + Math.abs(b.pos.y - dungeon.position.y)))[0];
        const direction = dungeon.travelDirection(target.pos);
        act(direction !== null ? { type: "dungeon", command: { type: "move", direction } } : { type: "dungeon", command: { type: "wait" } });
        return;
    }
    // Collect explored objects (recruits/events always; items when the bag has room).
    const bagFull = run.inventory().length >= 10;
    const wanted = dungeon.objects()
        .filter((object) => object.kind !== "sorcery" && dungeon.isExplored(object.pos) && !(object.kind === "item" && bagFull))
        .filter((object) => object.pos.x !== dungeon.position.x || object.pos.y !== dungeon.position.y)
        .sort((a, b) => Math.abs(a.pos.x - dungeon.position.x) + Math.abs(a.pos.y - dungeon.position.y) - (Math.abs(b.pos.x - dungeon.position.x) + Math.abs(b.pos.y - dungeon.position.y)));
    for (const object of wanted) {
        const direction = dungeon.travelDirection(object.pos);
        if (direction !== null) {
            act({ type: "dungeon", command: { type: "move", direction } });
            return;
        }
    }
    const before = dungeon.turn;
    const beforePos = dungeon.position;
    act({ type: "auto-explore", maxSteps: 60 });
    if (run.phase !== "dungeon")
        return;
    const after = run.dungeon;
    if (after.turn !== before || after.position.x !== beforePos.x || after.position.y !== beforePos.y)
        return;
    // Auto explore made no progress: walk toward unexplored space (crossing traps if needed) or the stairs/boss.
    const boss = bossAlive ? after.enemies().find((enemy) => enemy.boss) : undefined;
    const direction = after.frontierDirection(false)
        ?? (boss !== undefined ? after.travelDirection(boss.pos) : null)
        ?? (after.isExplored(stairs) ? after.travelDirection(stairs) : after.frontierDirection(true));
    if (direction !== null)
        act({ type: "dungeon", command: { type: "move", direction } });
    else if (onStairs && !bossAlive)
        act({ type: "dungeon", command: { type: "descend" } });
    else
        act({ type: "dungeon", command: { type: "search" } });
}
//# sourceMappingURL=autopilot.js.map