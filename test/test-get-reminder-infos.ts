import {getTriggerInfoByChain,} from "../lib/PubTools";
import {Done} from "mocha";

var {describe, it} = require("mocha")
var assert = require('assert');

describe('Verity sign infos', function () {

  it('Verity msg', function (done: Done) {
    getTriggerInfoByChain(3, 1550).then(res=>{
      done()
    }).catch(err=>{
      assert(false, err)
    })
  });

});
