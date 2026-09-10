import type { EntityId } from '../shared/ids.ts'

export type Traveler = {
  id: EntityId
  name: string
  email?: string
}

export function createTraveler(input: Traveler): Traveler {
  const name = input.name.trim()
  if (!name) throw new Error('El viajero necesita nombre')
  return { id: input.id, name, email: input.email?.trim() || undefined }
}
