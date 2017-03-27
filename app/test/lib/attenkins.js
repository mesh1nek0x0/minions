'use strict';

const expect = require('chai').expect;
const Attenkins = require('../../lib/attenkins.js');
const config = require('config');
const util = require('util');
const sinon = require('sinon');
const moment = require('moment-timezone');
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

describe('test - checkInOutOffice', function () {
    let target = new Attenkins();
    let stub;
    let spy;
    let clock;

    beforeEach(function () {
        spy = sinon.spy(console, 'log');
    });

    afterEach(function () {
        clock.restore();
        spy.restore();
        stub.restore();
    });


    it('-- 15時までなら出勤jobをkickできること', function () {
        clock = sinon.useFakeTimers(
            // TODO: 直接format文字列からintegerにできるなら変更する
            parseInt(moment(
                moment().tz('Asia/Tokyo').format('YYYY-MM-DD 14:mm:ss')
            ).format('x'))
        );
        stub = sinon.stub(jenkins.job, 'build').returns(Promise.resolve());

        target.setJenkins(jenkins);

        return target.checkInOutOffice('dummy', 'hi').then(() => {
            expect(spy.callCount).to.equal(2);
            expect(spy.args[0][0]).to.equal('now:14 o\'clock');
            expect(spy.args[1][0]).to.equal('hi job is kicked by dummy');
        });
    });

    it('-- 15時以降だと出勤jobをkickできないこと', function () {
        clock = sinon.useFakeTimers(
            // TODO: 直接format文字列からintegerにできるなら変更する
            parseInt(moment(
                moment().tz('Asia/Tokyo').format('YYYY-MM-DD 15:mm:ss')
            ).format('x'))
        );

        // 変更になった場合に備えてstubしておく
        stub = sinon.stub(jenkins.job, 'build').returns(Promise.resolve());
        target.setJenkins(jenkins);

        return target.checkInOutOffice('dummy', 'hi').then(() => {
        }).catch(function () {
            expect(spy.callCount).to.equal(1);
            expect(spy.args[0][0]).to.equal('now:15 o\'clock');
        });
    });

    it('-- 12時以降に退勤jobをkickできること', function () {
        clock = sinon.useFakeTimers(
            // TODO: 直接format文字列からintegerにできるなら変更する
            parseInt(moment(
                moment().tz('Asia/Tokyo').format('YYYY-MM-DD 13:mm:ss')
            ).format('x'))
        );
        stub = sinon.stub(jenkins.job, 'build').returns(Promise.resolve());

        target.setJenkins(jenkins);

        return target.checkInOutOffice('dummy', 'bye').then(() => {
            expect(spy.callCount).to.equal(2);
            expect(spy.args[0][0]).to.equal('now:13 o\'clock');
            expect(spy.args[1][0]).to.equal('bye job is kicked by dummy');
        });
    });

    it('-- 13時前だと退勤jobをkickできないこと', function () {
        clock = sinon.useFakeTimers(
            // TODO: 直接format文字列からintegerにできるなら変更する
            parseInt(moment(
                moment().tz('Asia/Tokyo').format('YYYY-MM-DD 12:mm:ss')
            ).format('x'))
        );
        stub = sinon.stub(jenkins.job, 'build').returns(Promise.resolve());

        target.setJenkins(jenkins);

        return target.checkInOutOffice('dummy', 'bye').then(() => {
        }).catch(function () {
            expect(spy.callCount).to.equal(1);
            expect(spy.args[0][0]).to.equal('now:12 o\'clock');
        });
    });

    it('-- jobのkickに失敗した場合、rejectでログを出せること', function () {
        // 打刻のタイミングに問題がないこと
        clock = sinon.useFakeTimers(
            // TODO: 直接format文字列からintegerにできるなら変更する
            parseInt(moment(
                moment().tz('Asia/Tokyo').format('YYYY-MM-DD 14:mm:ss')
            ).format('x'))
        );
        stub = sinon.stub(jenkins.job, 'build').returns(Promise.reject());

        target.setJenkins(jenkins);

        return target.checkInOutOffice('dummy', 'hi').then(() => {
        }).catch(() => {
            expect(spy.callCount).to.equal(2);
            expect(spy.args[1][0]).to.equal('hi job couldn\'t kicked');
        });
    });
});
