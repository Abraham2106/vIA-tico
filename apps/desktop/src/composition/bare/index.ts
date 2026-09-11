import { fileURLToPath } from 'node:url'

export type BareLlmPluginRegistrar = (plugin: unknown) => void

/**
 * Bare in-process exige registrar `llmPlugin` antes de cualquier inferencia.
 * La composición concreta inyecta el plugin generado por QVAC; este módulo
 * no importa el SDK para conservar el aislamiento del preview web.
 */
export function registerLlmPluginBeforeInference(
  register: BareLlmPluginRegistrar,
  llmPlugin: unknown,
): void {
  register(llmPlugin)
}

/**
 * Rutas JSON del runtime QVAC. Válidas en Node y Electron.
 * El registro in-process (`@qvac/inference` + llmPlugin) queda para un worker Bare;
 * Electron usa `@qvac/sdk`, que lee `QVAC_CONFIG_PATH`.
 */
export function qvacConfigPath(): string {
  return fileURLToPath(new URL('../../../config/qvac/qvac.config.json', import.meta.url))
}

export function instructConfigPath(): string {
  return fileURLToPath(new URL('../../../config/qvac/instruct.json', import.meta.url))
}

export function applyQvacConfigPath(env: NodeJS.ProcessEnv = process.env): string {
  const path = env.QVAC_CONFIG_PATH ?? qvacConfigPath()
  env.QVAC_CONFIG_PATH = path
  return path
}
