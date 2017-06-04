'use strict';

const expect = require('chai').expect;
const Attenkins = require('../../lib/attenkins.js');
const config = require('config');
const util = require('util');
const sinon = require('sinon');
const moment = require('moment-timezone');
const shouldRejected = require("promise-test-helper").shouldRejected;;
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


describe('test - info', () => {
    let target;
    let spy;
    let stub;

    before((done) => {
        target = new Attenkins();
        done();
    });

    beforeEach((done) => {
        console.log('before');
        spy = sinon.spy(console, 'log');
        done();
    });

    afterEach((done) => {
        spy.restore();
        stub.restore();
        console.log('after');
        done();
    });


    it('-- info success', () => {
        stub = sinon.stub(jenkins, 'info').returns(Promise.resolve());
        target.setJenkins(jenkins);

        return target.sample().then(() => {
            expect(spy.callCount).to.equal(2);
            expect(spy.args[1][0]).to.equal('sample-end-resolve');
        });
    });

    it('-- info failure', () => {
        stub = sinon.stub(jenkins, 'info').returns(Promise.reject());
        target.setJenkins(jenkins);

        return shouldRejected(target.sample()).catch(() => {
            expect(spy.callCount).to.equal(2);
            expect(spy.args[1][0]).to.equal('sample-end-reject');
        });
    });
});

describe('test - getServerInfo', () => {
    let target = new Attenkins();
    let stub;
    let spy;

    beforeEach(() => {
        spy = sinon.spy(console, 'log');
    });

    afterEach(() => {
        spy.restore();
        stub.restore();
    });

    it('-- getServerinfo success', () => {
        stub = sinon.stub(jenkins, 'info').returns(Promise.resolve('hoge'));

        target.setJenkins(jenkins);

        return target.getServerInfo().then(() => {
            expect(spy.calledOnce);
            expect(spy.args[0][0]).to.equal('hoge');
        });
    });

    it('-- getServerInfo failure', () => {
        stub = sinon.stub(jenkins, 'info').returns(Promise.reject('error'));

        target.setJenkins(jenkins);

        return shouldRejected(target.getServerInfo()).catch(() => {
            expect(spy.calledOnce);
            expect(spy.args[0][0]).to.equal('error');
        });
    });
});

