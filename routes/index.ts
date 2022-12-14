import {query, Request, Response} from "express"
import dotenv from 'dotenv';
import {signatureVerify} from "@polkadot/util-crypto";
import {Connection} from "mysql2";
import {getCurrentDateTime} from "../lib/PubTools";
dotenv.config();
const {getDbConn} = require('../lib/DbOperation')
const express = require('express')
const router = express.Router()

router.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

router.get('/test', (req: Request, res: Response) => {
  let msg = '&_rid_=0&_rbn_=10&_lbn_=10'
  let signature = '0xae3be5069441be0dc1370af333fd4180d548149a2f0a04b881b6e69564d6f15244b4ff6954dc0c6bcafbd099b2e53f9c769c5d73877bc6b5d3794713d28b1988'
  let pubKey = '0x06c41c243c74294cc515287c118e80bd73a8dbc7979ed008b18369742a11811a'
  // let pubKey = '0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d'
  const { isValid } = signatureVerify(msg, signature, pubKey);
  res.send({
    isValid
  })
});

router.post('/bind_infos', (req: Request, res: Response) => {
  // console.log('req.body', req.body)
  const pubKey = req.body.pubKey
  const signature = req.body.signature
  const email = req.body.email

  try{
    const { isValid } = signatureVerify(email, signature, pubKey);
    if (isValid) {
      const dbPubKey = pubKey.slice(2)
      getDbConn().then(async (dbConn: Connection) => {
        try {
          let old_db_result = await dbConn.execute('SELECT * FROM db_reminder.reminder_users WHERE public_key=?', [dbPubKey])
          // @ts-ignore
          let old_data: any[] = old_db_result[0]
          console.log('old_data == ', old_data)
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
          })
        }
      })
    }
  }catch (e: any){
    res.send({status: 'failed', data: e.toString()});
  }

});

module.exports = router;