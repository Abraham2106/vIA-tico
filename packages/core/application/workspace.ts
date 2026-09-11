import type { AnalysisJob, ExportFormat, VisionResult } from '@viaticocero/contracts'
import type { Policy } from '../domain/policy/index.ts'
import type {
  AttachReceiptInput,
  RegisterTripInput,
  ResolveExceptionInput,
  WorkspaceSnapshot,
} from './ports/inbound/index.ts'
import type { CoreDeps } from './ports/outbound/workspace.ts'
import { createAnalyzeReceipt } from './use-cases/analyze-receipt/index.ts'
import { createAnalyzeWithLlm } from './use-cases/analyze-with-llm/index.ts'
import { createAttachReceipt } from './use-cases/attach-receipt/index.ts'
import { createClassifyMotive } from './use-cases/classify-motive/index.ts'
import { createExportReport } from './use-cases/export-report/index.ts'
import { createIngestVisionResult } from './use-cases/ingest-vision-result/index.ts'
import { createPairDevices } from './use-cases/pair-devices/index.ts'
import { createRecordAudit } from './use-cases/record-audit/index.ts'
import { createRegisterTrip } from './use-cases/register-trip/index.ts'
import { createResolveException } from './use-cases/resolve-exception.ts'
import { createCloseTrip, createSettleTrip } from './use-cases/settle-trip/index.ts'
import { createTraveler } from '../domain/traveler/index.ts'
import { audit } from '../domain/shared/audit.ts'

export function createWorkspace(deps: CoreDeps) {
  const recordAudit = createRecordAudit(deps)
  const registerTrip = createRegisterTrip(deps)
  const attachReceipt = createAttachReceipt(deps)
  const ingestVisionResult = createIngestVisionResult(deps)
  const settleTrip = createSettleTrip(deps)
  const closeTrip = createCloseTrip(deps)
  const exportReport = createExportReport(deps)
  const pairDevices = createPairDevices(deps)
  const resolveException = createResolveException(deps)
  const analyzeReceipt = createAnalyzeReceipt(deps.vision)
  const analyzeWithLlm = createAnalyzeWithLlm(deps.languageModel)
  const classifyMotive = createClassifyMotive(deps.languageModel)

  return {
    deps,
    async registerTrip(input: RegisterTripInput) {
      const trip = await registerTrip.execute(input)
      await recordAudit.write({
        at: trip.createdAt,
        actor: 'system',
        action: 'register-trip',
        detail: trip.destination,
        tripId: trip.id,
      })
      return trip
    },
    attachReceipt: (input: AttachReceiptInput) => attachReceipt.execute(input),
    ingestVisionResult: (job: AnalysisJob) => ingestVisionResult.execute(job),
    settleTrip: (tripId: string) => settleTrip.execute(tripId),
    async closeTrip(tripId: string) {
      const result = await closeTrip.execute(tripId)
      await recordAudit.write({
        at: deps.clock.nowIso(),
        actor: 'human',
        action: 'close-trip',
        tripId,
      })
      return result
    },
    exportReport: (input: { tripId: string; format: ExportFormat; includeRaw?: boolean }) =>
      exportReport.execute(input),
    pairDevices,
    resolveException: (input: ResolveExceptionInput) => resolveException.execute(input),
    analyzeReceipt: (input: { imagePath: string; profile?: 'base' | 'flash' }) =>
      analyzeReceipt.execute(input),
    analyzeWithLlm: (extraction: VisionResult) => analyzeWithLlm.execute(extraction),
    classifyMotive: (input: { motivo?: string; extraction?: VisionResult }) =>
      classifyMotive.execute(input),
    async registerTraveler(input: { id?: string; name: string; email?: string }) {
      const traveler = createTraveler({
        id: input.id ?? deps.ids.next(),
        name: input.name,
        email: input.email,
      })
      await deps.travelers.save(traveler)
      return traveler
    },
    async updatePolicy(patch: Partial<Policy>) {
      const current = await deps.policy.getActive()
      const next = { ...current, ...patch }
      await deps.policy.save(next)
      await recordAudit.write({
        ...audit(deps.clock.nowIso(), 'human', 'update-policy', Object.keys(patch).join(',')),
      })
      return next
    },
    async snapshot(): Promise<WorkspaceSnapshot> {
      const [travelers, trips, receipts, exceptions, jobs, policy, pairing, devices, auditEvents] =
        await Promise.all([
          deps.travelers.list(),
          deps.trips.list(),
          deps.receipts.listAll(),
          deps.exceptions.listAll(),
          deps.jobs.list(),
          deps.policy.getActive(),
          deps.pairing.getPayload(),
          deps.pairing.listDevices(),
          deps.auditLog.list(),
        ])
      return { travelers, trips, receipts, exceptions, jobs, policy, pairing, devices, auditEvents }
    },
  }
}

export type Workspace = ReturnType<typeof createWorkspace>
