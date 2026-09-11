import { settleTrip } from '../../../domain/services/settlement.ts'
import type { Settlement } from '../../../domain/settlement/index.ts'
import type { IReconcileAdvance } from '../../ports/inbound/index.ts'
import type { CoreDeps } from '../../ports/outbound/workspace.ts'

/**
 * Concilia el adelanto de un viaje con sus comprobantes y excepciones.
 * La aritmética vive en el servicio de dominio para que la liquidación
 * conserve una única fuente de verdad.
 */
export function createReconcileAdvance(
  deps: Pick<CoreDeps, 'trips' | 'receipts' | 'exceptions'>,
): IReconcileAdvance {
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
