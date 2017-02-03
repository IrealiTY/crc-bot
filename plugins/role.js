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
        alias: ["im", "am"],
        exec: iam
    });
    app.addCommand({
        name: "iamnot",
        desc: "Reset role",
        alias: ["iamn", "imnot", "imn", "amnot"],
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
        var author = cmd.msg.author;
        if(!config.role[roleName.toLowerCase()]) {
            logger.warn("Unable to set role for %s [%s], role [%s] is not configured", author.username, author, roleName);
            response = yield cmd.dest.send("Sorry, the role "+roleName+" does not exist");

        } else if(!app.defaultGuild) {
            logger.warn("Unable to set role for %s [%s], no defaultGuild", author.username, author);
            response = yield cmd.dest.send("Sorry, I am not able to determine the guild");
        } else {
            var role = app.defaultGuild.roles.find('name', config.role[roleName.toLowerCase()]);
            if (!role) {
                logger.warn("Unable to set role for %s [%s], role [%s] is does not exist", author.username, author, roleName);
                response = yield cmd.dest.send("Sorry, the role " + roleName + " does not exist");
            } else {

                var member = yield app.defaultGuild.fetchMember(cmd.msg.author);

                // check if the member is already in the role
                if (member.roles.has(role.id)) {
                    // already in the role
                    response = yield cmd.dest.send("You are already in " + roleName);
                } else {
                    // add the role
                    logger.info('Adding %s [%s] to role %s', author.username, author, roleName);
                    yield member.addRole(role);
                    response = yield cmd.dest.send(":ok: You now have " + roleName + " role");
                }
            }
        }

        // only try and clean up if it's a guild channel
        if(cmd.dest.type === 'text') {
            yield Promise.all([cmd.msg.delete(expire), response.delete(expire)]);
        }

    });
}

function iamnot(cmd) {
    return co(function *iamnot() {
        var expire = 2000;
        var roleName = cmd.args.join(" ").trim();
        var response;
        var author = cmd.msg.author;
        if(!config.role[roleName.toLowerCase()]) {
            logger.warn("Unable to unset role for %s [%s], role [%s] is not configured", author.username, author, roleName)
            response = yield cmd.dest.send("Sorry, the role "+roleName+" does not exist");

        } else if(!app.defaultGuild) {
            logger.warn("Unable to unset role for %s [%s], no defaultGuild", author.username, author);
            response = yield cmd.dest.send("Sorry, I am not able to determine the guild");
        } else {
            var role = app.defaultGuild.roles.find('name', config.role[roleName.toLowerCase()]);
            if (!role) {
                logger.warn("Unable to unset role for %s [%s], role [%s] is does not exist", author.username, author, roleName)
                response = yield cmd.dest.send("Sorry, the role " + roleName + " does not exist");
            } else {

                var member = yield app.defaultGuild.fetchMember(cmd.msg.author);

                // check if the member is already in the role
                if (member.roles.has(role.id)) {
                    // remove the role
                    logger.info('removing %s [%s] from role %s', author.username, author, roleName);
                    yield member.removeRole(role);
                    response = yield cmd.dest.send("You have been removed from " + roleName);
                } else {
                    response = yield cmd.dest.send("You are not in " + roleName );
                }
            }
        }

        // only try and clean up if it's a guild channel
        if(cmd.dest.type === 'text') {
            yield Promise.all([cmd.msg.delete(expire), response.delete(expire)]);
        }
    });
}

module.exports.init = init;