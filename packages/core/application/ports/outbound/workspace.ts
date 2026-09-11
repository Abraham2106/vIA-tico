import type { IClock } from './clock.ts'
import type { IIdGenerator } from './ids.ts'
import type { ILanguageModel } from './language-model.ts'
import type { IQvacProvider } from './qvac-provider.ts'
import type { IReportExporter } from './exporter.ts'
import type {
  IExceptionRepository,
  IJobInbox,
  IPairingStore,
  IPolicyRepository,
  IReceiptRepository,
  ITravelerRepository,
  ITripRepository,
  IAuditLog,
} from './stores.ts'
import type { IVisionInference } from './vision.ts'

export type CoreDeps = {
  clock: IClock
  ids: IIdGenerator
  travelers: ITravelerRepository
  trips: ITripRepository
  receipts: IReceiptRepository
  policy: IPolicyRepository
  exceptions: IExceptionRepository
  jobs: IJobInbox
  pairing: IPairingStore
  auditLog: IAuditLog
  languageModel: ILanguageModel
  vision: IVisionInference
  exporter: IReportExporter
  qvacProvider: IQvacProvider
}
