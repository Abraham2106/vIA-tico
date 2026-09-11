import {
  createMemoryRepositories,
  createWorkspace,
  seedDemoWorkspace,
  SystemClock,
  UnwiredVision,
  UuidGenerator,
  type ILanguageModel,
  type Workspace,
} from '@viaticocero/core'
import { DesktopReportExporter } from '../adapters/driven/exporters/index.ts'
import { QvacProviderStub } from '../adapters/driven/qvac-provider/index.ts'
import { loadPersistedState, persistState } from '../adapters/driven/persistence/index.ts'

export async function createDesktopWorkspace(languageModel: ILanguageModel): Promise<Workspace> {
  const now = new Date().toISOString()
  const stored = loadPersistedState(now)
  const hasData = stored.trips.size > 0
  const memory = createMemoryRepositories(stored)
  const workspace = createWorkspace({
    clock: new SystemClock(),
    ids: new UuidGenerator(),
    travelers: memory.travelers,
    trips: memory.trips,
    receipts: memory.receipts,
    policy: memory.policy,
    exceptions: memory.exceptions,
    jobs: memory.jobs,
    pairing: memory.pairing,
    languageModel,
    vision: new UnwiredVision(),
    exporter: new DesktopReportExporter(),
    qvacProvider: new QvacProviderStub(),
  })

  if (!hasData) {
    await seedDemoWorkspace(workspace)
  }

  wrapPersistence(workspace, () => persistState(memory.state))
  return workspace
}

function wrapPersistence(workspace: Workspace, persist: () => void): void {
  const original = {
    attach: workspace.attachReceipt,
    ingest: workspace.ingestVisionResult,
    resolve: workspace.resolveException,
    registerTrip: workspace.registerTrip,
    registerTraveler: workspace.registerTraveler,
    updatePolicy: workspace.updatePolicy,
    closeTrip: workspace.closeTrip,
  }
  workspace.attachReceipt = async (input) => {
    const result = await original.attach(input)
    persist()
    return result
  }
  workspace.ingestVisionResult = async (job) => {
    const result = await original.ingest(job)
    persist()
    return result
  }
  workspace.resolveException = async (input) => {
    const result = await original.resolve(input)
    persist()
    return result
  }
  workspace.registerTrip = async (input) => {
    const result = await original.registerTrip(input)
    persist()
    return result
  }
  workspace.registerTraveler = async (input) => {
    const result = await original.registerTraveler(input)
    persist()
    return result
  }
  workspace.updatePolicy = async (patch) => {
    const result = await original.updatePolicy(patch)
    persist()
    return result
  }
  workspace.closeTrip = async (tripId) => {
    const result = await original.closeTrip(tripId)
    persist()
    return result
  }
  persist()
}
