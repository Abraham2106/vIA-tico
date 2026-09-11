import { createWorkspace, type Workspace } from '../application/workspace.ts'
import type { CoreDeps } from '../application/ports/outbound/workspace.ts'
import { createMemoryRepositories, createEmptyMemoryState } from './memory-store.ts'
import {
  JsonReportExporter,
  SystemClock,
  UnwiredLanguageModel,
  UnwiredQvacProvider,
  UnwiredVision,
  UuidGenerator,
} from './stubs.ts'
import { DEMO_EXTRACTIONS, DEMO_TRAVELER, DEMO_TRIP } from './demo-fixtures.ts'

export function createMemoryDeps(now = '2026-09-14T18:00:00.000Z'): CoreDeps & {
  memory: ReturnType<typeof createMemoryRepositories>
} {
  const memory = createMemoryRepositories(createEmptyMemoryState(now))
  return {
    clock: new SystemClock(),
    ids: new UuidGenerator(),
    travelers: memory.travelers,
    trips: memory.trips,
    receipts: memory.receipts,
    policy: memory.policy,
    exceptions: memory.exceptions,
    jobs: memory.jobs,
    pairing: memory.pairing,
    auditLog: memory.auditLog,
    languageModel: new UnwiredLanguageModel(),
    vision: new UnwiredVision(),
    exporter: new JsonReportExporter(),
    qvacProvider: new UnwiredQvacProvider(),
    memory,
  }
}

export async function seedDemoWorkspace(workspace?: Workspace): Promise<Workspace> {
  const app = workspace ?? createWorkspace(createMemoryDeps())
  await app.deps.travelers.save(DEMO_TRAVELER)
  await app.deps.trips.save(DEMO_TRIP)
  for (const extraction of DEMO_EXTRACTIONS) {
    await app.attachReceipt({ tripId: DEMO_TRIP.id, extraction })
  }
  return app
}
