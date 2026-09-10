import type { AnalysisJob } from '@viaticocero/contracts'
import type { Receipt } from '../../../domain/receipt/index.ts'
import type { CoreDeps } from '../../ports/outbound/workspace.ts'
import { createAttachReceipt } from '../attach-receipt/index.ts'

export function createIngestVisionResult(deps: CoreDeps) {
  const attach = createAttachReceipt(deps)

  return {
    async execute(job: AnalysisJob): Promise<Receipt> {
      if (!job.tripId) {
        throw new Error('El job necesita tripId para ingresar al expediente')
      }
      const stored: AnalysisJob = { ...job, status: 'pending' }
      await deps.jobs.save(stored)
      try {
        const receipt = await attach.execute({
          tripId: job.tripId,
          extraction: job.visionResult,
          attachmentPath: job.attachmentPath,
          sourceJobId: job.id,
        })
        await deps.jobs.save({ ...stored, status: 'ingested' })
        return receipt
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        await deps.jobs.save({ ...stored, status: 'failed', error: message })
        throw error
      }
    },
  }
}
