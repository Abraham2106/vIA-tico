import { join } from 'node:path'
import { app } from 'electron'
import { fileURLToPath } from 'node:url'
import {
  createSdkCompletionRuntime,
  QvacLanguageModel,
} from '../../adapters/driven/qvac-llm/index.ts'
import { openNodeSqlite } from '../../adapters/driven/persistence/open-node.ts'
import { assembleDesktopWorkspace, type DesktopRuntime } from '../assemble-workspace.ts'
import { resolveQvacConfigPath } from '../qvac-config-path.ts'

export function applyElectronQvacConfigPath(env: NodeJS.ProcessEnv = process.env): string {
  const unpackagedPath = fileURLToPath(
    new URL('../../../config/qvac/qvac.config.json', import.meta.url),
  )
  env.QVAC_CONFIG_PATH = resolveQvacConfigPath({
    packaged: app.isPackaged,
    resourcesPath: process.resourcesPath,
    unpackagedPath,
    override: env.QVAC_CONFIG_PATH,
  })
  return env.QVAC_CONFIG_PATH
}

export function defaultSqlitePath(): string {
  return process.env.VIATICOCERO_SQLITE ?? join(app.getPath('userData'), 'viaticocero.sqlite')
}

export async function createElectronWorkspace(): Promise<DesktopRuntime> {
  applyElectronQvacConfigPath()
  const languageModel = new QvacLanguageModel({
    runtime: createSdkCompletionRuntime(),
  })
  const opened = await openNodeSqlite(defaultSqlitePath())
  return assembleDesktopWorkspace(languageModel, opened)
}
