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

exports.checkInOffice = ((user) => {
    return new Promise(function (resolve, reject) {
        jenkins.job.build({name: 'slack-test', parameters: {user: user}})
        .then(function () {
            console.log('slack-test is kicked by ' + user);
            resolve(user);
        }).catch(function () {
            console.log('slack-test couldn\'t kicked');
            reject();
        });
    });
});
