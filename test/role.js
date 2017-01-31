/* global describe, before, it */
'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var sinon = require('sinon');

describe('role', function () {

    var role = require('../plugins/role');
    var commands = {}

    var app = {
        commands: commands,
        addCommand: function (cmd) {
            commands[cmd.name] = cmd;
        },
        config: {
            role: {
                "tanks": "Tanks",
                "casters": "Casters"
            }
        }
    };

    var author;
    var guildRole;
    var guildRoles;
    var memberRoles;
    var responseMsg;
    var requestMsg;
    var member;
    var channel;
    var guild;
    var cmd;
    var sandbox;

    beforeEach('reset', function() {
        sandbox = sinon.sandbox.create();
        // there are a lot of API calls to stub - there must be a better way...
        author = {};
        guildRole = { id: 1 };
        guildRoles = { find: sandbox.stub().returns(guildRole) };
        memberRoles = { };
        responseMsg = { delete: sandbox.stub().returns(Promise.resolve()) };
        requestMsg = { 
            delete: sandbox.stub().returns(Promise.resolve()),
            author: author
        };
        member = { 
            get roles() { return memberRoles; },
            addRole: sandbox.stub().returns(Promise.resolve()),
            removeRole: sandbox.stub().returns(Promise.resolve())
        };
        channel = { 
            send: sandbox.stub().returns(Promise.resolve(responseMsg)),
            type: 'text'
        };
        guild = app.defaultGuild = { 
            get roles() { return guildRoles; },
            fetchMember: sandbox.stub().returns(Promise.resolve(member))
        };
        cmd = { dest: channel, msg: requestMsg };
        return Promise.resolve();
    });

    afterEach(function () {
        sandbox.restore();  
    })
    
    describe('#init()', function () {

        it('should be added to the commands', function () {
            var spy = sandbox.spy(app, "addCommand");

            return expect(role.init(app)).to.be.fulfilled.
                then(function () {
                    // we have 2 commands
                    expect(spy.callCount).to.equal(2);
                    expect(app.commands).to.have.property("iam");
                    expect(app.commands).to.have.property("iamnot");
                    app.addCommand.restore();
                });
            

        });
    });

    describe('#iam', function () {
        // guild channel
        it('should fail if the role is not configured', function () {
            guildRoles.find = sandbox.stub().returns(null);
            cmd.args = ["norole"];
            return expect(app.commands.iam.exec(cmd)).to.be.fulfilled.
                then(function () {
                    expect(guildRoles.find.called).is.false;
                });
        });

        it('should fail if the role does not exist', function () {
            guildRoles.find = sandbox.stub().returns(null);
            cmd.args = ["casters"];
            return expect(app.commands.iam.exec(cmd)).to.be.fulfilled.
                then(function () {
                    expect(guildRoles.find.called).is.true;
                    expect(guild.fetchMember.called).is.false;
                });
        });

        it('should add a person to a role and delete all message', function () {
            cmd.args = ['casters'];
            memberRoles.has = sandbox.stub().returns(false);
            return expect(app.commands.iam.exec(cmd)).to.be.fulfilled.
                then(function () {
                    expect(member.addRole.calledOnce).is.true;
                    expect(requestMsg.delete.calledOnce).is.true;
                    expect(responseMsg.delete.calledOnce).is.true;
                });
        });

        it('should add a person to a role and not delete any messages', function () {
            cmd.args = ['casters'];
            memberRoles.has = sandbox.stub().returns(false);
            channel.type = 'pm';
            return expect(app.commands.iam.exec(cmd)).to.be.fulfilled.
                then(function () {
                    expect(member.addRole.calledOnce).is.true;
                    expect(requestMsg.delete.called).is.false;
                    expect(responseMsg.delete.called).is.false;
                });
        });

        it('should fail if no defaultGuild', function () {
            cmd.args = ['casters'];
            memberRoles.has = sandbox.stub().returns(false);
            app.defaultGuild = undefined;
            return expect(app.commands.iam.exec(cmd)).to.be.fulfilled.
                then(function () {
                    expect(guildRoles.find.called).is.false;
                    expect(requestMsg.delete.calledOnce).is.true;
                    expect(responseMsg.delete.calledOnce).is.true;
                });
        });

    });

    describe('#iamnot', function () {
        // guild channel
        it('should fail if the role is not configured', function () {
            guildRoles.find = sandbox.stub().returns(null);
            cmd.args = ["norole"];
            return expect(app.commands.iamnot.exec(cmd)).to.be.fulfilled.
                then(function () {
                    expect(guildRoles.find.called).is.false;
                });
        });

        it('should fail if the role does not exist', function () {
            guildRoles.find = sandbox.stub().returns(null);
            cmd.args = ["casters"];
            return expect(app.commands.iamnot.exec(cmd)).to.be.fulfilled.
                then(function () {
                    expect(guildRoles.find.called).is.true;
                    expect(guild.fetchMember.called).is.false;
                });
        });

        it('should remove a person from a role and delete all message', function () {
            cmd.args = ['casters'];
            memberRoles.has = sandbox.stub().returns(true);
            return expect(app.commands.iamnot.exec(cmd)).to.be.fulfilled.
                then(function () {
                    expect(member.removeRole.calledOnce).is.true;
                    expect(requestMsg.delete.calledOnce).is.true;
                    expect(responseMsg.delete.calledOnce).is.true;
                });
        });

        it('should remove a person from a role and not delete any messages', function () {
            cmd.args = ['casters'];
            memberRoles.has = sandbox.stub().returns(true);
            channel.type = 'pm';
            return expect(app.commands.iamnot.exec(cmd)).to.be.fulfilled.
                then(function () {
                    expect(member.removeRole.calledOnce).is.true;
                    expect(requestMsg.delete.called).is.false;
                    expect(responseMsg.delete.called).is.false;
                });
        });

        it('should fail if no defaultGuild', function () {
            cmd.args = ['casters'];
            memberRoles.has = sandbox.stub().returns(false);
            app.defaultGuild = undefined;
            return expect(app.commands.iamnot.exec(cmd)).to.be.fulfilled.
                then(function () {
                    expect(guildRoles.find.called).is.false;
                    expect(requestMsg.delete.calledOnce).is.true;
                    expect(responseMsg.delete.calledOnce).is.true;
                });
        });        


    });

});