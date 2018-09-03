'use strict';
var logger = require('winston');
var co = require('co');

var app;

function init(a) {
    app = a;
    app.addCommand({
        name: "clear",
        desc: "Clear a channel",
        exec: clear
    });
    return Promise.resolve();
}

function clear(cmd) {
    const user = message.mentions.users.first();
    // Parse Amount
    const amount = !!parseInt(message.content.split(' ')[1]) ? parseInt(message.content.split(' ')[1]) : parseInt(message.content.split(' ')[2])
    if (!amount) return message.reply('Must specify an amount to delete!');
    if (!amount && !user) return message.reply('Must specify a user and amount, or just an amount, of messages to purge!');
    // Fetch 200 messages (will be filtered and lowered up to max amount requested)
    message.channel.fetchMessages({
        limit: 200,
    }).then((messages) => {
        if (user) {
            const filterBy = user ? user.id : Client.user.id;
            messages = messages.filter(m => m.author.id === filterBy).array().slice(0, amount);
        }
        message.channel.bulkDelete(messages).catch(error => console.log(error.stack));
    });
}

module.exports.init = init;
