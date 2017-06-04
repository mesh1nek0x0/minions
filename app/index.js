const Botkit = require('botkit');
const Attenkins = require('./lib/attenkins.js');
const Monitor = require('./lib/monitor.js');
const config = require('config');
const util = require('util');
const CronJob = require('cron').CronJob;
const moment = require('moment-timezone');

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
}).startRTM(function(err, bot){
    new CronJob({
        // 昨日のものを提出するので土曜も含める
        cronTime: '30 */2 * * 1-6',
        onTick: () => {
            console.log('cron job started');
            controller.storage.users.all((err, logCounters) => {
                if (!logCounters) {
                    return;
                }
                Object.keys(logCounters).forEach((key) => {
                    if (logCounters[key].logging == false) {
                        return;
                    }
                    if (logCounters[key].counter >= 5) {
                        let attenkins = new Attenkins();
                        attenkins.loggingWorkLog(logCounters[key].id).then(() => {
                            console.log('connect succeeded...');
                        }).catch(() => {
                            console.log('connect faled...');
                        }).finally(() => {
                            bot.say({
                                channel: config.botkit.channel,
                                text: util.format('@%s I tried to log your Working-Log', logCounters[key].id),
                                link_names: 1,
                            });
                            logCounters[key].counter = 0;
                            controller.storage.users.save(logCounters[key]);
                            return;
                        });
                    }

                    if (logCounters[key].counter >= 2) {
                        console.log('id:' + logCounters[key].id);
                        console.log('counter is up++');
                        logCounters[key].counter++;
                        controller.storage.users.save(logCounters[key]);
                    }

                });
            });
        },
        start: true

    });
    if (err) {
        throw new Error(err);
    }
});

controller.hears(['hi', 'bye'], ['direct_message', 'direct_mention', 'mention'], function(bot, message) {
    bot.api.users.info({user: message.user}, (error, response) => {
        let attenkins = new Attenkins();
        attenkins.checkInOutOffice(response.user.name, message.text)
        .then(() => {
            bot.reply(
                message,
                util.format(
                    'hi! I\'m minions! you checked %s office now\n',
                    (message.text == 'hi') ? 'in' : 'out'
                )
            );
        }).then(() => {
            let monitor = new Monitor();
            monitor.setRepositry(controller.storage.users);
            monitor.log(response.user.name, message.text);
        }).catch(function () {
            bot.reply(message, 'hi! I\'m minions! sorry I failed mission\n');
        });
    });
});

controller.hears('info', ['direct_message', 'direct_mention', 'mention'], function(bot, message) {
    bot.api.users.info({user: message.user}, (error, response) => {
        controller.storage.users.get(response.user.name, (err, setting) => {
            if (!setting) {
                bot.reply(
                    message,
                    util.format(
                        'hi %s ! I\'m minions! I\'m still alive now!',
                        response.user.name
                    )
                );
                return;
            }
            bot.reply(
                message,
                util.format(
                    'hi %s ! I\'m still alive now!\n counter is %d & logging is %s',
                    response.user.name,
                    setting.counter,
                    setting.logging
                )
            );
        });
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
        attenkins.loggingWorkLog(response.user.name)
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
            let monitor = new Monitor();
            monitor.setRepositry(controller.storage.users);
            monitor.toggleLogging(response.user.name).then((result) => {
                bot.reply(
                    message,
                    util.format('hi! I\'m minions! I toggled logging setting to %s!\n', result)
                );
            }).catch(() => {});
        });
    });
});

controller.hears(['invite', 'invite (.*)'], ['direct_message', 'direct_mention', 'mention'], function(bot, message) {
    let matches = message.text.match(/invite (.*)$/i);
    let date = moment().tz('Asia/Tokyo').format('YYYY/MM/DD');
    // 日付の有効性チェックはlibに任せる
    if (matches) {
        date = matches[1];
    }

    bot.api.users.info({user: message.user}, (error, response) => {
        let attenkins = new Attenkins();
        attenkins.invite6tree(response.user.name, date)
        .then(() => {
            bot.reply(
                message,
                util.format('hi! I\'m minions! I invite you to 6p-tree at %s soon!\n', date)
            );
        }).catch(() => {
            bot.reply(message, 'hi! I\'m minions! sorry I failed to invite you\n');
        });
    });
});
