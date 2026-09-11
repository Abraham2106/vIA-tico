import type { Settlement } from '../../../domain/settlement/index.ts'
import type { CoreDeps } from '../../ports/outbound/workspace.ts'
import { createReconcileAdvance } from '../reconcile-advance/index.ts'

export function createSettleTrip(deps: Pick<CoreDeps, 'trips' | 'receipts' | 'exceptions'>) {
  const reconcileAdvance = createReconcileAdvance(deps)
  return {
    execute(tripId: string): Promise<Settlement> {
      return reconcileAdvance.execute(tripId)
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
