/* global describe, before, it */
'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var sinon = require('sinon');

var TokenBucket = require('../lib/token-bucket');

describe('TokenBucket', function () {

    var sandbox;

    beforeEach('reset', function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('#drain()', function () {

        it('should drain 1 token', function () {
            var bucket = new TokenBucket(5, 3600);

            var drained = bucket.drain();
            expect(drained).to.equal(1);

        });

        it('should drain 5 tokens', function () {
            var bucket = new TokenBucket(5, 3600);
            var drained = bucket.drain(5);
            expect(drained).to.equal(5);
        });

        it('should attempt to drain 6, but only drain 5 tokens', function () {
            var bucket = new TokenBucket(5, 3600);
            var drained = bucket.drain(6);
            expect(drained).to.equal(5);
        });

        it('should attempt to drain 3, but only drain 2 tokens', function () {
            sandbox.useFakeTimers();
            var bucket = new TokenBucket(5, 3600);
            var drained = bucket.drain(5); // empty the bucket
            sandbox.clock.tick(3600 * 1000 * 2); // should fill 2 more tokens
            drained = bucket.drain(3);
            expect(drained).to.equal(2);
        });

        it('should attempt to drain 5, but only drain 4 tokens', function () {
            sandbox.useFakeTimers();
            var bucket = new TokenBucket(5, 3600);
            var drained = bucket.drain(5); // empty the bucket
            sandbox.clock.tick(3600 * 1000 * 6.5); // should fill only 5 more tokens
            drained = bucket.drain(2); // 
            expect(drained).to.equal(2); //
            // now we wait half a fill interval - the purpose of this
            // is to check that a token is re-filled based on the 
            // last fill and not the last drain
            sandbox.clock.tick(3600 * 1000 / 2); 
            drained = bucket.drain(5); // empty the bucket
            expect(drained).to.equal(4);
        });

        it('should be able to repeatably drain a token', function () {
            sandbox.useFakeTimers();
            var bucket = new TokenBucket(5, 3600);
            for(var i=0; i < 1000; i++) {
                expect(bucket.drain()).to.equal(1);
                sandbox.clock.tick(3600 * 1000);
            }
        });



    });

});