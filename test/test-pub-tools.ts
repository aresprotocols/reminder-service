import {getReminderByChain, toDecrypt, toEncrypt} from "../lib/PubTools";

var {describe, it} = require("mocha")
var assert = require('assert');
describe('Array', function () {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      const source_msg = "Hello kami!"
      const key_str = 'winner'
      const crypt_msg = toEncrypt(source_msg, key_str)
      assert.equal(source_msg, toDecrypt(crypt_msg, key_str))
    });
  });
});


describe('Get reminder infos', function () {
  describe('# by storage data of chain', function () {
    it('Get data', function (done: any) {
      getReminderByChain('4U52mX4kJWAYwHEn76y9NBjZMu7TU3Ve8WWKXJcq6Vrzi9fK', 4, '291', '292').then(res=>{
        done()
      })
    });
  });
});



