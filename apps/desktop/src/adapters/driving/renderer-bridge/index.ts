import type {
  AnalysisJob,
  ExportArtifact,
  ExportFormat,
  PairingPayload,
  WorkspaceSnapshot,
} from '@viaticocero/core'
import type { AttachReceiptInput, RegisterTripInput, ResolveExceptionInput } from '@viaticocero/core'
import type { Policy, Settlement } from '@viaticocero/core'
import type { Workspace } from '@viaticocero/core'

export type DesktopApi = {
  snapshot(): Promise<WorkspaceSnapshot>
  registerTrip(input: RegisterTripInput): Promise<unknown>
  attachReceipt(input: AttachReceiptInput): Promise<unknown>
  ingestJob(job: AnalysisJob): Promise<unknown>
  resolveException(input: ResolveExceptionInput): Promise<unknown>
  settleTrip(tripId: string): Promise<Settlement>
  closeTrip(tripId: string): Promise<Settlement>
  exportReport(input: { tripId: string; format: ExportFormat; includeRaw?: boolean }): Promise<ExportArtifact>
  updatePolicy(patch: Partial<Policy>): Promise<Policy>
  pairing(): Promise<PairingPayload>
  rotatePairing(): Promise<PairingPayload>
  qvacStatus(): Promise<{ llm: string; provider: string; vision: string }>
}

export function workspaceToApi(workspace: Workspace): DesktopApi {
  return {
    snapshot: () => workspace.snapshot(),
    registerTrip: (input) => workspace.registerTrip(input),
    attachReceipt: (input) => workspace.attachReceipt(input),
    ingestJob: (job) => workspace.ingestVisionResult(job),
    resolveException: (input) => workspace.resolveException(input),
    settleTrip: (tripId) => workspace.settleTrip(tripId),
    closeTrip: (tripId) => workspace.closeTrip(tripId),
    exportReport: (input) => workspace.exportReport(input),
    updatePolicy: (patch) => workspace.updatePolicy(patch),
    pairing: () => workspace.pairDevices.getPayload(),
    rotatePairing: () => workspace.pairDevices.rotate(),
    async qvacStatus() {
      return {
        llm: workspace.deps.languageModel.status(),
        provider: workspace.deps.qvacProvider.status(),
        vision: workspace.deps.vision.status(),
      }
    },
  }
}

declare global {
  interface Window {
    viatico?: DesktopApi
  }
}
