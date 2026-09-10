import type { CurrencyCode } from '@viaticocero/contracts'
import type { EntityId } from '../shared/ids.ts'
import type { Money } from '../shared/money.ts'

export type Settlement = {
  tripId: EntityId
  currency: CurrencyCode
  advance: Money
  backedTotal: Money
  approvedTotal: Money
  pendingReviewTotal: Money
  rejectedTotal: Money
  toReimburse: Money
  toReturn: Money
  receiptCount: number
  procedeCount: number
  revisionCount: number
  noProcedeCount: number
  openExceptionCount: number
}
