const Botkit = require('botkit');

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
    bot.reply(message, 'hi! from bot!');
});
