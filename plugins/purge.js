'use strict';
var logger = require('winston');
var co = require('co');
var cron = require('cron-parser');

var MAX_MESSAGES = 50;

function Purge(app, channel, config) {

    this.app = app;
    this.channel = channel;
    this.config = config;

    this.interval = cron.parseExpression(config);
    this.nextPurge();
}

Purge.prototype.nextPurge = function nextPurge() {
    // determine when the next interval is
    var next = this.interval.next();
    var delay = next.getTime() - new Date().getTime();
    logger.debug("scheduling next purge of [%s] in [%s] milliseconds", this.channel, delay);
    // http://stackoverflow.com/questions/2130241/pass-correct-this-context-to-settimeout-callback
    setTimeout(this.purgeMessages.bind(this), delay);
};

Purge.prototype.purgeMessages = co.wrap(function* purgeMessages() {

    try {
        var c = this.app.defaultGuild ? this.app.defaultGuild.channels.find('name', this.channel) : undefined;
        if(c) {
            var m;

            do {
                m = yield c.fetchMessages();
                if(m.size > 1) {
                    logger.debug("removing [%s] messages from [%s]", m.size, this.channel);
                    m = yield c.bulkDelete(m);
                }
                
            } while(m.size > 1)
        } else {
            logger.warn("unable to find channel [%s] for purge", this.channel);
        }
    } catch (e) {
        logger.error("failed to purge channel [%s]:", this.channel, e);
    }


    this.nextPurge();
});

function* init(app) {

    // find the channels we need to purge   
    //
    var config = app.config.purge;

    for (var channel in config) {
        if (config.hasOwnProperty(channel)) {
            new Purge(app, channel, config[channel]);
        }
    }

}

module.exports.init = co.wrap(init);
module.exports.Purge = Purge;
