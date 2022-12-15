import logo from './logo.svg';
import './App.css';
import {useEffect, useState} from "react";
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import {stringToHex, stringToU8a, u8aToHex} from "@polkadot/util";
import {Identicon} from '@polkadot/react-identicon';
import {decodeAddress} from "@polkadot/util-crypto";
import axios from "axios";
import {BN} from "@polkadot/util/bn/bn";
import {ApiPromise, WsProvider} from "@polkadot/api";

function App() {

    const [bindEmail, setBindEmail] = useState('630086711@qq.com')
    const [web3AccountList, setWeb3AccountList] = useState([])
    const [accAddress, setAccAddress] = useState(null)
    const [symbolList, setSymbolList] = useState([
        'btc-usdt',
        'eth-usdt',
        'dot-usdt',
        'link-usdt',
        'ada-usdt',
        'sol-usdt',
        'uni-usdt',
    ])
    const [currentSymbol, setCurrentSymbol] = useState(null)
    const [anchorPrice, setAnchorPrice] = useState(null)
    const [reminderInterval, setReminderInterval] = useState(50)
    const [reminderRepeatCount, setReminderRepeatCount] = useState(2)
    const [reminderList, setReminderList] = useState([])

    function refreshReminderList(accAddress) {
        return new Promise(async (resolve, reject) => {
            console.log('RUN refreshReminderList. ', accAddress)
            const api = await apiProvider()
            const reminderIdsOpt = await api.query.aresReminder.ownerList(accAddress)
            if(reminderIdsOpt.isSome){
                console.log('reminderIdsOpt.isSome')
                console.log('reminderIds = ', reminderIdsOpt.value.toHuman())
                const tmp_list = []
                for (const reminderId of reminderIdsOpt.value.toHuman()) {
                    console.log('reminderId = ', reminderId)
                    const reminderObj = await api.query.aresReminder.reminderList(reminderId)
                    console.log('reminderObj = ', reminderObj.value.toHuman())
                    tmp_list.push([reminderId, reminderObj.value.toHuman()])
                }
                setReminderList(tmp_list)
            }
        })
    }

    async function bindUserInfo() {
        console.log('bindEmail22 = ', accAddress, bindEmail)
        let bindInfos = await bindUser(accAddress, bindEmail)
        let res = null
        if(bindInfos){
            // res = await sendBindInfos('http://localhost:9988/bind_infos', bindInfos)
            res = await sendBindInfos(`${process.env.REACT_APP_ENV_REMINDER_SERVICE}/bind_infos`, bindInfos)
        }
        console.log('bindUserInfo result = ', res)
    }

    function removeReminder(rid) {
        return new Promise(async (resolve, reject) => {
            const injector = await web3FromAddress(accAddress)
            const api = await apiProvider()
            const res = await api.tx.aresReminder.removeReminder(rid)
                .signAndSend(accAddress, {signer: injector.signer})

            console.log('res --', res)
            const tmpReminderList = []
            reminderList.forEach(data => {
                if(data[0] != rid) {
                    tmpReminderList.push(data)
                }
            })
            setReminderList(tmpReminderList)
            resolve(res)
        })
    }

    function convertToPrice(priceParam, fractionLenParam) {
        let price = priceParam.replaceAll(',', '')
        let fractionLen = parseInt(fractionLenParam)
        return price / 10**fractionLen
    }

    function setSymbol(symbol) {
        console.log('symbol - ', symbol)
        setCurrentSymbol(symbol)
    }

    function sendBindInfos (postRequest, bindInfos) {
        console.log('sendBindInfos = ', postRequest, bindInfos)
        return new Promise(((resolve, reject) => {
            axios.post(postRequest, {
                pubKey: bindInfos[0],
                signature: bindInfos[1],
                email: bindInfos[2]
            }).then((response) => {
               resolve(response.data)
            }).catch(err=>{
                reject(err)
            })
        }))
    }

    function addReminder(symbol, newPrice, backSign, interval, repeatCount) {
        return new Promise(async (resolve, reject) => {
            const condition = {'TargetPriceModel': [symbol, [parseInt(newPrice * 1000000), 6]]}

            console.log('condition - ', condition)

            const receiver = {'HttpCallBack': [`${process.env.REACT_APP_ENV_REMINDER_SERVICE}/reminder/callback`, backSign]}
            // const interval = interval
            // const repeatCount = 2
            const tip = null
            const maxFee = balance(repeatCount)

            const injector = await web3FromAddress(accAddress)

            const api = await apiProvider()
            const res = await api.tx.aresReminder.addReminder(condition, receiver, interval, repeatCount, tip, maxFee)
                .signAndSend(accAddress, {signer: injector.signer})

            resolve(res)
        })

    }

    function balance(amountInt) {
        const decimalsPadded = ''.padEnd(12, '0')
        return new BN(amountInt.toString() + decimalsPadded)
    }

    async function apiProvider () {
        // const WS_ENDPOINT = 'ws://127.0.0.1:9944'
        // const WS_ENDPOINT = 'ws://167.179.96.132:9861'
        const WS_ENDPOINT = process.env.REACT_APP_ENV_WS_ENDPOINT

        console.log(`Polkadot : ${WS_ENDPOINT}`)
        // Initialise the provider to connect to the local node
        const provider = new WsProvider(WS_ENDPOINT)
        return await ApiPromise.create({ provider })
    }

    async function bindUser(acc, email) {
        // const api = await apiProvider()
        console.log('bindUser acc = ', acc)
        const injector = await web3FromAddress(acc);
        const signRaw = injector?.signer?.signRaw;
        if (!!signRaw) {
            const { signature } = await signRaw({
                address: acc,
                data: stringToHex(email),
                type: 'bytes'
            });
            return [u8aToHex(decodeAddress(acc)), signature, email]
        }
        return null
    }

    function addNewReminder() {
        if(!anchorPrice){
            alert('anchorPrice 不能为空')
            return
        }
        if(!reminderInterval){
            alert('reminderInterval 不能为空')
            return
        }
        if(!reminderRepeatCount){
            alert('reminderRepeatCount 不能为空')
            return
        }
        addReminder(
            currentSymbol,
            anchorPrice,
            'demo',
            reminderInterval,
            reminderRepeatCount,
        ).then(res=>{
            console.log('addNewReminder success = ', res)
        }).catch(err=>{
            console.log('addNewReminder failed = ', err)
        })
    }

    useEffect(  () => {

        const init = async () => {
            const extensions = await web3Enable('my cool dapp');
            if (extensions.length === 0) {
                console.log('no extension installed, or the user did not accept the authorization')
                return;
            }
            const allAccounts = await web3Accounts();
            console.log('allAccounts = ', allAccounts)
            setWeb3AccountList(allAccounts)
            if(allAccounts.length > 0){
                setAccAddress(allAccounts[0].address)
            }
            setCurrentSymbol(symbolList[0])
        }
        setTimeout(()=>{
            init()
        }, 500 )
    }, []);

    return (
        <div className="App">
            <header>
                <table>
                    <tr>
                        <td>Reminder service</td>
                        <td>{process.env.REACT_APP_ENV_REMINDER_SERVICE}</td>
                    </tr>
                    <tr>
                        <td>RPC service</td>
                        <td>{process.env.REACT_APP_ENV_WS_ENDPOINT}</td>
                    </tr>
                </table>
                <hr/>
                <table>
                    <tbody>
                    <tr>
                        <td colSpan='2'>用户注册</td>
                    </tr>
                    <tr>
                        <td>
                            <Identicon
                                value={accAddress}
                                size={32}
                                theme={'polkadot'}
                            />
                        </td>
                        <td>
                            <select onChange={e=>{
                                setAccAddress(e.target.value)
                            }}>
                                {web3AccountList.map(data => {
                                    return <option key={data.address} value={data.address}>{data.meta.name}[{data.address}]</option>
                                })}
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>Email:</td>
                        <td>
                            <input type='text' onChange={(e)=>setBindEmail(e.target.value)} value={bindEmail} />
                        </td>
                    </tr>
                    <tr>
                        <td><button onClick={()=>bindUserInfo()}>注册</button></td>
                    </tr>
                    </tbody>
                </table>
            </header>
            <hr/>
            <header>
                <table>
                    <tbody>
                    <tr>
                        <td colSpan='2'>添加价格提示</td>
                    </tr>
                    <tr>
                        <td>
                            选择Symbol：
                        </td>
                        <td>
                            <select onChange={e=>{
                                setSymbol(e.target.value)
                            }}>
                                {symbolList.map(data => {
                                    return <option key={data} value={data}>{data}</option>
                                })}
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>Anchor Price</td>
                        <td>
                            <input type={'text'} onChange={(e)=>setAnchorPrice(e.target.value)} />
                        </td>
                    </tr>
                    <tr>
                        <td>Reminder Interval</td>
                        <td>
                            <input type={'text'} onChange={(e)=>setReminderInterval(e.target.value)} />
                        </td>
                    </tr>
                    <tr>
                        <td>Reminder RepeatCount</td>
                        <td>
                            <input type={'text'} onChange={(e)=>setReminderRepeatCount(e.target.value)} />
                        </td>
                    </tr>
                    <tr>
                        <td><button onClick={()=>addNewReminder()}>添加价格提示</button></td>
                    </tr>
                    </tbody>
                </table>
                <hr/>
                <p>我的价格提示<button onClick={()=>refreshReminderList(accAddress)}>刷新</button></p>
                <table>
                    <tbody>
                    <tr>
                        <td>区块高度</td>
                        <td>剩余次数</td>
                        <td>触发间隔</td>
                        <td>触发条件</td>
                        <td>回调参数</td>
                        <td></td>
                    </tr>
                    {reminderList.map(data=> {
                        return <tr>
                            <td>{data[1].createBn}</td>
                            <td>{data[1].repeatCount}</td>
                            <td>{data[1].intervalBn}</td>
                            <td>
                                {data[1].triggerCondition.TargetPriceModel.priceKey}
                                [{convertToPrice(data[1].triggerCondition.TargetPriceModel.anchorPrice.number, data[1].triggerCondition.TargetPriceModel.anchorPrice.fractionLength)}]
                            </td>
                            <td>
                                {data[1].triggerReceiver.HttpCallBack.url}
                                [{data[1].triggerReceiver.HttpCallBack.sign}]
                            </td>
                            <td>
                                <button onClick={()=>removeReminder(data[0])}>删除</button>
                            </td>
                        </tr>
                    })}
                    </tbody>
                </table>
            </header>

        </div>
    );
}

export default App;
