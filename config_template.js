'use strict';

var fs = require('fs');

module.exports = {

    discord: {
        token: "DISCORD_TOKEN",
        adminRole: "admin",
        defaultGuild: "",
        playing: "hide and seek",
        // set 'raw' to 'true' to log all events from discord
        raw: false
    },
    role: {
        "casters": "Casters",
        "caster": "Casters",
        "mage": "Casters",
        "smn": "Casters",
        "blm": "Casters",
        "rdm": "Casters",
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
        "sam": "Melee DPS",
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
        message: fs.readFileSync("welcome.sample.txt", "utf8")
    },

    purge: {
        /* cron syntax
         *    *    *    *    *
         ┬    ┬    ┬    ┬    ┬
         │    │    │    │    |
         │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
         │    │    │    └───── month (1 - 12)
         │    │    └────────── day of month (1 - 31)
         │    └─────────────── hour (0 - 23)
         └──────────────────── minute (0 - 59)
        */
        "casual_content": "0 4 * * *"
    },

    accuracy: {

    },

    commandPrefix: "."
};
