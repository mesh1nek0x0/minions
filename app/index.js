const Botkit = require('botkit');
const Attenkins = require('./lib/attenkins.js');
const config = require('config');
const util = require('util');
const CronJob = require('cron').CronJob;

if (!process.env.token) {
    console.log('Error: Specify token in enviroment');
    process.exit(1);
}

const controller = Botkit.slackbot({
    retry: config.botkit.retryMax,
    json_file_store: 'minions_simple_db',
    debug: false
});

controller.spawn({
    token: process.env.token
}).startRTM(function(err){
    if (err) {
        throw new Error(err);
    }
});

controller.hears(['hi', 'bye'], ['direct_message', 'direct_mention', 'mention'], function(bot, message) {
    bot.api.users.info({user: message.user}, (error, response) => {
        let attenkins = new Attenkins();
        attenkins.checkInOutOffice(response.user.name, message.text)
        .then(function () {
            bot.reply(
                message,
                util.format(
                    'hi! I\'m minions! you checked %s office now\n',
                    (message.text == 'hi') ? 'in' : 'out'
                )
            );
            controller.storage.users.get(response.user.name, (err, setting) => {
                if (!setting || !setting.logging) {
                    return;
                }
                switch (message.text) {
                    case 'hi':
                        setting.counter = 1;
                        break;
                    case 'bye':
                        setting.counter = (setting.counter == 1) ? 2 : 0;
                        break;
                    default:
                        setting.counter = 0;
                }
                controller.storage.users.save(setting);
            });
        }).catch(function () {
            bot.reply(message, 'hi! I\'m minions! sorry I failed mission\n');
        });
    });
});

controller.hears('info', ['direct_message', 'direct_mention', 'mention'], function(bot, message) {
    bot.api.users.info({user: message.user}, (error, response) => {
        bot.reply(
            message,
            util.format(
                'hi %s ! I\'m minions! I\'m still alive now!\n retryMax is %d',
                response.user.name,
                config.botkit.retryMax
            )
        );
    });
});

controller.hears('forever', ['direct_message', 'direct_mention', 'mention'], function(bot, message) {
    bot.reply(
        message,
        'forever test is started! I\'m going down... good bye!',
        function () {
            throw new Error('forever test');
        }
    );
});

controller.hears('^log$', ['direct_message', 'direct_mention', 'mention'], function(bot, message) {
    bot.api.users.info({user: message.user}, (error, response) => {
        let attenkins = new Attenkins();
        attenkins.loggingWorkLog(response.user.name, message.text)
        .then(function () {
            bot.reply(
                message,
                'hi! I\'m minions! I try to log Yesterday Working-Log!\n'
            );
        }).catch(function () {
            bot.reply(message, 'hi! I\'m minions! sorry I failed mission\n');
        });
    });
});

controller.hears('toggle-logging', ['direct_message', 'direct_mention', 'mention'], function(bot, message) {
    bot.api.users.info({user: message.user}, (error, response) => {
        controller.storage.users.get(response.user.name, (err, userSetting) => {
            if (!userSetting) {
                userSetting = {
                    'id': response.user.name,
                    'logging': false,
                    'counter': 0
                };
            }

            userSetting.logging = !userSetting.logging;
            userSetting.counter = 0;

            controller.storage.users.save(userSetting, () => {
                bot.reply(
                    message,
                    util.format('hi! I\'m minions! I toggle logging setting to %s!\n', userSetting.logging)
                );
            });
        });
    });
});
