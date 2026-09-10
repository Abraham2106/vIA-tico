import type { ExportArtifact, ExportFormat } from '@viaticocero/contracts'
import type { Settlement } from '../../../domain/settlement/index.ts'
import type { Receipt } from '../../../domain/receipt/index.ts'
import type { Trip } from '../../../domain/trip/index.ts'
import type { Traveler } from '../../../domain/traveler/index.ts'

export type ExportPayload = {
  trip: Trip
  traveler: Traveler
  receipts: Receipt[]
  settlement: Settlement
  includeRaw?: boolean
}

export interface IReportExporter {
  export(format: ExportFormat, payload: ExportPayload): Promise<ExportArtifact>
}
