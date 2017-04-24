/* global describe, before, it */
'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var sinon = require('sinon');

describe('purge', function () {


    var purge = require('../plugins/purge');
    var nextPurge = purge.Purge.prototype.nextPurge;

    var sandbox;
    var ch1;
    var ch2;

    var app = {
        config: {
            purge: {
                "test1": "0 0 3 * * *",
                "test2": "0 0 4 * * *"
            }
        },
        defaultGuild: { channels : { } }
    };

    var purgePromise;

    function createMessages(size, deleteStub) {
        var msgArray = [];
        // create a Map of messages
        for(var i = 0; i < size; i++) {
            msgArray.push([i, { delete: deleteStub }]);
        }
        return new Map(msgArray);
    }

    function hookPurge() {
        // create a promise expecting the nextPurge to
        // be fullfilled
        return new Promise(function (resolve, reject) {
            // unfortunately the purge is wrapped in co and 
            // does not synchronously execute when we advance
            // the clock, so we have to have it resolve the 
            // Promise within it
            purge.Purge.prototype.nextPurge = function() {
                nextPurge.apply(this, arguments);
                //
                resolve(true);
            };
        });
    }

    //this.fetchMessages({ limit: messages }).then(msgs => this.bulkDelete(msgs, filterOld));

    // myMap.size

    // output = app.defaultGuild.channels.find('name', app.config.monitor.output);

    // var orig = MyClass1.prototype.myMethod;
    // MyClass1.prototype.myMethod = function() {
    //    alert('Injected');
    //    return orig.apply(this, arguments);
    //}


    beforeEach('reset', function () {

        sandbox = sinon.sandbox.create();
        sandbox.useFakeTimers();

        // reset the channels
        ch1 = {
            fetchMessages: sandbox.stub(),
            bulkDelete: sandbox.stub()
        };
        ch2 = {
            fetchMessages: sandbox.stub(),
            bulkDelete: sandbox.stub()
        };

        // allow the tests to find the channels
        var cf = sandbox.stub();
        cf.withArgs('name', 'test1').returns(ch1);
        cf.withArgs('name', 'test2').returns(ch2);
        app.defaultGuild.channels.find = cf;

    });

    afterEach(function () {
        sandbox.restore();
        // restore any possible override of nextPurge
        purge.Purge.prototype.nextPurge = nextPurge;
    });

    describe('#purge()', function () {

        it('should bulk remove 20 messages', function () {

            var msg20 = createMessages(20);
            msg20.filter = sandbox.stub().returns(msg20);

            var msg0 = createMessages(0);
            msg0.filter = sandbox.stub().returns(msg0);

            ch1.fetchMessages.onCall(0).returns(Promise.resolve(msg20));
            ch1.fetchMessages.onCall(1).returns(Promise.resolve(msg0));

            ch1.bulkDelete.onCall(0).returns(Promise.resolve(msg20));

            app.config.purge = {
                "test1": "6 8 * * *"
            }

            expect(purge.init(app)).to.be.fulfilled;

            var purgePromise = hookPurge();

            // forward the time 24 hours
            sandbox.clock.tick(86400 * 1000); 

            return expect(purgePromise).to.be.fulfilled.then(function () {
                expect(ch1.fetchMessages.callCount).to.equal(3);
                expect(ch1.bulkDelete.callCount).to.equal(1);
            });

        });

        it('should individually remove 20 messages', function () {

            var msgDelete = sandbox.stub().returns(Promise.resolve());

            var msg0 = createMessages(0, msgDelete);
            msg0.filter = sandbox.stub().returns(msg0);

            var msg20 = createMessages(20, msgDelete);
            msg20.filter = sandbox.stub().returns(msg0);

            ch1.fetchMessages.onCall(0).returns(Promise.resolve(msg20));
            ch1.fetchMessages.onCall(1).returns(Promise.resolve(msg20));
            ch1.fetchMessages.onCall(2).returns(Promise.resolve(msg0));

            ch1.bulkDelete.onCall(0).returns(Promise.resolve(msg20));

            app.config.purge = {
                "test1": "6 8 * * *"
            }

            expect(purge.init(app)).to.be.fulfilled;

            var purgePromise = hookPurge();

            // forward the time 24 hours
            sandbox.clock.tick(86400 * 1000); 

            return expect(purgePromise).to.be.fulfilled.then(function () {
                expect(ch1.fetchMessages.callCount).to.equal(3);
                expect(ch1.bulkDelete.callCount).to.equal(0);
                expect(msgDelete.callCount).to.equal(20);
            });

        });

    });


});