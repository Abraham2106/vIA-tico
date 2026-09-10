import { assertFiniteNumber, assertNonEmpty, assertRecord, QvacLlmError } from './errors.ts'

export const DEFAULT_INSTRUCT_CATALOG_ID = 'QWEN3_4B_INST_Q4_K_M'
export const FORBIDDEN_DIFFUSION_CATALOG_ID = 'QWEN3_4B_Q4_K_M'

export type InstructGenerationConfig = {
  temp: number
  predict: number
  seed: number
}

export type InstructTimeouts = {
  loadMs: number
  inferMs: number
}

export type InstructModelConfig = {
  enabled: boolean
  catalogId: string
  modelType: 'llamacpp-completion'
  forbiddenCatalogIds: readonly string[]
  localSrc?: string
  modelConfig: Record<string, unknown>
  generation: InstructGenerationConfig
  timeouts: InstructTimeouts
  preload: boolean
}

const DEFAULT_CONFIG: InstructModelConfig = {
  enabled: true,
  catalogId: DEFAULT_INSTRUCT_CATALOG_ID,
  modelType: 'llamacpp-completion',
  forbiddenCatalogIds: [FORBIDDEN_DIFFUSION_CATALOG_ID],
  modelConfig: { ctx_size: 4096 },
  generation: { temp: 0, predict: 2048, seed: 42 },
  timeouts: { loadMs: 600_000, inferMs: 120_000 },
  preload: false,
}

function readString(env: NodeJS.ProcessEnv, key: string): string | undefined {
  const value = env[key]
  return value && value.trim() ? value.trim() : undefined
}

function parseBoolean(value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined
  if (value === '1' || value.toLowerCase() === 'true') return true
  if (value === '0' || value.toLowerCase() === 'false') return false
  return undefined
}

function parsePositiveInt(value: string | undefined): number | undefined {
  if (value === undefined) return undefined
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined
  return parsed
}

export function parseInstructConfig(input: unknown): InstructModelConfig {
  if (input === undefined) return { ...DEFAULT_CONFIG, forbiddenCatalogIds: [...DEFAULT_CONFIG.forbiddenCatalogIds] }
  assertRecord(input, 'instruct config')
  const catalogId =
    typeof input.catalogId === 'string' ? input.catalogId.trim() : DEFAULT_CONFIG.catalogId
  assertNonEmpty(catalogId, 'catalogId')
  const enabled = typeof input.enabled === 'boolean' ? input.enabled : DEFAULT_CONFIG.enabled
  const modelType = input.modelType ?? DEFAULT_CONFIG.modelType
  if (modelType !== 'llamacpp-completion') {
    throw new QvacLlmError('INVALID_INPUT', 'modelType debe ser llamacpp-completion.')
  }
  const forbidden = Array.isArray(input.forbiddenCatalogIds)
    ? input.forbiddenCatalogIds.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : [...DEFAULT_CONFIG.forbiddenCatalogIds]
  const generationRaw = input.generation
  const generation = { ...DEFAULT_CONFIG.generation }
  if (generationRaw !== undefined) {
    assertRecord(generationRaw, 'generation')
    if (generationRaw.temp !== undefined) {
      assertFiniteNumber(generationRaw.temp, 'generation.temp')
      generation.temp = generationRaw.temp
    }
    if (generationRaw.predict !== undefined) {
      assertFiniteNumber(generationRaw.predict, 'generation.predict')
      generation.predict = generationRaw.predict
    }
    if (generationRaw.seed !== undefined) {
      assertFiniteNumber(generationRaw.seed, 'generation.seed')
      generation.seed = generationRaw.seed
    }
  }
  const timeoutsRaw = input.timeouts
  const timeouts = { ...DEFAULT_CONFIG.timeouts }
  if (timeoutsRaw !== undefined) {
    assertRecord(timeoutsRaw, 'timeouts')
    if (timeoutsRaw.loadMs !== undefined) {
      assertFiniteNumber(timeoutsRaw.loadMs, 'timeouts.loadMs')
      timeouts.loadMs = timeoutsRaw.loadMs
    }
    if (timeoutsRaw.inferMs !== undefined) {
      assertFiniteNumber(timeoutsRaw.inferMs, 'timeouts.inferMs')
      timeouts.inferMs = timeoutsRaw.inferMs
    }
  }
  const modelConfig =
    input.modelConfig === undefined
      ? { ...DEFAULT_CONFIG.modelConfig }
      : (assertRecord(input.modelConfig, 'modelConfig'), { ...input.modelConfig })
  const localSrc = typeof input.localSrc === 'string' && input.localSrc.trim() ? input.localSrc.trim() : undefined
  const preload = typeof input.preload === 'boolean' ? input.preload : DEFAULT_CONFIG.preload
  return {
    enabled,
    catalogId,
    modelType,
    forbiddenCatalogIds: forbidden,
    localSrc,
    modelConfig,
    generation,
    timeouts,
    preload,
  }
}

export function applyEnvOverrides(
  config: InstructModelConfig,
  env: NodeJS.ProcessEnv = typeof process === 'undefined' ? {} : process.env,
): InstructModelConfig {
  const localSrc = readString(env, 'VIATICOCERO_QWEN_SRC') ?? config.localSrc
  const catalogId = readString(env, 'VIATICOCERO_QWEN_CATALOG') ?? config.catalogId
  const preload = parseBoolean(env.VIATICOCERO_QWEN_PRELOAD) ?? config.preload
  const loadMs = parsePositiveInt(env.VIATICOCERO_QWEN_LOAD_MS) ?? config.timeouts.loadMs
  const inferMs = parsePositiveInt(env.VIATICOCERO_QWEN_INFER_MS) ?? config.timeouts.inferMs
  return {
    ...config,
    catalogId,
    localSrc,
    preload,
    timeouts: { loadMs, inferMs },
  }
}

export function assertAllowedCatalog(config: InstructModelConfig): void {
  if (config.forbiddenCatalogIds.includes(config.catalogId)) {
    throw new QvacLlmError(
      'FORBIDDEN_MODEL',
      `${config.catalogId} está prohibido. Usa ${DEFAULT_INSTRUCT_CATALOG_ID} (Instruct), no difusión.`,
    )
  }
}

export type InstructConfigReader = {
  readText(path: string): string
}

export function loadInstructConfigFromJson(
  jsonText: string,
  env: NodeJS.ProcessEnv = typeof process === 'undefined' ? {} : process.env,
): InstructModelConfig {
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText) as unknown
  } catch {
    throw new QvacLlmError('INVALID_INPUT', 'instruct.json no es JSON válido.')
  }
  const config = applyEnvOverrides(parseInstructConfig(parsed), env)
  assertAllowedCatalog(config)
  return config
}

export function resolveInstructConfig(options: {
  jsonText?: string
  config?: InstructModelConfig
  env?: NodeJS.ProcessEnv
}): InstructModelConfig {
  if (options.config) {
    const next = applyEnvOverrides(options.config, options.env)
    assertAllowedCatalog(next)
    return next
  }
  if (options.jsonText !== undefined) {
    return loadInstructConfigFromJson(options.jsonText, options.env)
  }
  const next = applyEnvOverrides(parseInstructConfig(undefined), options.env)
  assertAllowedCatalog(next)
  return next
}
