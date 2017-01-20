'use strict';

var logger = require('winston');
logger.level = 'debug';
// fudge - by default winston disables timestamps on the console
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, { prettyPrint: true, 'timestamp':true });

var co = require('co');
var Discord = require('discord.js');

var app = {};
var config = app.config = require('./config');
config.pkg = require("./package.json");

logger.info("bot started, v"+config.pkg.version);
logger.info("discord.js v"+Discord.version);

var client = config.client = new Discord.Client();

// event listeners
client.on("error", function (msg) {
    logger.error(msg);
    // should we throw here and crash?
});

client.on("warn", function (msg) {
    logger.warn(msg);
});

client.on("debug", function (msg) {
    logger.debug(msg);
});

client.on("disconnected", function () {
    logger.info("Disconnected from discord");
});

client.once("ready", function () {
    if(config.discord.playing) {
        client.user.setGame(config.discord.playing);
    }
    logger.info("%s is ready!", client.user.username);
    logger.verbose("Listening to %s channels on %s servers", 
        client.channels.array().length, client.guilds.array().length);

    if(config.discord.defaultGuild) {
        // configure the default servers
        if (app.defaultGuild = client.guilds.find("name", config.discord.defaultGuild)) {
            logger.info("setting default guild to: %s [%s]", 
                    app.defaultGuild.name, app.defaultGuild.id);
        } else {
            logger.warn("unable to find default server: %s", config.discord.defaultGuild);
        }
    }

});

// start the bot
co(function *init() {

    // init all the commands

    var token = yield client.login(config.discord.token);
    if (!token) {
        throw new Error("Failed to acquire token");
    }
    logger.info("Logged into discord with token: ", token);

});  // don't catch - let it crash
