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
        "ranged dps": "Ranged DPS",
        "ranged": "Ranged DPS",
        "melee dps": "Melee DPS",
        "melee": "Melee DPS",
        "healers": "Healers",
        "tanks": "Tanks"
    },
    throttle: {
        "player_lfg": {
            maxTokens: 5,
            tokenInterval: 3600
        } 
    },
    monitor: {
        channels: [ "blah" ],
        output: "monitor",
        events: [ "message", "messageDelete", "messageUpdate" ]
    },
    welcome: {
        message: "Hello :NAME:!"
    },
    commandPrefix: "."
};