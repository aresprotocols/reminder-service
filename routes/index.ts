import {query, Request, Response} from "express"
import dotenv from 'dotenv';
import {signatureVerify} from "@polkadot/util-crypto";
import {Connection} from "mysql2";
import {getCurrentDateTime} from "../lib/PubTools";
import {REMINDER_VERIFICATION_MSG} from "../lib/ReminerConfig";
dotenv.config();
const {getDbConn} = require('../lib/DbOperation')
const express = require('express')
const router = express.Router()

router.get('/', (req: Request, res: Response) => {
  res.send(`Reminder Mail Server`);
});

// router.get('/test', (req: Request, res: Response) => {
//   let msg = '&_rid_=0&_rbn_=10&_lbn_=10'
//   let signature = '0xae3be5069441be0dc1370af333fd4180d548149a2f0a04b881b6e69564d6f15244b4ff6954dc0c6bcafbd099b2e53f9c769c5d73877bc6b5d3794713d28b1988'
//   let pubKey = '0x06c41c243c74294cc515287c118e80bd73a8dbc7979ed008b18369742a11811a'
//   // let pubKey = '0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d'
//   const { isValid } = signatureVerify(msg, signature, pubKey);
//   res.send({
//     isValid
//   })
// });

router.post('/has_bound_infos', (req: Request, res: Response) => {

  const pubKey = req.body.pubKey
  const dbPubKey = pubKey.slice(2)

  try{
    getDbConn().then(async (dbConn: Connection) => {
      try {
        let old_db_result = await dbConn.execute('SELECT * FROM db_reminder.reminder_users WHERE public_key=?', [dbPubKey])
        // @ts-ignore
        let old_data: {id: number, email: string}[] = old_db_result[0]
        if (old_data.length > 0 && old_data[0].id > 0) {
          res.send({
            status: 'success',
            email: req.session.logined?old_data[0].email:null,
            data: true,
          })
        } else {
          res.send({
            status: 'success',
            email: null,
            data: false,
          })
        }
      } catch (err) {
        res.send({
          status: 'failed',
          data: err
        })
      } finally {
        dbConn.end()
      }
    })
  }catch (e: any) {
    res.send({status: 'failed', data: e.toString()});
  }
});

router.post('/login', (req: Request, res: Response) => {
  const pubKey = req.body.pubKey
  const signature = req.body.signature
  const msg = req.body.msg
  req.session.logined = false

  if(msg != REMINDER_VERIFICATION_MSG) {
    return res.send({
      status: 'failed',
      data: `Need signature message: ${REMINDER_VERIFICATION_MSG}`
    })
  }
  const { isValid } = signatureVerify(msg, signature, pubKey);
  if(isValid){
    req.session.logined = true
    return res.send({
      status: 'success',
      data: true
    })
  }else{
    return res.send({
      status: 'failed',
      data: `Invalid signature.`
    })
  }
})

router.post('/bind_infos', (req: Request, res: Response) => {
  // console.log('req.body', req.body)
  const pubKey = req.body.pubKey
  const signature = req.body.signature
  const email = req.body.email
  // Set default value
  req.session.logined = false

  try{
    const { isValid } = signatureVerify(email, signature, pubKey);

    if (isValid) {
      const dbPubKey = pubKey.slice(2)
      getDbConn().then(async (dbConn: Connection) => {
        try {
          let old_db_result = await dbConn.execute('SELECT * FROM db_reminder.reminder_users WHERE public_key=?', [dbPubKey])
          // @ts-ignore
          let old_data: any[] = old_db_result[0]
          const current_time = getCurrentDateTime()
          let db_result=null
          if (old_data.length > 0) {
            // To update old data
            db_result = await dbConn.execute('UPDATE reminder_users SET email = ?, updated_at = ? WHERE (id = ?)',
                [email, current_time, old_data[0].id]
            )
          }else{
            // To insert new one.
            db_result = await dbConn.execute('INSERT INTO reminder_users (public_key, email, created_at, updated_at) VALUES (?, ?, ?, ?)',
                [dbPubKey, email, current_time, current_time]
            )
          }

          req.session.logined = true

          res.send({
            status: 'success',
            data: {
              dbOper: old_data.length > 0 ? 'update': 'insert',
              dbResult: db_result,
            },
          });
        } catch (err) {
          res.send({
            status: 'failed',
            data: err
          })
        } finally {
          dbConn.end()
        }
      })
    }
  }catch (e: any){
    res.send({status: 'failed', data: e.toString()});
  }

});

module.exports = router;