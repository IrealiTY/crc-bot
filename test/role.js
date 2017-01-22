/* global describe, before, it */
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
        requestMsg = { delete: sandbox.stub().returns(Promise.resolve()) };
        member = { 
            get roles() { return memberRoles; },
            addRole: sandbox.stub().returns(Promise.resolve())
        };
        channel = { send: sandbox.stub().returns(Promise.resolve(responseMsg)) };
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
        it('should return an error if the role does not exist', function () {
            guildRoles.find = sandbox.stub().returns(null);
            cmd.args = ["norole"];
            return expect(app.commands.iam.exec(cmd)).to.be.rejected;
        });

        it('should add a person to a role and delete the original message', function () {
            cmd.args = ['casters'];
            memberRoles.has = sandbox.stub().returns(false);
            return expect(app.commands.iam.exec(cmd)).to.be.fulfilled.
                then(function () {
                    //expect(guild.fetchMember.calledOnce).is.true;
                    //expect(memberRoles.has.calledOnce).is.true;
                    //expect(channel.send.calledOnce).is.true;
                    expect(member.addRole.calledOnce).is.true;
                    expect(requestMsg.delete.calledOnce).is.true;
                    expect(responseMsg.delete.calledOnce).is.true;
                });
        });
    });

});