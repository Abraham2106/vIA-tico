import type {
  AnalysisJob,
  AuditEvent,
  ExportArtifact,
  ExportFormat,
  MotiveClassification,
  PairingPayload,
  PairedDevice,
  VisionResult,
} from '@viaticocero/contracts'
import type { ExceptionCase, ExceptionResolution } from '../../../domain/exception/index.ts'
import type { Policy } from '../../../domain/policy/index.ts'
import type { Receipt } from '../../../domain/receipt/index.ts'
import type { Settlement } from '../../../domain/settlement/index.ts'
import type { Traveler } from '../../../domain/traveler/index.ts'
import type { Trip } from '../../../domain/trip/index.ts'

export type RegisterTripInput = {
  travelerId: string
  destination: string
  purpose?: string
  startDate: string
  endDate: string
  advanceAmount: number
  currency?: Trip['advance']['currency']
}

export type AttachReceiptInput = {
  tripId: string
  extraction: VisionResult
  attachmentPath?: string
  sourceJobId?: string
}

export type ResolveExceptionInput = {
  exceptionId: string
  action: ExceptionResolution['action']
  note: string
  by: string
}

export interface IRegisterTrip {
  execute(input: RegisterTripInput): Promise<Trip>
}

export interface IAttachReceipt {
  execute(input: AttachReceiptInput): Promise<Receipt>
}

export interface IAnalyzeReceipt {
  execute(input: { imagePath: string; profile?: 'base' | 'flash' }): Promise<VisionResult>
}

export interface IIngestVisionResult {
  execute(job: AnalysisJob): Promise<Receipt>
}

export interface IAnalyzeWithLlm {
  execute(extraction: VisionResult): Promise<{ used: VisionResult; discarded: boolean; refined?: VisionResult }>
}

export interface IClassifyMotive {
  execute(input: {
    motivo?: string
    extraction?: Pick<VisionResult, 'proveedor' | 'tipo_documento' | 'raw_text'>
  }): Promise<{
    classification?: MotiveClassification
    skipped: boolean
    extraRules: import('../../../domain/shared/rules.ts').FiredRule[]
  }>
}

export interface IValidateExtraction {
  execute(input: unknown): { ok: true; value: VisionResult } | { ok: false; message: string }
}

export interface IValidatePolicy {
  execute(input: { trip: Trip; extraction: VisionResult; siblings: Receipt[] }): import('../../../domain/shared/rules.ts').FiredRule[]
}

export interface IDetectDuplicates {
  execute(input: { candidate: VisionResult; siblings: Receipt[]; excludeId?: string }): Receipt | undefined
}

export interface IOpenException {
  execute(receipt: Receipt): Promise<ExceptionCase | undefined>
}

export interface ISettleTrip {
  execute(tripId: string): Promise<Settlement>
}

export interface IReconcileAdvance {
  execute(tripId: string): Promise<Settlement>
}

export interface IDeclareMotive {
  execute(input: { extraction: VisionResult; motivo?: string }): VisionResult
}

export interface IExportReport {
  execute(input: { tripId: string; format: ExportFormat; includeRaw?: boolean }): Promise<ExportArtifact>
}

export interface IPairDevices {
  getPayload(): Promise<PairingPayload>
  list(): Promise<PairedDevice[]>
  register(device: PairedDevice): Promise<void>
  rotate(): Promise<PairingPayload>
}

export type WorkspaceSnapshot = {
  travelers: Traveler[]
  trips: Trip[]
  receipts: Receipt[]
  exceptions: ExceptionCase[]
  jobs: AnalysisJob[]
  policy: Policy
  pairing: PairingPayload
  devices: PairedDevice[]
  auditEvents: AuditEvent[]
}
