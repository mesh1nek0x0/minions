'use strict'

const Monitor = require('../../lib/monitor.js');
const util = require('util');
const sinon = require('sinon');
const expect = require('chai').expect;
const Store = require('jfs');

describe('monitor test - log' ,() => {
    let target;
    let spy;
    // TODO: ゆくゆくちゃんとstubすること
    let db = new Store("data",{type:'memory'});

    before(function() {
        target = new Monitor();
    });

    it('-- 設定データがない場合、なにもしないこと', () => {
        target.setRepositry(db);

        return target.log('dummy', 'hi').then((result) => {
            expect(result).to.equal('no setting');
        });
    });

    it('-- 設定はあるがOFFになっている場合、なにもしないこと', () => {
        db.save('dummy', {'logging':false, 'counter': 0});
        target.setRepositry(db);

        return target.log('dummy', 'hi').then((result) => {
            expect(result).to.equal('no setting');
        });
    });

    it('設定が有効でhiの場合、必ず1がsetされること', () => {
        db.save('dummy', {'logging':true, 'counter': 3});
        target.setRepositry(db);

        return target.log('dummy', 'hi').then((result) => {
            expect(result).to.equal('counter became to 1');
        });
    });

    it('1のときbyeして2がsetされること', () => {
        db.save('dummy', {'logging':true, 'counter': 1});
        target.setRepositry(db);

        return target.log('dummy', 'bye').then((result) => {
            expect(result).to.equal('counter became to 2');
        });
    });

    it('1以外のときにbyeすると0にresetされること', () => {
        db.save('dummy', {'logging':true, 'counter': 4});
        target.setRepositry(db);

        return target.log('dummy', 'bye').then((result) => {
            expect(result).to.equal('counter became to 0');
        });
    });

    it('意図しない挨拶の場合、0にresetされること', () => {
        db.save('dummy', {'logging':true, 'counter': 4});
        target.setRepositry(db);

        return target.log('dummy', 'hoge').then((result) => {
            expect(result).to.equal('counter became to 0');
        });
    });
});

describe('monitor test - toggleLogging', () => {
    let target;
    let spy;
    // TODO: ゆくゆくちゃんとstubすること
    let db = new Store("data",{type:'memory'});

    before(function() {
        target = new Monitor();
    });

    it('設定がない場合、toggleするとtrueになること', () => {
        target.setRepositry(db);
        return target.toggleLogging('dummy').then((result) => {
            expect(result).to.equal(true);
        });
    });

    it('設定があってfalseの場合toggleするとtrueになること', () => {
        db.save('dummy', {'logging':false});
        target.setRepositry(db);
        return target.toggleLogging('dummy').then((result) => {
            expect(result).to.equal(true);
        });
    });

    it('設定があってtrueの場合toggleするとfalseになること', () => {
        db.save('dummy', {'logging':true});
        target.setRepositry(db);
        return target.toggleLogging('dummy').then((result) => {
            expect(result).to.equal(false);
        });
    });
});
