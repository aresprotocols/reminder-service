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



// #### 5 8133 8134 aaa ::1 2022-11-5 8:16:24 MultiSigner::Sr25519(d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d (5GrwvaEF...)) MultiSignature::Sr25519(da2deba8f60d7910f0efd00ba2071af9bbdaef2c9f76eaada29edcabea58164db5bd64ac3b4f4c1b17e2ed7857fdf9847c24be269d8d46fe4edd1ba20544b880)
