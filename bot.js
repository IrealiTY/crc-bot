'use strict';

var logger = require('winston');
logger.level = 'debug';
// fudge - by default winston disables timestamps on the console
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, { prettyPrint: true, 'timestamp':true });

var co = require('co');
var app = {};

var Discord = app.discordjs = require('discord.js');
var config = app.config = require('./config');
config.pkg = require("./package.json");

logger.info("bot started, v"+config.pkg.version);
logger.info("discord.js v"+Discord.version);

var client = app.client = new Discord.Client();

var commands = {};

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

    client.on("messageUpdate", function (msg0, msg1) {
        parseCommand(msg1);
    });

    client.on("message", parseCommand);

});

function addCommand(cmd) {
    logger.info("adding command %s", cmd.name);
    commands[cmd.name] = cmd;
}

app.addCommand = addCommand;

function parseCommand(msg) {
    
    return co(function* () {

        // ignore commands from bots and self
        if (msg.author.id === client.user.id) return;
        if (msg.author.bot) return;

        // look for the command prefix
        if(!msg.content.toLowerCase().startsWith(config.commandPrefix)) return;

        var cmd = {
            msg: msg,
            dest: msg.channel
        };

        logger.debug("got message from [%s] in channel [%s]: ", 
            msg.author.username, (msg.channel.name || "PM"), msg.content);

        //strip off the prefix and split into args
        var args = msg.content.substring(config.commandPrefix.length).trim().match(/[^"\s]+|"(?:\\"|[^"])+"/g);
        var cmdName = cmd.cmdName = args.shift().toLowerCase();

        // yep, ok then see if we have that command loaded
        if(commands[cmdName] && commands[cmdName].exec) {
            return commands[cmdName].exec(cmd);
        }

        // silently ignore any other commands

    });
}

// start the bot
co(function *init() {

    // init all the commands
    var plugins = require('./plugins');
    yield plugins.init(app);

    var token = yield client.login(config.discord.token);
    if (!token) {
        throw new Error("Failed to acquire token");
    }
    logger.info("Logged into discord with token: ", token);

});  // don't catch - let it crash
