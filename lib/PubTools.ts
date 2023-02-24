import {Response} from "express"
import {apiProvider} from "./ChainOperation"
import {decodeAddress, signatureVerify} from "@polkadot/util-crypto"
import {stringToHex, u8aToHex} from "@polkadot/util";
const CryptoJS = require("crypto-js")
const nodemailer = require('nodemailer')
require('dotenv').config()

export function splitUrlParam<T>(param_str:string): T {
  const data_arr = param_str.split('&')
  const result_obj = {}
  for(let idx in data_arr) {
    const param_arr = data_arr[idx].split('=')
    if(param_arr.length == 2){
      // @ts-ignore
      result_obj[param_arr[0]]=param_arr[1]
    }
  }
  // @ts-ignore
  return result_obj
}

export function resSuccess(res: Response, data: any) {
  res.json({status: 'Success', data})
  res.end()
}

export function resFailed(res: Response, msg: any, code: string='NONE') {
  res.send({status: 'Failed', msg, code})
  res.end()
}

export function getCurrentDateTime() {
  const d_t = new Date();

  let year = d_t.getFullYear();
  let month = d_t.getMonth()+1;
  let day = d_t.getDate();
  let hour = d_t.getHours();
  let minute = d_t.getMinutes();
  let second = d_t.getSeconds();

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

export type VerifyOptions = {
  sign: string,
  reminder_id: string,
  reminder_bn: string,
  link_bn: string,
  trigger_acc: string,
  validator_acc: string,
  validator_sign: string,
}

export type AresPrice = {
  number: string,
  fractionLength: number
}

export type ConditionWithTargetPriceModel = {
  priceKey: string,
  anchorPrice: AresPrice,
}

export type ReceiverWithHttpCallBack = {
  url: string,
  sign: string,
}

export type ReminderData = {
  owner: string,
  intervalBn: string,
  repeatCount: number,
  createBn: string,
  priceSnapshot: AresPrice,
  lastCheckInfos: null|{
    checkPrice: AresPrice,
    checkBn: string,
  },
  triggerCondition: null|ConditionWithTargetPriceModel,
  triggerReceiver: null|ReceiverWithHttpCallBack,
  updateBn: string,
  tip: string|null,
}

export const toEncrypt = (message: string, secret_key: string): string => {
  const enc = CryptoJS.Rabbit.encrypt(encodeURIComponent(message), secret_key).toString();
  const encrypt = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(enc))
  return encrypt
}

export const toDecrypt = (encrypted: string, secret_key: string): string => {
  try{
    let decData = CryptoJS.enc.Base64.parse(encrypted).toString(CryptoJS.enc.Utf8);
    let message = CryptoJS.Rabbit.decrypt(decData, secret_key).toString(CryptoJS.enc.Utf8);
    return decodeURIComponent(message)
  }catch (err){
    return ''
  }
}

// MultiSigner::Sr25519(d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d (5GrwvaEF...))
export const extractReminderAcc = (multiSigner: string) => {
  return `0x${multiSigner.slice(2)}`
  // let res = multiSigner.match('MultiSigner::Sr25519(.*) ')
  // if(res){
  //   return '0x'+res[1].replace('(', '').replace(')', '')
  // }
  // return ''
}

// MultiSignature::Sr25519(0ee0008ccdc97be755ae50f2081a87d3b5587ba342b8a46d984c86424372431d2c354a9e09159fad3a43bb40948241e90a63c9ec7794dca9ef12a80aed76cc8f)
export const extractReminderSignature = (multiSignature: string) => {
  return `0x${multiSignature.slice(2)}`
  // let res = multiSignature.match('MultiSignature::Sr25519\(.*\)')
  // if(res){
  //   return '0x'+res[1].replace('(', '').replace(')', '')
  // }
  // return ''
}

export const getReminderByChain = (acc: string, rid: string|number, bn: string|number, pending_bn:string|number): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    const api = await apiProvider()
    const blockHash = await api.rpc.chain.getBlockHash(pending_bn)
    console.log('blockHash = ', blockHash.toString())
    const apiAt = await api.at(blockHash.toString())
    // aresReminder.pendingSendList
    const pendingInfo = await apiAt.query.aresReminder.pendingSendList(acc, [rid, bn])
    console.log('pendingInfo = ', pendingInfo.toHuman())
    resolve(pendingInfo)
  })
}


export const verifyReminderMsg = (options: VerifyOptions) => {
// _s_=616161&_rid_=3&_rbn_=71&_lbn_=72&_acc_=8eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a48
  const msg = `_s_=${options.sign}&_rid_=${options.reminder_id}&_rbn_=${options.reminder_bn}&_lbn_=${options.link_bn}&_acc_=${options.trigger_acc}`
  console.debug('msg == ', msg, options.validator_sign, options.validator_acc)
  // TODO::Check if the validator_acc account is a validator on the chain
  const { isValid } = signatureVerify(msg, options.validator_sign, options.validator_acc);
  return isValid
}

