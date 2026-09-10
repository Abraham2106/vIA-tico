import type { EntityId } from '../shared/ids.ts'
import type { FiredRule } from '../shared/rules.ts'
import type { Verdict } from '../shared/verdict.ts'

export type ExceptionStatus = 'open' | 'resolved' | 'dismissed'

export type ExceptionResolution = {
  action: 'approve' | 'reject' | 'keep'
  note: string
  at: string
  by: string
}

export type ExceptionCase = {
  id: EntityId
  receiptId: EntityId
  tripId: EntityId
  verdict: Exclude<Verdict, 'PROCEDE'>
  rules: FiredRule[]
  openedAt: string
  status: ExceptionStatus
  resolution?: ExceptionResolution
}

export function isOpenException(item: ExceptionCase): boolean {
  return item.status === 'open'
}
