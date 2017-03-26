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


describe('test - info', function () {
    let target;
    let spy;
    let stub;

    before(function(done) {
        target = new Attenkins();
        done();
    });

    beforeEach(function(done) {
        console.log('before');
        spy = sinon.spy(console, 'log');
        done();
    });

    afterEach(function (done) {
        spy.restore();
        stub.restore();
        console.log('after');
        done();
    });


    it('-- info success', function () {
        stub = sinon.stub(jenkins, 'info').returns(Promise.resolve());
        target.setJenkins(jenkins);

        return target.sample().then(function () {
            expect(spy.callCount).to.equal(2);
            expect(spy.args[1][0]).to.equal('sample-end-resolve');
        }).catch(function () {
        });
    });

    it('-- info failure', function () {
        stub = sinon.stub(jenkins, 'info').returns(Promise.reject());
        target.setJenkins(jenkins);

        return target.sample().then(function () {})
        .catch(function () {
            expect(spy.callCount).to.equal(2);
            expect(spy.args[1][0]).to.equal('sample-end-reject');
        });
    });
});

describe('test - getServerInfo', function () {
    let target = new Attenkins();
    let stub;
    let spy;

    beforeEach(function () {
        spy = sinon.spy(console, 'log');
    });

    afterEach(function () {
        spy.restore();
        stub.restore();
    });

    it('-- getServerinfo success', function () {
        stub = sinon.stub(jenkins, 'info').returns(Promise.resolve('hoge'));

        target.setJenkins(jenkins);

        return target.getServerInfo().then(function () {
            expect(spy.calledOnce);
            expect(spy.args[0][0]).to.equal('hoge');
        });
    });

    it('-- getServerInfo failure', function () {
        stub = sinon.stub(jenkins, 'info').returns(Promise.reject('error'));

        target.setJenkins(jenkins);

        return target.getServerInfo().then(
            function () {}
        ).catch(function () {
            expect(spy.calledOnce);
            expect(spy.args[0][0]).to.equal('error');
        });
    });
});
