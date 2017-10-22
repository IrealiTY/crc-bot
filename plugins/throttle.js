'use strict';
var logger = require('winston');
var co = require('co');

var TokenBucket = require('../lib/token-bucket');

var buckets = {};
var app;

function init(a) {
    app = a;
    app.client.on("message", checkMessage);
    return Promise.resolve();
}

function checkMessage(msg) {

    var config = app.config.throttle;

    // first check if we have the channel configured
    if(!config[msg.channel.name]) return;
    config = config[msg.channel.name];

    var expire = config.expire || 0;

    // do we need to initialise the channel buckets?
    var channelBuckets = buckets[msg.channel.name] ? buckets[msg.channel.name]
        : buckets[msg.channel.name] = {};

    // do we need to initialise the user bucket?
    var bucket = channelBuckets[msg.author.id] ? channelBuckets[msg.author.id] 
        : channelBuckets[msg.author.id] = new TokenBucket(config.maxTokens, config.tokenInterval);

    // drain the bucket
    if (msg.author.bot) return;
    if(!bucket.drain()) {
        // failed to drain the bucket - user has exceeded message limit
        msg.delete(expire) // dump the response
        .then(msg => console.log(`Deleted message from ${msg.author}`));
        //  Send message to user to notify him
         msg.author.send("Hello " + msg.author + ", this is an automated message. Your latest message on CRC has been deleted due to our 24-hour repost rule. You will be able to post again in the LFG/LFM channel in " + 
                Math.ceil( ((bucket.nextFill - Date.now()) / 1000) / 60 ) + " minutes. Please check the rules in #announcements for more information.");
    } 

}

function reset() {
    buckets = {};
}

module.exports.init = init;
module.exports.reset = reset; // fudge for testing...