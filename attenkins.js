'use strict';

const jenkins = require('jenkins')(
    { baseUrl: 'http://' + process.env.user + ':' + process.env.pass + '@localhost:8080', crumbIsuser: true, promisify: true});


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
