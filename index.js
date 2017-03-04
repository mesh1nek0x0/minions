const Botkit = require('botkit');
const attenkins = require('./attenkins.js');

if (!process.env.token) {
    console.log('Error: Specify token in enviroment');
    process.exit(1);
}

const controller = Botkit.slackbot({
    debug: false
});

controller.spawn({
    token: process.env.token
}).startRTM(function(err){
    if (err) {
        throw new Error(err);
    }
});

controller.hears('hi', ['direct_message', 'direct_mention', 'mention'], function(bot, message) {
    bot.api.users.info({user: message.user}, (error, response) => {
        attenkins.checkInOffice(response.user.name)
        .then(function () {
            bot.reply(message, 'hi! I\'m minions! you checked in office now\n');
        }).catch(function () {
            bot.reply(message, 'hi! I\'m minions! sorry I failed mission\n');
        });
    });
});
