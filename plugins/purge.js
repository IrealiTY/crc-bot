'use strict';
var logger = require('winston');
var co = require('co');
var cron = require('cron-parser');
var util = require('util');

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
            // first bulk delete
            do {
                m = yield c.fetchMessages();
                var after = Date.now() - (86400 * 1000 * 14); // two weeks prior
                m = m.filter(timestamp =>
                    timestamp > after
                );
                if(m.size > 1) {
                    logger.debug("removing [%s] messages from [%s]", m.size, this.channel);
                    m = yield c.bulkDelete(m);
                }
                
            } while(m.size > 1);
            // then individually delete
            do {
                m = yield c.fetchMessages();
                if(m.size > 0) {
                    logger.debug("removing [%s] messages from [%s]", m.size, this.channel);
                    for(var msg of m.values()) {
                        yield msg.delete();      
                    }
                }
            } while(m.size > 0);
        } else {
            logger.warn("unable to find channel [%s] for purge", this.channel);
        }
    } catch (e) {
        logger.error("failed to purge channel [%s]: %s", this.channel, util.inspect(e));
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
