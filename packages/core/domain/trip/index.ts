import type { EntityId } from '../shared/ids.ts'
import type { Money } from '../shared/money.ts'
import { assertDateOnly } from '../shared/dates.ts'

export type TripStatus = 'open' | 'settled'

export type Trip = {
  id: EntityId
  travelerId: EntityId
  destination: string
  purpose?: string
  startDate: string
  endDate: string
  advance: Money
  status: TripStatus
  createdAt: string
}

export function createTrip(input: Omit<Trip, 'status'> & { status?: TripStatus }): Trip {
  const destination = input.destination.trim()
  if (!destination) throw new Error('El viaje necesita destino')
  assertDateOnly(input.startDate, 'startDate')
  assertDateOnly(input.endDate, 'endDate')
  if (input.startDate > input.endDate) {
    throw new Error('La fecha de inicio no puede ser posterior al fin')
  }
  if (input.advance.amount < 0) {
    throw new Error('El adelanto no puede ser negativo')
  }
  return {
    id: input.id,
    travelerId: input.travelerId,
    destination,
    purpose: input.purpose?.trim() || undefined,
    startDate: input.startDate,
    endDate: input.endDate,
    advance: input.advance,
    status: input.status ?? 'open',
    createdAt: input.createdAt,
  }
}
