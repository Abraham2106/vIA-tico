import type { AnalysisJob } from '@viaticocero/contracts'

export interface IJobTransport {
  send(job: AnalysisJob): Promise<void>
  receive?(onJob: (job: AnalysisJob) => Promise<void>): Promise<void>
}
