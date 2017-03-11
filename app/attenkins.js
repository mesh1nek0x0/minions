'use strict';

const config = require('config');
const util = require('util');

const jenkins = require('jenkins')(
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


exports.getServerInfo = (() => {
    jenkins.info().
    then(function (data) {
        console.log(data);
    }).catch(function (error) {
        console.log(error);
    });
});

exports.checkInOutOffice = ((user, greeting) => {
    return new Promise(function (resolve, reject) {
        jenkins.job.build({
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
});
