import {
  extractReminderAcc,
  extractReminderSignature,
  getReminderByChain, makeTriggerEmailContent,
  toDecrypt,
  toEncrypt, toFloatPrice, VerifyOptions,
  verifyReminderMsg
} from "../lib/PubTools";
import {verify} from "crypto";

var {describe, it} = require("mocha")
var assert = require('assert');

describe('Verity sign infos', function () {

  // it('Get MultiSigner data', function () {
  //   let res = extractReminderAcc('MultiSigner::Sr25519(d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d (5GrwvaEF...))')
  //   assert.equal(res, '0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d')
  // });
  //
  // it('Get MultiSignature data', function () {
  //   let res = extractReminderSignature('MultiSignature::Sr25519(0ee0008ccdc97be755ae50f2081a87d3b5587ba342b8a46d984c86424372431d2c354a9e09159fad3a43bb40948241e90a63c9ec7794dca9ef12a80aed76cc8f)')
  //   assert.equal(res, '0x0ee0008ccdc97be755ae50f2081a87d3b5587ba342b8a46d984c86424372431d2c354a9e09159fad3a43bb40948241e90a63c9ec7794dca9ef12a80aed76cc8f')
  // });

  // #### 3 1315 1316 aaa ::1 2022-11-5 8:16:12 MultiSigner::Sr25519(d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d (5GrwvaEF...)) MultiSignature::Sr25519(8e8e0e38ebf068e2c8703e2877bd52f2a806b103cf204f1d1c69d3448b095b2fcec0e3dc5ec82947f45e163f8de1eff9e440f5983bb3dec9a53bf7711930fc80)
  it('Verity msg', function () {

    // const verifyOptions: VerifyOptions = {
    //   sign: '',
    //   reminder_id: '2',
    //   reminder_bn: '411',
    //   link_bn: '412',
    //   trigger_acc: '8eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a48',
    //   validator_acc: '0x01d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d',
    //   validator_sign: '0x01c8607142f10a72f1105bd83344714eead5f78cbbe50adbc9bd9583a966f55a7bdfd4b4d9950db85af0a0c5d6e80bea61204f92e4bf303fcd6947127fa305f88d'
    // }

    const verifyOptions: VerifyOptions = {
      sign: '616161',
      reminder_id: '3',
      reminder_bn: '71',
      link_bn: '72',
      trigger_acc: '8eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a48',
      validator_acc: '0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d',
      validator_sign: '0xeed565f36f99f269f1921eab2343aa4bee52b37dcaca00d841b6a981f5353813f2983b7f4810e22a21bda9836d634a641681d82fe2ac551af6af90ffc731df8d'
    }

    assert.ok(verifyReminderMsg(verifyOptions))
    // assert.ok(!verifyReminderMsg('33', rbn, lbn, acc, signature))
  });

  //
  it('Test AresPrice convert Float number.', function () {
    const price1 = toFloatPrice({
      number: '171679645',
      fractionLength: 4
    })
    assert.equal(price1, 17167.9645)
  });

  it('Test AresPrice convert Float number.', function () {
    const emailContent = makeTriggerEmailContent(
        {
          owner: '4SzWaZisswXsccXmUfcH3fU4oP3eLQrKNJ89DZLJ2TbBtMvv',
          intervalBn: '50',
          repeatCount: 1,
          createBn: '1306',
          priceSnapshot: { number: '171679644', fractionLength: 4 },
          lastCheckInfos: {
            checkPrice: { number: '171769460', fractionLength: 4 },
            checkBn: '1547'
          },
          triggerCondition: {
            priceKey: 'btc-usdt',
            anchorPrice: { number: '171679645', fractionLength: 4 }
          },
          triggerReceiver: { url: 'http://localhost:9988/reminder/callback', sign: 'aaa' },
          updateBn: '1307',
          tip: null
        }
    )
    console.log('emailContent == ', emailContent)
    assert.notEqual(emailContent, '')
  });


});





// #### 5 8133 8134 aaa ::1 2022-11-5 8:16:24 MultiSigner::Sr25519(d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d (5GrwvaEF...)) MultiSignature::Sr25519(da2deba8f60d7910f0efd00ba2071af9bbdaef2c9f76eaada29edcabea58164db5bd64ac3b4f4c1b17e2ed7857fdf9847c24be269d8d46fe4edd1ba20544b880)
