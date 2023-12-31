import * as Minecraft from "@minecraft/server";
import death from "./death";

const { world, system } = Minecraft;

system.runInterval(() => {
    const bool = world.getDynamicProperty("sendDyingMessage");
    if (bool !== undefined)
        world.getDimension("overworld").runCommandAsync(`gamerule showdeathmessages ${!bool}`);
}, 20);

world.afterEvents.entityHurt.subscribe((entityHurt) => {
    if (!world.getDynamicProperty("sendDyingMessage")) return;

    const { hurtEntity: player, damageSource, damage } = entityHurt;
    if (!(player instanceof Minecraft.Player)) return;
    
    // @ts-ignore
    if (player.getComponent("health")?.currentValue > 0) return;
    const { cause, damagingEntity: entity, damagingProjectile: projectile } = damageSource;
    let entityId = undefined, entityName = undefined, projectileName = undefined, entityType = undefined, trans = "death.attack.generic", with_ = [];
    try { entityId = entity?.typeId} catch {}
    try { entityName = entity?.nameTag || entity?.typeId} catch {}
    try { projectileName = projectile?.typeId} catch {}
    
    if (entityId && entityId.includes("minecraft:")) {
        if (entityId === "minecraft:player") entityType = "player";
            else entityType = "entity";
    }
    with_.push(player.nameTag);
    if (entityName) with_.push(entityName.replace("minecraft:", ""));
    if (entity instanceof Minecraft.Player) {
        /** @type {Minecraft.Container} */// @ts-ignore
        const container = entity.getComponent("minecraft:inventory").container;
        const item = container.getItem(entity.selectedSlot);
        if (item && item.nameTag) {
            projectileName = "item";
            with_.push(item.nameTag)
        };
    }
    // @ts-ignore
    try { trans = death[cause][entityType][projectileName] } catch { with_ = [player.nameTag] }
    player.runCommandAsync(`tellraw @a ${JSON.stringify({rawtext: [{text: "§" + world.getDynamicProperty("dyingMessageColor")},{translate: trans, with: with_}]})}`)
});

system.afterEvents.scriptEventReceive.subscribe(
    (scriptEventReceive) => {
        const { id, message, sourceEntity } = scriptEventReceive;

        if (id === "uwse:send_dying_message") {
            if (["true", "false"].includes(message)) {
                const bool = message === "true" ? true : false;
                world.setDynamicProperty("sendDyingMessage", bool);
                sendMsg(`send_dying_message has been set to ${bool}.`);
                world.getDimension("overworld").runCommandAsync(`gamerule showdeathmessages ${!bool}`);
            } else sendMsg(`send_dying_message is now ${world.getDynamicProperty("sendDyingMessage")}.`, sourceEntity);
        }

        if (id === "uwse:dying_message_color") {
            if (message.length === 1) {
                world.setDynamicProperty("dyingMessageColor", message);
                sendMsg(`dying_message_color has been set to §${message}THIS§r.`);
            } else sendMsg(`dying_message_color is now §${world.getDynamicProperty("dyingMessageColor")}THIS§r.`, sourceEntity);
        }
    },
    { namespaces: ["uwse"] }
);

/**
 * 
 * @param {string} msg 
 * @param {Minecraft.Player|Minecraft.Entity|undefined} player 
 */
function sendMsg(msg, player = undefined) {
    if (player instanceof Minecraft.Player) player.sendMessage(`§7[UWSE]§r ${msg}`);
        else world.sendMessage(`§7[UWSE]§r ${msg}`);
}