'use strict';
var logger = require('winston');
var co = require('co');
var util = require('util');

var app;

function init(a) {
    app = a;

    // loop through the configured events
    app.config.monitor.events.forEach(function (event) {
        logger.info('setting up monitoring of event: %s', event);
        switch(event) {
            case "message":
                app.client.on("message", function(msg) { logEvent("New Message", msg) } );
                break;
            case "messageUpdate":
                app.client.on("messageUpdate", function(msg0, msg1) { logEvent("Message Update", msg1) });
                break;
            case "messageDelete":
                app.client.on("messageDelete", function(msg) { logEvent("Message Deleted", msg) });
                break;
            default:
                logger.warn("monitor: unknown event type: %s", event);
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

function logEvent(info, msg) {

    if(app.config.monitor.channels.indexOf(msg.channel.name) === -1) return;

    var text = replaceMentions(msg);
    logger.info("%s: %s", info, text);

    if(app.config.monitor.output && app.defaultGuild) {
        // try and get the output
        var output = app.defaultGuild.channels.find('name', app.config.monitor.output);
        if(!output) return;
        output.send(util.format("%s: ```%s```", info, text));
    }

}


module.exports.init = init;