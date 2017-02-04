'use strict';

module.exports = {

    discord: {
        token: "DISCORD_TOKEN",
        adminRole: "admin",
        defaultGuild: "",
        playing: "hide and seek"
    },
    role: {
        "casters": "Casters",
        "caster": "Casters",
        "mage": "Casters",
        "smn": "Casters",
        "blm": "Casters",
        "ranged dps": "Ranged DPS",
        "ranged": "Ranged DPS",
        "rangeds": "Ranged DPS",
        "mch": "Ranged DPS",
        "brd": "Ranged DPS",
        "melee dps": "Melee DPS",
        "melee": "Melee DPS",
        "melees": "Melee DPS",
        "mnk": "Melee DPS",
        "nin": "Melee DPS",
        "drg": "Melee DPS",
        "healers": "Healers",
        "healer": "Healers",
        "whm": "Healers",
        "sch": "Healers",
        "ast": "Healers",
        "tanks": "Tanks",
        "pld": "Tanks",
        "drk": "Tanks",
        "war": "Tanks",
        "tank": "Tanks"
    },
    throttle: {
        "player_lfg": {
            maxTokens: 5,
            tokenInterval: 3600
        } 
    },
    monitor: {
        output: "monitor",
        events: [ 
            "message", "messageDelete", "messageUpdate",
            "guildMemberAdd", "guildMemberRemove"
        ]
    },
    welcome: {
        message: "Hello :NAME:!"
    },
    commandPrefix: "."
};
