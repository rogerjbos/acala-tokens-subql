import { getDateStartOfDay, getDateStartOfHour } from '../utils/date'
import { AccountBalance, DailyAccountBalance, HourAccountBalance } from '../types/models'
import { getAccount, getAccountBalance, getDailyAccountBalance, getHourAccountBalance } from './records'
import { isTokenEqual, nativeToken } from './tokens'

export function updateAccountBalanceHistoryRecord(source: AccountBalance, target: HourAccountBalance | DailyAccountBalance) {
    target.total = source.total
    target.free = source.free
    target.reserved = source.reserved
    target.frozen = source.frozen
}

/**
 * @name updateAccountBalance
 * @param address
 * @param tokenName
 * @param freeChanged
 * @param reservedChanged
 * @param frozenChanged
 * @param timestamp
 * @param blockNumber
 */
export async function updateAccountBalance(address: string, tokenName: string, freeChanged: bigint, reservedChanged: bigint, frozenChanged: bigint, timestamp: Date, blockNumber: bigint) {
    const account = await getAccount(address)
    const accountBalance = await getAccountBalance(address, tokenName, blockNumber)

    const hourDate = getDateStartOfHour(timestamp).toDate()
    const dayDate = getDateStartOfDay(timestamp).toDate()
    const hourAccountBalance = await getHourAccountBalance(address, tokenName, hourDate)
    const dailyAccountBalance = await getDailyAccountBalance(address, tokenName, dayDate)

    // ignore update when the account balance is initizlied and initAt is equal to blocknumber
    if (isTokenEqual(tokenName, nativeToken) && accountBalance.initAt && accountBalance.initAt === blockNumber) {
        // pass
    } else {
        // if free is changed, the total balance will change
        accountBalance.total = accountBalance.total + freeChanged + frozenChanged
        accountBalance.free = accountBalance.free + freeChanged
        accountBalance.reserved = accountBalance.reserved + reservedChanged
        accountBalance.frozen = accountBalance.frozen + frozenChanged
    }

    updateAccountBalanceHistoryRecord(accountBalance, hourAccountBalance)
    updateAccountBalanceHistoryRecord(accountBalance, dailyAccountBalance)

    await account.save()
    await accountBalance.save()
    await hourAccountBalance.save()
    await dailyAccountBalance.save()
}
