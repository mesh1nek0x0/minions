'use strict';

const fs = require('fs');
const readline = require('readline');
const google = require('googleapis');
const googleAuth = require('google-auth-library');

var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json';

exports.getEvents = (() => {
    return new Promise(function (resolve, reject) {
        fs.readFile('client_secret.json', function processClientSecrets(err, content) {
            if (err) {
                console.log('Error loading client secret file:' + err);
                reject(new Error);
            }
            authrize(JSON.parse(content), listEvent).then(function (event) {
                resolve(event);
            }).catch(function (err) {
                reject(err);
            });
        });
    });
});

function authrize(credential, callback) {
    return new Promise(function (resolve, reject) {
        var clientSecret = credential.installed.client_secret;
        var clientId = credential.installed.client_id;
        var redirectUrl = credential.installed.redirect_uris[0];
        var auth = new googleAuth();
        var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

        fs.readFile(TOKEN_PATH, function(err, token) {
            if (err) {
                getNewToken(oauth2Client, callback);
            } else {
                oauth2Client.credentials = JSON.parse(token);
                callback(oauth2Client).then(function (value) {
                    resolve(value);
                }).catch(function (error) {
                    reject(error);
                });
            }
        });
    });
}


function getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('authrize this app by visiting this url:' + authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code fron the page here :', function (code) {
        rl.close();
        oauth2Client.getToken(code, function (err, token) {
            if (err) {
                console.log('Error while trying to retrive access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client);
        });
    });
}


function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('TOKEN stored to ' + TOKEN_PATH);
}

function listEvent(auth) {
    return new Promise(function (resolve, reject) {
        var calendar = google.calendar('v3');
        calendar.events.list({
            auth: auth,
            calendarId: 'primary',
            timeMin: (new Date()).toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime'
        }, function(err, response) {
            if (err) {
                console.log('The API returned an error:' + err);
                reject('API ERROR');
            }
            var events = response.items;
            if (events.length == 0) {
                console.log('No upcoming events found.');
            } else {
                console.log('list up upcoming events *max 10 events');
                for (var i = 0; i < events.length; i++) {
                    var event = events[i];
                    var start = event.start.dateTime || event.start.date;
                    console.log('%s - %s', start, event.summary);
                    resolve(start + ' : ' + event.summary);
                }
            }
        });
    });
}
