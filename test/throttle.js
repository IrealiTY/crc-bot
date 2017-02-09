/* global describe, before, it */
'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var sinon = require('sinon');
var EventEmitter = require('events');

describe('throttle', function () {

    //
    var throttle = require('../plugins/throttle');
    var throttleConfig = {
        "test_channel": {
            maxTokens: 5,
            tokenInterval: 3600
        }
    };

    var app = { config: { throttle: throttleConfig } };
    app.client = new EventEmitter();

    var author;
    var channel;
    var sandbox;
    var response;

    beforeEach('reset', function () {

        sandbox = sinon.sandbox.create();
        sandbox.useFakeTimers();
        
        channel = { name: "test_channel" };
        author = { id: 666 };

    });

    afterEach(function () {
        sandbox.restore();
        throttle.reset(); // no...
    });

    describe('#init', function () {

        it('should add an event listener for "message"', function () {

            return expect(throttle.init(app)).to.be.fulfilled.
                then(function () {
                    expect(app.client.listenerCount("message")).to.equal(1);
                });

        });

    });

    describe('#onMessage', function () {

        it('should allow the first 5 messages', function () {
            var msg;

            for(var i = 0; i < 5; i++) {
                msg = { 
                    author: author, channel: channel, id: i,
                    delete: sandbox.stub().returns(Promise.resolve())
                };
                app.client.emit("message", msg);
                expect(msg.delete.called).is.false;
            }
        });

        it('should delete the 6-10 messages', function () {
            var msg;
            var response;

            for(var i = 0; i < 10; i++) {
                response = { delete: sandbox.stub() };
                channel.send = sandbox.stub().returns(Promise.resolve(response));
                msg = { 
                    author: author, channel: channel, id: i,
                    delete: sandbox.stub().returns(Promise.resolve())
                };
                app.client.emit("message", msg);
                expect(msg.delete.called).is.equal(i >= 5);
                expect(channel.send.called).is.equal(i >= 5);
            }

        });

    });

});