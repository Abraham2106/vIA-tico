import type { ExportArtifact, ExportFormat } from '@viaticocero/contracts'
import type { CoreDeps } from '../../ports/outbound/workspace.ts'
import { createSettleTrip } from '../settle-trip/index.ts'

export function createExportReport(deps: CoreDeps) {
  const settle = createSettleTrip(deps)
  return {
    async execute(input: {
      tripId: string
      format: ExportFormat
      includeRaw?: boolean
    }): Promise<ExportArtifact> {
      const trip = await deps.trips.get(input.tripId)
      if (!trip) throw new Error(`Viaje ${input.tripId} no existe`)
      const traveler = await deps.travelers.get(trip.travelerId)
      if (!traveler) throw new Error(`Viajero ${trip.travelerId} no existe`)
      const receipts = await deps.receipts.listByTrip(trip.id)
      const settlement = await settle.execute(trip.id)
      return deps.exporter.export(input.format, {
        trip,
        traveler,
        receipts,
        settlement,
        includeRaw: input.includeRaw,
      })
    },
  }
}
