import {
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
import {
  applySchema,
  createSqliteRepositories,
  migrateLegacyLocalStorage,
  tripCount,
} from '../adapters/driven/persistence/index.ts'
import type { OpenedSqlite } from '../adapters/driven/persistence/open.ts'
import type { StorageInfo } from '../adapters/driven/persistence/session.ts'

export type DesktopRuntime = {
  workspace: Workspace
  storageInfo: StorageInfo
}

export async function assembleDesktopWorkspace(
  languageModel: ILanguageModel,
  opened: OpenedSqlite,
  options: { skipDemoSeed?: boolean } = {},
): Promise<DesktopRuntime> {
  const now = new Date().toISOString()
  applySchema(opened.session, now)
  const repos = createSqliteRepositories(opened.session)
  await migrateLegacyLocalStorage(opened.session, repos)

  const workspace = createWorkspace({
    clock: new SystemClock(),
    ids: new UuidGenerator(),
    travelers: repos.travelers,
    trips: repos.trips,
    receipts: repos.receipts,
    policy: repos.policy,
    exceptions: repos.exceptions,
    jobs: repos.jobs,
    pairing: repos.pairing,
    languageModel,
    vision: new UnwiredVision(),
    exporter: new DesktopReportExporter(),
    qvacProvider: new QvacProviderStub(),
  })

  if (!options.skipDemoSeed && tripCount(opened.session) === 0) {
    await seedDemoWorkspace(workspace)
  }

  return { workspace, storageInfo: opened.info }
}
