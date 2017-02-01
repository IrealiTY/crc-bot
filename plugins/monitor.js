'use strict';
var logger = require('winston');
var co = require('co');
var util = require('util');

var app;
var output;

function init(a) {
    app = a;

    // loop through the configured events
    app.config.monitor.events.forEach(function (event) {
        logger.info('setting up monitoring of event: %s', event);
        switch(event) {
            case "message":
                app.client.on("message", function(msg) { logMessageEvent("New Message", 0x3030A0, msg) } );
                break;
            case "messageUpdate":
                app.client.on("messageUpdate", function(msg0, msg1) { logMessageEvent("Message Updated", 0x30A030, msg1) });
                break;
            case "messageDelete":
                app.client.on("messageDelete", function(msg) { logMessageEvent("Message Deleted", 0xA03030, msg) });
                break;
            default:
                logger.warn("monitor: unknown event type: %s", event);
        }
    });
    app.client.once("ready", function() {
        if(app.config.monitor.output && app.defaultGuild) {
            output = app.defaultGuild.channels.find('name', app.config.monitor.output);
        }
    });
    return Promise.resolve();
}

function replaceMentions(msg) {
    var mentions = msg.mentions;
    return(msg.content.replace(/\<\@(\d+)\>/, function(match, mention) {
        // lookup the match in the mentions
        var user = mentions.users.get(mention);
        if(!user) return match;
        return "@" + user.username + "#" + user.discriminator;
    }));
}

function logMessageEvent(info, colour, msg) {

    if(!output || (output.id === msg.channel.id)) return; 

    var text = replaceMentions(msg);
    logger.info("%s: %s", info, text);

    if(app.config.monitor.output && app.defaultGuild) {

        output.sendMessage("**"+info + "** in **" + (msg.channel.name || "PM") + "** at (" + msg.createdAt.toISOString() + ")", { embed: {
            color: colour,
            author: {
                name: msg.author.username,
                icon_url: msg.author.avatarURL
            },
            description: msg.content
        }});
    }

}


module.exports.init = init;