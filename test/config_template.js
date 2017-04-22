/* global describe, before, it */
'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

describe('config_template', function () {


    describe('#parse()', function () {

        it('should be required without error', function () {

            var config;
            var error;
            try {
                config = require('../config_template');
            } catch (e) {
                error = e;
            }
            expect(error).to.not.exist;
        });

    });

});