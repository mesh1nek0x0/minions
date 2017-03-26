'use strict';

const expect = require('chai').expect;
const Attenkins = require('../../lib/attenkins.js');
const config = require('config');
const util = require('util');
const sinon = require('sinon');
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


describe('test - info test', function () {
    let target = new Attenkins();
    it('-- info success', function () {
        let stub = sinon.stub(jenkins, 'info').returns(Promise.resolve());
        target.setJenkins(jenkins);

        let spy = sinon.spy(console, 'log');

        return target.sample().then(function () {
            expect(spy.callCount).to.equal(2);
            expect(spy.args[1][0]).to.equal('sample-end-resolve');
            stub.restore();
            spy.restore();
        }).catch(function () {
        });
    });

    it('-- info failure', function () {
        let stub = sinon.stub(jenkins, 'info').returns(Promise.reject());
        target.setJenkins(jenkins);

        let spy = sinon.spy(console, 'log');

        return target.sample().then(function () {})
        .catch(function () {
            expect(spy.callCount).to.equal(2);
            expect(spy.args[1][0]).to.equal('sample-end-reject');
            stub.restore();
            spy.restore();
        });
    });
});
