import {query, Request, Response} from "express"
import dotenv from 'dotenv';
import {Connection, Pool} from "mysql2";
import {
  extractReminderAcc,
  extractReminderSignature,
  getCurrentDateTime, getTriggerInfoByChain, makeTriggerEmailContent,
  sendEmail, VerifyOptions,
  verifyReminderMsg
} from "../lib/PubTools";
const {getDbConn} = require('../lib/DbOperation')
dotenv.config();
const express = require('express')
const router = express.Router()



router.get('/callback', (req: Request, res: Response) => {
  getDbConn().then(async (dbConn: Connection, pool: Pool) => {
    try {
      const reminder_id = req.query._rid_?req.query._rid_.toString():''
      const reminder_bn = req.query._rbn_?req.query._rbn_.toString():''
      const link_bn = req.query._lbn_?req.query._lbn_.toString():''
      const trigger_acc = req.query._acc_?req.query._acc_.toString():''
      const sign = req.query._s_?req.query._s_.toString():''
      const validator_acc = extractReminderAcc(req.headers['validator-acc']?req.headers['validator-acc'].toString():'')
      const validator_sign = extractReminderSignature(req.headers['validator-sign']?req.headers['validator-sign'].toString():'')
      const ip = req.ip
      const created_at = getCurrentDateTime()

      const verifyOptions: VerifyOptions = {
        sign,
        reminder_id,
        reminder_bn,
        link_bn,
        trigger_acc,
        validator_acc,
        validator_sign,
      }
      const verify = verifyReminderMsg(verifyOptions)
      if(verify){
        const dbValidatorAcc = validator_acc.slice(2)

        // Check exists.
        let old_db: any = await dbConn.execute('SELECT * FROM reminder_callback WHERE reminder_id=? AND reminder_bn=? AND link_bn=?', [reminder_id, reminder_bn, link_bn])

        if(old_db && old_db[0].length > 0){
          return res.send({
            status: 'success',
            data: 'sent before'
          })
        }

        let db_result = await dbConn.execute('INSERT INTO reminder_callback (reminder_id, reminder_bn, link_bn, trigger_acc, validator_acc, sign, ip, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [reminder_id, reminder_bn, link_bn, trigger_acc, dbValidatorAcc, sign, ip, created_at]
        )
        // console.log('Reminder callback result = ', db_result)
        // Search registered user
        let db_user_result = await dbConn.execute('SELECT * FROM db_reminder.reminder_users WHERE public_key=?', [trigger_acc])
        // @ts-ignore
        let db_user_set: any[] = db_user_result[0]

        dbConn.destroy()
        if (db_user_set.length == 0) {
          res.send({
            status: 'failed',
            reason: 'No-Bind-User'
          })
        }else{
          const db_user = db_user_set[0]
          // get trigger info.
          const trigger_info = await getTriggerInfoByChain(reminder_id, link_bn)
          await sendEmail(db_user.email, reminder_id, trigger_info, sign);
          res.send({
            status: 'success',
          })
        }

      }else{
        console.log('Verify failed.')
        res.send({
          status: 'failed',
          reason: 'Message-Validation-Failed'
        })
      }
    }catch (err){
      console.log('reminder - callback - SQL - INSERT', err)
      res.send({
        status: 'failed',
        reason: 'SOL-INSERT',
      });
    }
  }).catch((err: any)=>{
    console.log('reminder - callback - SQL - CONNECTION', err)
    res.send({
      status: 'failed',
      reason: 'SOL-CONNECTION',
    });
  })

});


module.exports = router;