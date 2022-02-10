import { Wallet } from "@acala-network/sdk"
import { ApiPromise } from "@polkadot/api"

function getWalletFC () {
  const wallet = new Wallet(api as ApiPromise)

  return async () => {
    await wallet.isReady

    return wallet
  }
}

const getWallet = getWalletFC()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getTokenName (token: any) {
  const wallet = await getWallet()

  return wallet.getToken(token).then((i) => i.symbol)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getTokenDecimals (token: any) {
  const wallet = await getWallet()

  return wallet.getToken(token).then((i) => i.decimals)
}

export const nativeToken = api.registry.chainTokens[0]
