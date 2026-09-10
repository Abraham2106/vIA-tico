import { audit } from '../../domain/shared/audit.ts'
import type { ExceptionCase } from '../../domain/exception/index.ts'
import type { ResolveExceptionInput } from '../ports/inbound/index.ts'
import type { CoreDeps } from '../ports/outbound/workspace.ts'

export function createResolveException(deps: Pick<CoreDeps, 'clock' | 'exceptions' | 'receipts'>) {
  return {
    async execute(input: ResolveExceptionInput): Promise<ExceptionCase> {
      const item = await deps.exceptions.get(input.exceptionId)
      if (!item) throw new Error(`Excepción ${input.exceptionId} no existe`)
      const receipt = await deps.receipts.get(item.receiptId)
      if (!receipt) throw new Error(`Comprobante ${item.receiptId} no existe`)

      const now = deps.clock.nowIso()
      if (input.action === 'keep') {
        const kept: ExceptionCase = {
          ...item,
          status: 'open',
          resolution: { action: 'keep', note: input.note, at: now, by: input.by },
        }
        await deps.exceptions.save(kept)
        return kept
      }

      const verdict = input.action === 'approve' ? 'PROCEDE' : 'NO_PROCEDE'
      await deps.receipts.save({
        ...receipt,
        humanDecision: {
          verdict,
          note: input.note,
          decidedAt: now,
          decidedBy: input.by,
        },
        audit: [...receipt.audit, audit(now, 'human', input.action, input.note)],
      })

      const resolved: ExceptionCase = {
        ...item,
        status: 'resolved',
        resolution: { action: input.action, note: input.note, at: now, by: input.by },
      }
      await deps.exceptions.save(resolved)
      return resolved
    },
  }
}
