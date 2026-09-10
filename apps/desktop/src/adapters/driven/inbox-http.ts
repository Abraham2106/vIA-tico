import type { AnalysisJob } from '@viaticocero/contracts'
import { parseAnalysisJob } from '@viaticocero/contracts'
import type { IJobTransport } from '@viaticocero/core'

/**
 * Transporte de producto (ADR 0008): el móvil POSTea el DTO.
 * No es startQVACProvider ni Hyperswarm.
 */
export class InMemoryJobTransport implements IJobTransport {
  constructor(private readonly ingest: (job: AnalysisJob) => Promise<void>) {}
  async send(job: AnalysisJob): Promise<void> {
    await this.ingest(parseAnalysisJob(job))
  }
}
