import { settleTrip } from '../../../domain/services/settlement.ts'
import type { Settlement } from '../../../domain/settlement/index.ts'
import type { CoreDeps } from '../../ports/outbound/workspace.ts'

export function createSettleTrip(deps: Pick<CoreDeps, 'trips' | 'receipts' | 'exceptions'>) {
  return {
    async execute(tripId: string): Promise<Settlement> {
      const trip = await deps.trips.get(tripId)
      if (!trip) throw new Error(`Viaje ${tripId} no existe`)
      const [receipts, exceptions] = await Promise.all([
        deps.receipts.listByTrip(tripId),
        deps.exceptions.listByTrip(tripId),
      ])
      return settleTrip(trip, receipts, exceptions)
    },
  }
}

export function createCloseTrip(deps: Pick<CoreDeps, 'trips' | 'receipts' | 'exceptions'>) {
  const settle = createSettleTrip(deps)
  return {
    async execute(tripId: string): Promise<Settlement> {
      const settlement = await settle.execute(tripId)
      if (settlement.openExceptionCount > 0) {
        throw new Error('No se puede cerrar el viaje con excepciones abiertas')
      }
      const trip = await deps.trips.get(tripId)
      if (!trip) throw new Error(`Viaje ${tripId} no existe`)
      await deps.trips.save({ ...trip, status: 'settled' })
      return settlement
    },
  }
}
