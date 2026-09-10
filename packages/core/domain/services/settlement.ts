import type { CurrencyCode } from '@viaticocero/contracts'
import type { ExceptionCase } from '../exception/index.ts'
import { isOpenException } from '../exception/index.ts'
import { effectiveVerdict, type Receipt } from '../receipt/index.ts'
import type { Settlement } from '../settlement/index.ts'
import type { Trip } from '../trip/index.ts'
import { money, roundMoney } from '../shared/money.ts'

export function settleTrip(trip: Trip, receipts: Receipt[], exceptions: ExceptionCase[]): Settlement {
  const currency: CurrencyCode = trip.advance.currency
  let backed = 0
  let approved = 0
  let pending = 0
  let rejected = 0
  let procedeCount = 0
  let revisionCount = 0
  let noProcedeCount = 0

  for (const receipt of receipts) {
    const amount = receipt.usedExtraction.monto
    backed += amount
    const verdict = effectiveVerdict(receipt)
    if (verdict === 'PROCEDE') {
      approved += amount
      procedeCount += 1
    } else if (verdict === 'REVISION') {
      pending += amount
      revisionCount += 1
    } else {
      rejected += amount
      noProcedeCount += 1
    }
  }

  const toReimburse = Math.max(0, approved - trip.advance.amount)
  const toReturn = Math.max(0, trip.advance.amount - approved)

  return {
    tripId: trip.id,
    currency,
    advance: trip.advance,
    backedTotal: money(roundMoney(backed), currency),
    approvedTotal: money(roundMoney(approved), currency),
    pendingReviewTotal: money(roundMoney(pending), currency),
    rejectedTotal: money(roundMoney(rejected), currency),
    toReimburse: money(roundMoney(toReimburse), currency),
    toReturn: money(roundMoney(toReturn), currency),
    receiptCount: receipts.length,
    procedeCount,
    revisionCount,
    noProcedeCount,
    openExceptionCount: exceptions.filter(isOpenException).length,
  }
}