export const sendEmail = (toEmail:string, reminder_id: string ,dataObj: ReminderData) => {
  return new Promise(async (resolve, reject) => {
    console.log(`Send email to: ${toEmail}, reminder id = ${reminder_id}`)
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_SMTP_PORT,
      secure: process.env.MAIL_SMTP_SECURE, // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_AUTH_USER, // generated ethereal user
        pass: process.env.MAIL_AUTH_PASS,// generated ethereal password
      },
    });

    const emojiUp = '🔺'
    const emojiDown = '🔻'
    let currentEmoji = '❓'
    if(dataObj.triggerCondition && dataObj.triggerCondition.anchorPrice && dataObj.priceSnapshot){
      if(toFloatPrice(dataObj.triggerCondition.anchorPrice)> toFloatPrice(dataObj.priceSnapshot)){
        currentEmoji = emojiUp
      }else{
        currentEmoji = emojiDown
      }
    }

    let info = await transporter.sendMail({
      from: `"Price reminder #${dataObj.tip}# id: ${reminder_id} has reached ${currentEmoji}" on ${dataObj.triggerCondition?toFloatPrice(dataObj.triggerCondition.anchorPrice):'--'} <${process.env.MAIL_AUTH_USER}>`, // sender address
      to: toEmail, // list of receivers
      subject: `[${dataObj.triggerCondition?.priceKey}], #${dataObj.tip}# has reached ${dataObj.triggerCondition?toFloatPrice(dataObj.triggerCondition.anchorPrice):'--'}`, // Subject line
      // text: `${dataObj.triggerCondition?.priceKey} price reminder:`, // plain text body
      html: `${makeTriggerEmailContent(dataObj)}`, // html body
    });
    console.info("Message sent: %s", info.messageId)
    resolve(info.messageId)
  })
}

export const convertToBn = (bn: string): string => {
  return bn.replaceAll(',', '')
}

export const convertToAresPrice = (obj: any): null|AresPrice => {
  if(obj.number && obj.fractionLength) {
    return {
      number: obj.number.toString().replaceAll(',', ''),
      fractionLength: parseInt(obj.fractionLength)
    }
  }
  return null
}

export const getTriggerInfoByChain = (rid: string|number, lbn: string|number): Promise<ReminderData> => {
  return new Promise(async (resolve, reject) => {
    const api = await apiProvider()
    const blockHash = await api.rpc.chain.getBlockHash(lbn)
    const apiAt = await api.at(blockHash.toString())

    const reminderInfo = await apiAt.query.aresReminder.reminderList(rid)
    const reminderJson = reminderInfo.toHuman()

    if(reminderJson){

      let condition: null|ConditionWithTargetPriceModel = null
      // @ts-ignore
      if(reminderJson.triggerCondition.TargetPriceModel && reminderJson.triggerCondition.TargetPriceModel.anchorPrice) {
        condition = {
          // @ts-ignore
          priceKey: reminderJson.triggerCondition.TargetPriceModel.priceKey,
          // @ts-ignore
          anchorPrice: convertToAresPrice(reminderJson.triggerCondition.TargetPriceModel.anchorPrice),
        }
      }

      let receiver: null|ReceiverWithHttpCallBack = null
      // @ts-ignore
      if(reminderJson.triggerReceiver.HttpCallBack) {
        receiver = {
          // @ts-ignore
          url: reminderJson.triggerReceiver.HttpCallBack.url,
          // @ts-ignore
          sign: reminderJson.triggerReceiver.HttpCallBack.sign
        }
      }

      let checkInfos = null;
      // @ts-ignore
      if(reminderJson.lastCheckInfos) {
        checkInfos = {
          // @ts-ignore
          checkPrice: convertToAresPrice(reminderJson.lastCheckInfos[0]),
          // @ts-ignore
          checkBn: convertToBn(reminderJson.lastCheckInfos[1]),
        }
      }

      let reminder_data: ReminderData = {
        // @ts-ignore
        owner: reminderJson.owner,
        // @ts-ignore
        intervalBn: convertToBn(reminderJson.intervalBn),
        // @ts-ignore
        repeatCount: parseInt(reminderJson.repeatCount),
        // @ts-ignore
        createBn: convertToBn(reminderJson.createBn),
        // @ts-ignore
        priceSnapshot: convertToAresPrice(reminderJson.priceSnapshot),
        // @ts-ignore
        lastCheckInfos: checkInfos,
        triggerCondition: condition,
        triggerReceiver: receiver,
        // @ts-ignore
        updateBn: convertToBn(reminderJson.updateBn),
        // @ts-ignore
        tip: reminderJson.tip,
      }
      resolve(reminder_data)
    }else{
      reject(null)
    }
  })
}

export const toFloatPrice = (obj: AresPrice): number => {
  let integer = obj.number.trim().slice(0, obj.number.trim().length - obj.fractionLength)
  let fraction_num = obj.number.trim().slice(obj.number.trim().length - obj.fractionLength)
  return parseFloat(`${integer}.${fraction_num}`)
}

export const makeTriggerEmailContent = (obj: ReminderData): string => {
  return `
    <p>Trigger owner: ${obj.owner} [${u8aToHex(decodeAddress(obj.owner))}]</p>
    <p>Anchor price: ${obj.triggerCondition?toFloatPrice(obj.triggerCondition.anchorPrice):'--'} has arrived on ${obj?.updateBn} (BlockNumber).</p>
    <p>Remaining notices times: ${obj.repeatCount-1}.</p>
    <p>Minimum interval: ${obj.intervalBn} (BlockNumber)</p>
  `
}