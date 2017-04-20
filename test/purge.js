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
        it('should search for the channels', function () {
            app.config.purge = {
                "test1": "6 8 * * *"
            }
            return expect(purge.init(app)).to.be.fulfilled;
            //expect(app.defaultGuild.channels.find.calledOnce).to.be.true;    
        });

        it('should remove 20 messages', function () {

            ch1.fetchMessages.onCall(0).returns(Promise.resolve({ size: 20}));
            ch1.fetchMessages.onCall(1).returns(Promise.resolve({ size: 0}));

            ch1.bulkDelete.onCall(0).returns(Promise.resolve({ size: 20}));

            app.config.purge = {
                "test1": "6 8 * * *"
            }

            expect(purge.init(app)).to.be.fulfilled;
            // create a promise expecting the nextPurge to
            // be fullfilled
            var npp = new Promise(function (resolve, reject) {
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

            // forward the time 24 hours
            sandbox.clock.tick(86400 * 1000); 

            return expect(npp).to.be.fulfilled.then(function () {
                expect(ch1.fetchMessages.callCount).to.equal(2);
            });

        });

    });


});