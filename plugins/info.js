'use strict';
var logger = require('winston');
var co = require('co');

var app;

function init(a) {
    app = a;
    app.addCommand({
        name: "info",
        desc: "Display information about the bot",
        exec: info
    });
    return Promise.resolve();
}

function info(cmd) {
    return co(function *init() {
        var config = app.config;

        return cmd.dest.send("```" + [
            "  Bot Name: "+config.pkg.name,
            "   Version: "+config.pkg.version,
            "discord.js: "+app.discordjs.version,
            "      Node: "+process.version,
            "     Guild: "+ (app.defaultGuild ? app.defaultGuild.name : "N/A"),
            "     Owner: "+ (app.defaultGuild ? app.defaultGuild.owner.displayName : "N/A"),
            "  Channels: "+ (app.defaultGuild ? app.defaultGuild.channels.array().length : "N/A")
        ].join("\n") + "```");

    });
}

module.exports.init = init;