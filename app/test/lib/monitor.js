'use strict'

const Monitor = require('../../lib/monitor.js');
const util = require('util');
const sinon = require('sinon');
const expect = require('chai').expect;
const Store = require('jfs');

describe('monitor test - log' ,() => {
    let target;
    let spy;
    let stub;
    let db = new Store("data",{type:'memory'});

    before(function() {
        target = new Monitor();
    });

    it('-- 設定データがない場合、なにもしないこと', (done) => {
        db.save({'id': 'dummy', 'logging':true, 'counter': 0});
        target.setRepositry(db);

        target.log('dummy', 'hi').then((result) => {
            expect(result).to.equal('no setting');
            done();
        }).catch((e) => {
            done(e);
        });
    });

    // it('-- 設定はあるがOFFになっている場合、なにもしないこと', () => {
    //     stub = sinon.stub(db, 'get').returns({'logging':false});
    //     target.setRepositry(stub);
    //
    //     return target.log('dummy', 'hi').then((result) => {
    //         expect(result).to.equal('no settings');
    //     }).catch(()=>{});
    // });
    //
    // it('設定が有効でhiの場合、必ず1がsetされること', () => {
    //     db.save({'id': 'dummy', 'logging':true, 'counter': 0});
    //     target.setRepositry(db);
    //
    //     return target.log('dummy', 'hi').then((result) => {
    //         expect(result).to.equal('counter became to 1');
    //         expect(db.get('dummy').counter).to.equal(1);
    //     }).catch(()=>{});
    // });
});
