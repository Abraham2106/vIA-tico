import type { ExceptionCase } from '../../../domain/exception/index.ts'
import type { Receipt } from '../../../domain/receipt/index.ts'
import { isExceptionRow } from '../../../domain/receipt/index.ts'
import type { CoreDeps } from '../../ports/outbound/workspace.ts'

export function createOpenException(deps: Pick<CoreDeps, 'ids' | 'clock' | 'exceptions'>) {
  return {
    async execute(receipt: Receipt): Promise<ExceptionCase | undefined> {
      if (!isExceptionRow(receipt)) return undefined
      const existing = await deps.exceptions.getByReceipt(receipt.id)
      if (existing) {
        const updated: ExceptionCase = {
          ...existing,
          verdict: receipt.verdict === 'PROCEDE' ? existing.verdict : receipt.verdict,
          rules: receipt.triggeredRules,
        }
        await deps.exceptions.save(updated)
        return updated
      }
      const opened: ExceptionCase = {
        id: deps.ids.next(),
        receiptId: receipt.id,
        tripId: receipt.tripId,
        verdict: receipt.verdict === 'NO_PROCEDE' ? 'NO_PROCEDE' : 'REVISION',
        rules: receipt.triggeredRules,
        openedAt: deps.clock.nowIso(),
        status: 'open',
      }
      await deps.exceptions.save(opened)
      return opened
    },
  }
}
