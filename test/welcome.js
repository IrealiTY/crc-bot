/* global describe, before, it */
var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var sinon = require('sinon');
var EventEmitter = require('events');


var welcome = require('../plugins/welcome');

describe('welcome', function () {
    describe('#init()', function () {
        it('should return a fulfilled promise', function () {
            var app = {}
            app.client = new EventEmitter();
            expect(welcome.init(app)).to.be.fulilled;
        });
    });

    describe('#onGuildMemberAdd', function () {

        it('should send a PM to a new member', function () {
            var app = {}
            app.client = new EventEmitter();
            var config = {
                welcome: {
                    message: "welcome message"
                }
            };
            app.config = config;
            var username = "Test User";
            var send = sinon.stub().returns(Promise.resolve());
            var displayName = sinon.stub().returns(username);
            var member = {
                send: send,
                get displayName() { return displayName() }
            };
            expect(welcome.init(app)).to.be.fulilled;
            app.client.emit("guildMemberAdd", member);
            expect(displayName.callCount).to.equal(1);
            expect(send.callCount).to.equal(1);
        });


    });

    describe.skip('#onGuildMemberRemove', function () {

    });

});