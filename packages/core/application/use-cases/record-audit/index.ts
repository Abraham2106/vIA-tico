import type { AuditEvent } from '@viaticocero/contracts'
import type { AuditEntry } from '../../../domain/shared/audit.ts'
import type { CoreDeps } from '../../ports/outbound/workspace.ts'

export function createRecordAudit(deps: Pick<CoreDeps, 'auditLog' | 'ids'>) {
  return {
    async write(
      entry: AuditEntry & {
        receiptId?: string
        tripId?: string
        exceptionId?: string
      },
    ): Promise<AuditEvent> {
      const event: AuditEvent = {
        id: deps.ids.next(),
        at: entry.at,
        actor: entry.actor,
        action: entry.action,
        detail: entry.detail,
        receiptId: entry.receiptId,
        tripId: entry.tripId,
        exceptionId: entry.exceptionId,
      }
      await deps.auditLog.append(event)
      return event
    },
    async writeMany(
      entries: AuditEntry[],
      ctx: { receiptId?: string; tripId?: string; exceptionId?: string },
    ): Promise<void> {
      for (const entry of entries) {
        await this.write({ ...entry, ...ctx })
      }
    },
  }
}
