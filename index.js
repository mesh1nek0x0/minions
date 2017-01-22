const Botkit = require('botkit');
const googleCalendar = require('./google-calender.js');

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
    bot.reply(message, 'hi! I\'m minions! your recently event is bellow\n');
    googleCalendar.getEvents().then(function (event) {
        bot.reply(message, event);
    }).catch(function (error) {
        bot.reply(message, 'sorry unkown error has occurred....');
        console.log(error);
    });
});
