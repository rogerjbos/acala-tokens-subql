import { forceToCurrencyName, getCurrencyObject as getCurrencyObjectFromSDK, getLiquidCrowdloanIdFromName, isForeignAssetName, isLiquidCrowdloanName } from "@acala-network/sdk-core"
import { zip } from 'lodash'

export const nativeToken = api.registry.chainTokens[0]

let tokensDecimalsMap = Object.fromEntries(zip(api.registry.chainTokens, api.registry.chainDecimals));

let IS_LIQUID_CROADLOAN= false;

// inert LiquidCrowdloanCurrencyId tokens decimal
if (tokensDecimalsMap['DOT']) {
  tokensDecimalsMap['lc://13'] = tokensDecimalsMap['DOT'];
}

export const getCurrencyObject = (token: any) => {
  const name = forceToCurrencyName(token);

  if (isLiquidCrowdloanName(name) && IS_LIQUID_CROADLOAN) {
    return {
      LiquidCroadloan: getLiquidCrowdloanIdFromName(name)
    };
  }

  return getCurrencyObjectFromSDK(token);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getTokenName (token: any) {
  if (typeof token === 'object' && Reflect.has(token, 'asLiquidCroadloan')) {
    IS_LIQUID_CROADLOAN = true;
  }

  return forceToCurrencyName(token);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getTokenDecimals (token: any) {
  const name = forceToCurrencyName(token);

  if (isForeignAssetName(name) && !tokensDecimalsMap[name]) {
    const metadata = (await api.query.assetRegistry.assetMetadatas(getCurrencyObject(name))) as any;

    tokensDecimalsMap[name] = Number(metadata.unwrapOrDefault().decimals.toString());
  }

  return tokensDecimalsMap[name] ?? 12;
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isTokenEqual = (token1: any, token2: any) => forceToCurrencyName(token1) === forceToCurrencyName(token2);
