import { money } from '../../../domain/shared/money.ts'
import { createTrip, type Trip } from '../../../domain/trip/index.ts'
import type { RegisterTripInput } from '../../ports/inbound/index.ts'
import type { CoreDeps } from '../../ports/outbound/workspace.ts'

export function createRegisterTrip(deps: Pick<CoreDeps, 'clock' | 'ids' | 'trips' | 'travelers' | 'policy'>) {
  return {
    async execute(input: RegisterTripInput): Promise<Trip> {
      const traveler = await deps.travelers.get(input.travelerId)
      if (!traveler) throw new Error(`Viajero ${input.travelerId} no existe`)
      const policy = await deps.policy.getActive()
      const trip = createTrip({
        id: deps.ids.next(),
        travelerId: traveler.id,
        destination: input.destination,
        purpose: input.purpose,
        startDate: input.startDate,
        endDate: input.endDate,
        advance: money(input.advanceAmount, input.currency ?? policy.currency),
        createdAt: deps.clock.nowIso(),
      })
      await deps.trips.save(trip)
      return trip
    },
  }
}
