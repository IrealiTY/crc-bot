'use strict';
var logger = require('winston');
var co = require('co');

var app;

function init(a) {
    app = a;
    app.addCommand({
        name: "acc",
        desc: "Display current Accuracy Caps for Raids in FF14",
        exec: acc
    });
    return Promise.resolve();
}

function acc(cmd) {
    return co(function *init() {

        return cmd.dest.send("```" + [
            "                Front   Flank   Caster",
            "Alex Savage	 699     646     592",
            "Zurvan  	    699     646     582",
            "Stormblood     NONE LOL"
        ].join("\n") + "```");

    });
}

module.exports.init = init;
