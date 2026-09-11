import {
  createMemoryDeps,
  createWorkspace,
  DEMO_TRAVELER,
  DEMO_TRIP,
  type Workspace,
} from '@viaticocero/core'
import { QvacVisionPsyAdapter } from '../../adapters/driven/qvac-visionpsy/index.ts'

let cached: Workspace | undefined

export function getMobileWorkspace(): Workspace {
  if (cached) return cached
  const deps = createMemoryDeps()
  deps.vision = new QvacVisionPsyAdapter()
  cached = createWorkspace(deps)
  return cached
}

export async function ensureDemoTrip(workspace: Workspace = getMobileWorkspace()) {
  const existing = await workspace.deps.trips.get(DEMO_TRIP.id)
  if (!existing) {
    await workspace.deps.travelers.save(DEMO_TRAVELER)
    await workspace.deps.trips.save(DEMO_TRIP)
  }
  return DEMO_TRIP
}
