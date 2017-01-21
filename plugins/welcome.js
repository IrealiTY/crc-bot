'use strict';
var logger = require('winston');
var co = require('co');

var app;

function init(a) {
    app = a;
    app.client.on('guildMemberAdd', guildMemberAdd);
    return Promise.resolve();
}

function guildMemberAdd(member) {
    return co(function *guildMemberAdd() {
        // get the member name
        var name = member.displayName;
        
        // replace :NAME: with member display name
        var msg = app.config.welcome.message.replace(/:USER:/g, name);
        return member.send(msg);

    });
}

module.exports.init = init;