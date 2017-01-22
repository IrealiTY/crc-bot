'use strict';

var util = require('util');

function Warning() {
    this.message = util.format.apply(this, arguments);
};

Warning.prototype.toString = function () {
    return this.message;
}

module.exports = Warning;