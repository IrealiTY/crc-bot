'use strict';
var logger = require('winston');
var co = require('co');
var util = require('util');
var Warning = require('../lib/warning');

var config;
var app;

function init(a) {
    app = a;
    app.addCommand({
        name: "iam",
        desc: "Set role",
        exec: iam
    });
    app.addCommand({
        name: "iamnot",
        desc: "Reset role",
        exec: iamnot
    });
    config = app.config;
    return Promise.resolve();
}

function iam(cmd) {
    return co(function *iam() {
        //
        var expire = 2000;
        var roleName = cmd.args.join(" ").trim();
        var response;
        if(!config.role[roleName.toLowerCase()]) {
            response = yield cmd.dest.send("Sorry, the role "+roleName+" does not exist");
            yield cmd.msg.delete(expire);
            yield response.delete(expire);
            return Promise.reject(new Warning("Role [%s] is not configured", roleName));
        }

        var role = app.defaultGuild.roles.find('name', config.role[roleName.toLowerCase()]);
        if(!role) {
            response = yield cmd.dest.send("Sorry, the role "+roleName+" does not exist");
            yield cmd.msg.delete(expire);
            yield response.delete(expire);
            return Promise.reject(new Warning("Failed to find guild role [%s]", roleName));
        }

        var member = yield app.defaultGuild.fetchMember(cmd.msg.author);
        var response;

        // check if the member is already in the role
        if(member.roles.has(role.id)) {
            // already in the role
            response = yield cmd.dest.send("you are already in "+roleName);
        } else {
            // add the role
            yield member.addRole(role);
            response = yield cmd.dest.send(":ok: You now have "+roleName+" role");    
        }

        yield cmd.msg.delete(expire);
        yield response.delete(expire);
    });
}

function iamnot(cmd) {
    return co(function *iamnot() {

    });
}

module.exports.init = init;