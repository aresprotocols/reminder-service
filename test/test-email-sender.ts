import {
    ReminderData,
    sendEmail,
} from "../lib/PubTools";
import {Done} from "mocha";

const {describe, it} = require("mocha")
const assert = require('assert');
describe('Email sender', function () {
    describe('Test send email to 630086711@qq.com', function (done: Done) {
        const emailContent = {
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
        sendEmail('630086711@qq.com', "1", emailContent).then(res => {
            done()
        })
    });
});




