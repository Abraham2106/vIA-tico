import { fileURLToPath } from 'node:url'
import {
  createSdkCompletionRuntime,
  QvacLanguageModel,
} from '../../adapters/driven/qvac-llm/index.ts'
import { createDesktopWorkspace } from '../desktop-workspace.ts'

export function applyElectronQvacConfigPath(env: NodeJS.ProcessEnv = process.env): string {
  const configPath = fileURLToPath(new URL('../../../config/qvac/qvac.config.json', import.meta.url))
  env.QVAC_CONFIG_PATH ??= configPath
  return env.QVAC_CONFIG_PATH
}

export async function createElectronWorkspace() {
  applyElectronQvacConfigPath()
  const languageModel = new QvacLanguageModel({
    runtime: createSdkCompletionRuntime(),
  })
  const workspace = await createDesktopWorkspace(languageModel)
  return workspace
}
