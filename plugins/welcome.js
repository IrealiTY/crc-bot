'use strict';
var logger = require('winston');
var co = require('co');

var config;

function init(app) {
    config = app.config.welcome;
    app.client.on('guildMemberAdd', guildMemberAdd);
    app.client.on('guildMemberRemove', guildMemberRemove);
    return Promise.resolve();
}

function guildMemberAdd(member) {
    return co(function *guildMemberAdd() {

        logger.verbose("%s (%s) joined the CRC", member.displayName, member.user);
        var msg = config.message.
            replace(/:NAME:/g, member.displayName).
            replace(/:MENTION:/g, member.user);
        return member.send(msg);

    });
}

function guildMemberRemove(member) {
    logger.info("%s (%s) left the CRC", member.displayName, member.user);
}

module.exports.init = init;