describe('test - checkInOutOffice', () => {
    let target = new Attenkins();
    let stub;
    let spy;
    let clock;

    beforeEach(() => {
        spy = sinon.spy(console, 'log');
    });

    afterEach(() => {
        clock.restore();
        spy.restore();
        stub.restore();
    });

    it('-- 15時までなら出勤jobをkickできること', () => {
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

    it('-- 15時以降だと出勤jobをkickできないこと', () => {
        clock = sinon.useFakeTimers(
            // TODO: 直接format文字列からintegerにできるなら変更する
            parseInt(moment(
                moment().tz('Asia/Tokyo').format('YYYY-MM-DD 15:mm:ss')
            ).format('x'))
        );

        // 変更になった場合に備えてstubしておく
        stub = sinon.stub(jenkins.job, 'build').returns(Promise.resolve());
        target.setJenkins(jenkins);

        return shouldRejected(target.checkInOutOffice('dummy', 'hi')).catch(() => {
            expect(spy.callCount).to.equal(1);
            expect(spy.args[0][0]).to.equal('now:15 o\'clock');
        });
    });

    it('-- 12時以降に退勤jobをkickできること', () => {
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

    it('-- 13時前だと退勤jobをkickできないこと', () => {
        clock = sinon.useFakeTimers(
            // TODO: 直接format文字列からintegerにできるなら変更する
            parseInt(moment(
                moment().tz('Asia/Tokyo').format('YYYY-MM-DD 12:mm:ss')
            ).format('x'))
        );
        stub = sinon.stub(jenkins.job, 'build').returns(Promise.resolve());

        target.setJenkins(jenkins);

        return shouldRejected(target.checkInOutOffice('dummy', 'bye')).catch(() => {
            expect(spy.callCount).to.equal(1);
            expect(spy.args[0][0]).to.equal('now:12 o\'clock');
        });
    });

    it('-- jobのkickに失敗した場合、rejectでログを出せること', () => {
        // 打刻のタイミングに問題がないこと
        clock = sinon.useFakeTimers(
            // TODO: 直接format文字列からintegerにできるなら変更する
            parseInt(moment(
                moment().tz('Asia/Tokyo').format('YYYY-MM-DD 14:mm:ss')
            ).format('x'))
        );
        stub = sinon.stub(jenkins.job, 'build').returns(Promise.reject());

        target.setJenkins(jenkins);

        return shouldRejected(target.checkInOutOffice('dummy', 'hi')).catch(() => {
            expect(spy.callCount).to.equal(2);
            expect(spy.args[1][0]).to.equal('hi job couldn\'t kicked');
        });
    });
});

describe('test - loggingWorkLog', () => {
    let target = new Attenkins();
    let stub;
    let spy;

    beforeEach(() => {
        spy = sinon.spy(console, 'log');
    });

    afterEach(() => {
        spy.restore();
        stub.restore();
    });

    it('-- 日時提出jobをkickできること', () => {
        stub = sinon.stub(jenkins.job, 'build').returns(Promise.resolve());

        target.setJenkins(jenkins);

        return target.loggingWorkLog('dummy').then(() => {
            expect(spy.callCount).to.equal(1);
            expect(spy.args[0][0]).to.equal('logging work log job is kicked by dummy');
        });
    });

    it('-- 日時提出jobのkickに失敗した場合、rejectでログを出せること', () => {
        stub = sinon.stub(jenkins.job, 'build').returns(Promise.reject());

        target.setJenkins(jenkins);

        return shouldRejected(target.loggingWorkLog('dummy')).catch(() => {
            expect(spy.callCount).to.equal(1);
            expect(spy.args[0][0]).to.equal('logging work log job couldn\'t kicked');
        });
    });
});

describe('test - invite6tree', () => {
    let target = new Attenkins();
    let stub;
    let spy;
    let today;

    beforeEach(() => {
        spy = sinon.spy(console, 'log');
        today = moment().tz('Asia/Tokyo').format('YYYY/MM/DD');
    });

    afterEach(() => {
        spy.restore();
        stub.restore();
    });

    it('-- 六本木入館申請のjobをkickできること', () => {
        stub = sinon.stub(jenkins.job, 'build').returns(Promise.resolve());

        target.setJenkins(jenkins);

        return target.invite6tree('tester', today).then(() => {
            expect(spy.callCount).to.equal(1);
            expect(spy.args[0][0]).to.equal(today + ' invite 6tree job is kicked by tester');
        });
    });

    it('-- 許可されていない人は六本木入館申請のjobをkickがキャンセルされること', () => {
        stub = sinon.stub(jenkins.job, 'build').returns(Promise.resolve());

        target.setJenkins(jenkins);

        return shouldRejected(target.invite6tree('untester', today)).catch(() => {
            expect(spy.callCount).to.equal(1);
            expect(spy.args[0][0]).to.equal('You have not been approved to invite!');
        });
    });

    it('-- 日付フォーマットがY/M/Dでない場合、失敗すること', () => {
        stub = sinon.stub(jenkins.job, 'build').returns(Promise.resolve());

        target.setJenkins(jenkins);

        return shouldRejected(target.invite6tree('tester', '20170605')).catch(() => {
            expect(spy.callCount).to.equal(1);
            expect(spy.args[0][0]).to.equal('date format is not Y/M/D!');
        });
    });

    it('-- 日付フォーマットがY/M/Dだが、日時として不適切な場合、失敗すること', () => {
        stub = sinon.stub(jenkins.job, 'build').returns(Promise.resolve());

        target.setJenkins(jenkins);

        return shouldRejected(target.invite6tree('tester', '2017/06/32')).catch(() => {
            expect(spy.callCount).to.equal(1);
            expect(spy.args[0][0]).to.equal('date is not valid');
        });
    });

    it('-- 六本木入館申請のjobのkickに失敗した場合、rejectでログを出せること', () => {
        stub = sinon.stub(jenkins.job, 'build').returns(Promise.reject());

        target.setJenkins(jenkins);

        return shouldRejected(target.invite6tree('tester', today)).catch(() => {
            expect(spy.callCount).to.equal(1);
            expect(spy.args[0][0]).to.equal('invite 6tree job couldn\'t kicked');
        });
    });
});
