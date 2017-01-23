/* global describe, before, it */
'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var sinon = require('sinon');
var EventEmitter = require('events');

describe('welcome', function () {

    var welcome = require('../plugins/welcome');
    var app = {
        client: new EventEmitter(),
        config: {
            welcome: { message: "welcome message" }
        }
    };

    describe('#init()', function () {
        it('should return a fulfilled promise', function () {
            return expect(welcome.init(app)).to.be.fulilled;
        });
    });

    describe('#onGuildMemberAdd', function () {

        it('should send a PM to a new member', function () {
            var send = sinon.stub().returns(Promise.resolve());
            var member = { send: send };

            app.client.emit("guildMemberAdd", member);
            expect(send.callCount).to.equal(1);
        });

        it('should get the display name', function () {

            app.config.welcome.message = "welcome :NAME:";
            var username = "Test User";
            var send = sinon.stub().returns(Promise.resolve());
            var displayName = sinon.stub().returns(username);
            var member = {
                send: send,
                get displayName() { return displayName() }
            };

            app.client.emit("guildMemberAdd", member);
            expect(displayName.called).is.true;
            expect(send.callCount).to.equal(1);
        });

        it('should get the user ID', function () {

            app.config.welcome.message = "welcome :MENTION:";
            var userid = "666";
            var send = sinon.stub().returns(Promise.resolve());
            var user = sinon.stub().returns(userid);
            var member = {
                send: send,
                get user() { return user() }
            };

            app.client.emit("guildMemberAdd", member);
            expect(user.called).is.true;
            expect(send.callCount).to.equal(1);
        });



    });

    describe('#onGuildMemberRemove', function () {

        // not sure how to check this...
        it('should log the member leaving', function () {

            var username = 'Test user';
            var displayName = sinon.stub().returns(username);
            var member = {
                get displayName() { return displayName() }
            };
            app.client.emit("guildMemberRemove", member);
            expect(displayName.called).is.true;
        });

    });

});