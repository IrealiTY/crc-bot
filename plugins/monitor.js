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
                app.client.on("message", logMessageEvent);
                break;
            case "messageUpdate":
                app.client.on("messageUpdate", logMessageUpdatedEvent);
                break;
            case "messageDelete":
                app.client.on("messageDelete", logMessageDeleteEvent);
                break;
            case "guildMemberAdd":
                app.client.on("guildMemberAdd", logGuildMemberAdd);
                break;
            case "guildMemberRemove":
                app.client.on("guildMemberRemove", logGuildMemberRemove);
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

function logGuildMemberAdd(member) {
    if(!output) return; 

    logger.info("User Joined: %s (%s)", member.displayName, member.user.id);

    if(app.config.monitor.output && app.defaultGuild) {

        output.sendMessage("[" + new Date().toLocaleTimeString() + "] **User Joined**", { embed: {
            color: 0x30A030,
            author: {
                name: member.displayName + " ("+member.user.id+")",
                icon_url: member.user.avatarURL
            }
        }});
    }   
}

function logGuildMemberRemove(member) {
    if(!output) return; 

    logger.info("User Left: %s (%s)", member.displayName, member.user.id);

    if(app.config.monitor.output && app.defaultGuild) {

        output.sendMessage("[" + new Date().toLocaleTimeString() + "] **User Left**", { embed: {
            color: 0xA03030,
            author: {
                name: member.displayName + " ("+member.user.id+")",
                icon_url: member.user.avatarURL
            }
        }});
    }   
}

function logMessageEvent(msg) {
    if(!output || (output.id === msg.channel.id)) return; 

    var text = replaceMentions(msg);
    logger.info("New Message from %s in %s: %s", msg.author.username, msg.channel.name, text);

    if(app.config.monitor.output && app.defaultGuild) {

        output.sendMessage("[" + msg.createdAt.toLocaleTimeString() + "] **New Message** " + msg.channel , { embed: {
            color: 0x3030A0,
            author: {
                name: msg.author.username,
                icon_url: msg.author.avatarURL
            },
            description: msg.content
        }});
    }    
}

function logMessageDeleteEvent(msg) {
    if(!output || (output.id === msg.channel.id)) return; 

    var text = replaceMentions(msg);
    logger.info("Message Deleted in %s: %s", msg.channel.name, text);

    if(app.config.monitor.output && app.defaultGuild) {

        output.sendMessage("[" + msg.createdAt.toLocaleTimeString() + "] **Message Deleted** " + msg.channel , { embed: {
            color: 0xA03030,
            author: {
                name: msg.author.username,
                icon_url: msg.author.avatarURL
            },
            description: msg.content
        }});
    }    
}

function logMessageUpdatedEvent(msg0, msg1) {

    if(!output || (output.id === msg0.channel.id)) return; 

    var text0 = replaceMentions(msg0);
    var text1 = replaceMentions(msg1);
    logger.info("Message Updated by %s in %s\n-- Original --------------\n%s\n-- Updated --------------\n%s", 
        msg1.author.username, msg1.channel.name, text0, text1);

    if(!app.config.monitor.output || !app.defaultGuild)  return;

    co(function *() {

        yield output.sendMessage("[" + msg0.createdAt.toLocaleTimeString() + "] **Message Updated** " + msg0.channel + " From:", {
            split: true,
            embed: {
                color: 0x30A030,
                author: {
                    name: msg0.author.username,
                    icon_url: msg0.author.avatarURL
                },
                description: msg0.content

            }
        });

        yield output.sendMessage("[" + msg1.createdAt.toLocaleTimeString() + "] **Message Updated** " + msg1.channel + " To:", {
            split: true,
            embed: {
                color: 0x30A030,
                author: {
                    name: msg1.author.username,
                    icon_url: msg1.author.avatarURL
                },
                description: msg1.content

            }
        });

    });


}

module.exports.init = init;