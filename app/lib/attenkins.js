'use strict';

const config = require('config');
const util = require('util');
const jenkins = require('jenkins');

module.exports = class Attenkins{

    setJenkins(jenkins) {
        this.jenkins = jenkins;
    }

    constructor(){
        this.jenkins = jenkins(
            {
                baseUrl: util.format(
                    'http://%s:%s@%s:%s',
                    config.jenkins.basicUser,
                    config.jenkins.basicPass,
                    config.jenkins.host,
                    config.jenkins.port
                ),
                crumbIssuer: true,
                promisify: true
            }
        );
    }

    getServerInfo() {
        this.jenkins.info().
        then(function (data) {
            console.log(data);
        }).catch(function (error) {
            console.log(error);
        });
    }

    checkInOutOffice(user, greeting) {
        return new Promise(function (resolve, reject) {
            this.jenkins.job.build({
                name: util.format(
                    '%s-%s',
                    config.jenkins.job.attenkins.prefix,
                    user
                ),
                parameters: {
                    user: user,
                    group: greeting
                }
            }).then(function () {
                console.log(greeting + ' job is kicked by ' + user);
                resolve();
            }).catch(function () {
                console.log(greeting + ' job couldn\'t kicked');
                reject();
            });
        });
    }

    sample() {
        console.log('sample-start');
        // promise内でthisのスコープが変わるため
        let parent = this;
        return new Promise(function (resolve, reject) {
            parent.jenkins.info().then(function () {
                console.log('sample-end-resolve');
                resolve();
            }).catch(function () {
                console.log('sample-end-reject');
                reject('error');
            });
        });
    }
};
