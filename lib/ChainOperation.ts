import {ApiPromise, WsProvider} from "@polkadot/api";


export async function apiProvider (): Promise<ApiPromise> {
  const WS_ENDPOINT = process.env.REMINDER_ENDPOINT || 'ws://127.0.0.1:9944'
  console.log(`Polkadot : ${WS_ENDPOINT}`)
  // Initialise the provider to connect to the local node
  const provider = new WsProvider(WS_ENDPOINT)
  return await ApiPromise.create({ provider })
}
