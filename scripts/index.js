import * as Minecraft from "@minecraft/server";
import death from "./death";

const { world, system } = Minecraft;

world.afterEvents.worldInitialize.subscribe((worldInitialize) => {
    const define = new Minecraft.DynamicPropertiesDefinition();

    define.defineBoolean("sendDyingMessage");

    worldInitialize.propertyRegistry.registerWorldDynamicProperties(define);

    if (world.getDynamicProperty("sendDyingMessage") === undefined)
        world.setDynamicProperty("sendDyingMessage", true);
});

system.runInterval(() => {
    const bool = world.getDynamicProperty("sendDyingMessage");
    if (bool !== undefined)
        world.getDimension("overworld").runCommandAsync(`gamerule showdeathmessages ${!bool}`);
}, 20);

world.afterEvents.entityHurt.subscribe((entityHurt) => {
    if (!world.getDynamicProperty("sendDyingMessage")) return;

    const { hurtEntity: player, damageSource, damage } = entityHurt;
    if (!(player instanceof Minecraft.Player)) return;

    console.warn(player.getComponent("minecraft:health").current, damage)
    if (player.getComponent("minecraft:health").current > 0) return;
    const { cause, damagingEntity: entity, damagingProjectile: projectile } = damageSource;
    let entityId = undefined, entityName = undefined, projectileName = undefined, entityType = undefined, trans = "death.attack.generic", with_ = [];
    try { entityId = entity?.typeId} catch {}
    try { entityName = entity?.name || entity?.typeId} catch {}
    try { projectileName = projectile?.typeId} catch {}
    console.warn(cause, entityId, projectileName);
    
    if (entityId && entityId.includes("minecraft:")) {
        if (entityId === "minecraft:player") entityType = "player";
            else entityType = "entity";
    }
    with_.push(player.nameTag);
    if (entityName) with_.push(entityName.replace("minecraft:", ""));
    if (entity instanceof Minecraft.Player) {
        /** @type {Minecraft.Container} */
        const container = entity.getComponent("minecraft:inventory").container;
        const item = container.getItem(entity.selectedSlot);
        if (item.nameTag) {
            projectileName = "item";
            with_.push(item.nameTag)
        };
    }
    try { trans = death[cause][entityType][projectileName] } catch { with_ = [player.nameTag] }
    console.warn(cause, entityType, projectileName);
    player.runCommandAsync(`tellraw @a ${JSON.stringify({rawtext: [{translate: trans, with: with_}]})}`)
});

system.events.scriptEventReceive.subscribe(
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
    },
    { namespaces: ["uwse"] }
);

function sendMsg(msg, player = null) {
    if (player) player.sendMessage(`§7[UWSE]§r ${msg}`);
        else world.sendMessage(`§7[UWSE]§r ${msg}`);
}