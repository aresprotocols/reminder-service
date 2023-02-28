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

  it('Verity msg', function () {

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
