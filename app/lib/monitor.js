'use strict';

const Promise = require('bluebird');
const util = require('util');

/**
 * botでの当日の出退勤状況を監視して、一時保存する
 *
 **/
module.exports = class Monitor{

    setRepositry(repository) {
        this.repository = repository;
    }

    log(userId, greeting) {
        return new Promise((resolve, reject) => {
            this.repository.get(userId, (err, setting) => {
                if (err) {
                    return resolve('error');
                }

                if (!setting || !setting.logging) {
                    return resolve('no setting');
                }

                switch (greeting) {
                case 'hi':
                    setting.counter = 1;
                    break;
                case 'bye':
                    setting.counter = (setting.counter == 1) ? 2 : 0;
                    break;
                default:
                    setting.counter = 0;
                }
                this.repository.save(setting, () => {
                    return resolve(util.format('counter became to %d', setting.counter));
                });
            });
        });
    }

    toggleLogging(userId){
        return new Promise((resolve, reject) => {
            this.repository.get(userId, (err, setting) => {
                if (!setting) {
                    setting = {
                        'id': userId,
                        'logging': false,
                        'counter': 0
                    };
                }

                setting.logging = !setting.logging;
                setting.counter = 0;

                this.repository.save(setting);
                resolve(setting.logging);
            });
        });
    }
};
