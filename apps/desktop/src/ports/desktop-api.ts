import type {
  AnalysisJob,
  ExportArtifact,
  ExportFormat,
  PairingPayload,
  Policy,
  RegisterTripInput,
  ResolveExceptionInput,
  Settlement,
  WorkspaceSnapshot,
} from '@viaticocero/core'
import type { AttachReceiptInput } from '@viaticocero/core'

export type QvacLlmProgress = {
  phase: 'idle' | 'loading' | 'ready' | 'inferring' | 'unloading' | 'error'
  message: string
  percent?: number
  catalogId: string
  modelId?: string
  error?: string
  status?: string
}

export type QvacDesktopStatus = {
  llm: string
  provider: string
  vision: string
  progress?: QvacLlmProgress
}

export type StorageInfo = {
  engine: 'sqlite3'
  location: 'file' | 'indexeddb' | 'memory'
  driver: 'node:sqlite' | 'sql.js'
  path?: string
}

/** Renderer-facing port exposed by preload; it contains no adapter details. */
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
  storageInfo(): Promise<StorageInfo>
  qvacStatus(): Promise<QvacDesktopStatus>
  loadQwen(): Promise<QvacDesktopStatus>
  unloadQwen(): Promise<QvacDesktopStatus>
  onQvacProgress?: (listener: (progress: QvacLlmProgress) => void) => () => void
}
