import type { ClassifyMotiveInput, ILanguageModel, LanguageModelStatus } from '@viaticocero/core'
import {
  parseMotiveClassification,
  parseVisionResult,
  type MotiveClassification,
  type VisionResult,
} from '@viaticocero/contracts'
import { resolveInstructConfig, type InstructModelConfig } from './config.ts'
import { assertNonEmpty, assertRecord, QvacLlmError } from './errors.ts'
import { parseModelJson } from './json-output.ts'
import { CLASSIFY_SYSTEM_PROMPT, REFINE_SYSTEM_PROMPT } from './prompts.ts'
import type { QvacCompletionRuntime } from './runtime.ts'
import { CLASSIFY_JSON_SCHEMA, REFINE_JSON_SCHEMA } from './schemas.ts'

export type QvacLlmPhase = 'idle' | 'loading' | 'ready' | 'inferring' | 'unloading' | 'error'

export type QvacLlmSnapshot = {
  phase: QvacLlmPhase
  status: LanguageModelStatus
  catalogId: string
  message: string
  percent?: number
  modelId?: string
  error?: string
}

export type QvacLanguageModelOptions = {
  runtime: QvacCompletionRuntime
  config?: InstructModelConfig
  jsonText?: string
  env?: NodeJS.ProcessEnv
  onProgress?: (snapshot: QvacLlmSnapshot) => void
}

export type QvacModelController = {
  snapshot(): QvacLlmSnapshot
  load(): Promise<QvacLlmSnapshot>
  unload(): Promise<QvacLlmSnapshot>
  close?: () => Promise<void>
  setProgressListener?: (listener?: (snapshot: QvacLlmSnapshot) => void) => void
}

export function isQvacController(model: ILanguageModel): model is ILanguageModel & QvacModelController {
  const candidate = model as ILanguageModel & Partial<QvacModelController>
  return (
    typeof candidate.snapshot === 'function' &&
    typeof candidate.load === 'function' &&
    typeof candidate.unload === 'function'
  )
}

function raceTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new QvacLlmError('TIMEOUT', `${label} superó ${ms} ms.`))
    }, ms)
  })
  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer)
  })
}

export class QvacLanguageModel implements ILanguageModel {
  private readonly runtime: QvacCompletionRuntime
  private readonly config: InstructModelConfig
  private onProgress?: (snapshot: QvacLlmSnapshot) => void
  private phase: QvacLlmPhase = 'idle'
  private modelId?: string
  private percent?: number
  private message: string
  private lastError?: string
  private busy = false

  constructor(options: QvacLanguageModelOptions) {
    this.runtime = options.runtime
    this.config = resolveInstructConfig({
      config: options.config,
      jsonText: options.jsonText,
      env: options.env,
    })
    this.onProgress = options.onProgress
    this.message = `Qwen Instruct (${this.config.catalogId}) sin cargar`
  }

  shouldPreload(): boolean {
    return this.config.preload
  }

  setProgressListener(listener?: (snapshot: QvacLlmSnapshot) => void): void {
    this.onProgress = listener
  }

  snapshot(): QvacLlmSnapshot {
    return {
      phase: this.phase,
      status: this.status(),
      catalogId: this.config.catalogId,
      message: this.message,
      percent: this.percent,
      modelId: this.modelId,
      error: this.lastError,
    }
  }

  status(): LanguageModelStatus {
    if (!this.config.enabled) return 'not-wired'
    if (this.phase === 'ready' || this.phase === 'inferring') return 'ready'
    return 'unavailable'
  }

  async load(): Promise<QvacLlmSnapshot> {
    if (!this.config.enabled) {
      this.phase = 'idle'
      this.message = 'Qwen Instruct deshabilitado por configuración.'
      this.emit()
      return this.snapshot()
    }
    if (this.modelId && this.phase === 'ready') return this.snapshot()
    this.assertNotBusy('cargar el modelo')
    this.busy = true
    this.phase = 'loading'
    this.lastError = undefined
    this.percent = 0
    this.message = `Cargando ${this.config.catalogId}…`
    this.emit()
    try {
      const modelId = await raceTimeout(
        this.runtime.load({
          catalogId: this.config.catalogId,
          modelType: this.config.modelType,
          localSrc: this.config.localSrc,
          modelConfig: this.config.modelConfig,
          onProgress: (progress) => {
            this.percent = progress.percentage
            this.message = `Descargando ${this.config.catalogId}: ${Math.round(progress.percentage)}%`
            this.emit()
          },
        }),
        this.config.timeouts.loadMs,
        'Carga de Qwen Instruct',
      )
      assertNonEmpty(modelId, 'modelId')
      this.modelId = modelId
      this.phase = 'ready'
      this.percent = 100
      this.message = `Qwen Instruct listo (${this.config.catalogId})`
      this.emit()
      return this.snapshot()
    } catch (error) {
      this.phase = 'error'
      this.lastError = error instanceof Error ? error.message : String(error)
      this.message = this.lastError
      this.emit()
      throw error instanceof QvacLlmError
        ? error
        : new QvacLlmError('UNAVAILABLE', this.lastError)
    } finally {
      this.busy = false
    }
  }

  async unload(): Promise<QvacLlmSnapshot> {
    if (!this.config.enabled) return this.snapshot()
    if (!this.modelId) {
      this.phase = 'idle'
      this.message = `Qwen Instruct (${this.config.catalogId}) sin cargar`
      this.emit()
      return this.snapshot()
    }
    this.assertNotBusy('descargar el modelo')
    this.busy = true
    this.phase = 'unloading'
    this.message = 'Liberando Qwen Instruct…'
    this.emit()
    try {
      await raceTimeout(
        this.runtime.unload(this.modelId),
        this.config.timeouts.loadMs,
        'Descarga de Qwen Instruct',
      )
      this.modelId = undefined
      this.phase = 'idle'
      this.percent = undefined
      this.message = `Qwen Instruct (${this.config.catalogId}) sin cargar`
      this.emit()
      return this.snapshot()
    } finally {
      this.busy = false
    }
  }

  async close(): Promise<void> {
    if (this.busy) {
      throw new QvacLlmError('UNAVAILABLE', 'No se puede cerrar QVAC durante una operación en curso.')
    }
    if (this.modelId) await this.unload()
    await this.runtime.close()
  }

  async refine(extraction: VisionResult): Promise<VisionResult> {
    assertRecord(extraction, 'extraction')
    try {
      parseVisionResult(extraction)
    } catch (error) {
      throw new QvacLlmError(
        'INVALID_INPUT',
        error instanceof Error ? `extraction inválida: ${error.message}` : 'extraction inválida.',
      )
    }
    const raw = await this.completeJson(
      REFINE_SYSTEM_PROMPT,
      JSON.stringify(extraction),
      'viatico-refine',
      REFINE_JSON_SCHEMA as unknown as Record<string, unknown>,
    )
    return parseVisionResult(raw)
  }

  async classifyMotive(input: ClassifyMotiveInput): Promise<MotiveClassification> {
    assertRecord(input, 'classifyMotive input')
    assertNonEmpty(input.motivo, 'motivo')
    const payload = {
      motivo: input.motivo.trim(),
      proveedor: input.extraction?.proveedor,
      tipo_documento: input.extraction?.tipo_documento,
      raw_text: input.extraction?.raw_text,
    }
    const raw = await this.completeJson(
      CLASSIFY_SYSTEM_PROMPT,
      JSON.stringify(payload),
      'viatico-classify-motive',
      CLASSIFY_JSON_SCHEMA as unknown as Record<string, unknown>,
    )
    return parseMotiveClassification(raw)
  }

  private async completeJson(
    system: string,
    user: string,
    schemaName: string,
    jsonSchema: Record<string, unknown>,
  ): Promise<unknown> {
    if (!this.config.enabled) {
      throw new QvacLlmError('UNAVAILABLE', 'Qwen Instruct está deshabilitado.')
    }
    if (!this.modelId || this.status() !== 'ready') {
      throw new QvacLlmError('UNAVAILABLE', 'Qwen Instruct no está cargado.')
    }
    this.assertNotBusy('inferir')
    this.busy = true
    this.phase = 'inferring'
    this.message = schemaName === 'viatico-classify-motive' ? 'Clasificando motivo…' : 'Postprocesando comprobante…'
    this.emit()
    try {
      const result = await raceTimeout(
        this.runtime.complete({
          modelId: this.modelId,
          history: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          schemaName,
          jsonSchema,
          generation: this.config.generation,
        }),
        this.config.timeouts.inferMs,
        'Inferencia Qwen Instruct',
      )
      return parseModelJson(result.contentText)
    } catch (error) {
      if (error instanceof QvacLlmError) throw error
      throw new QvacLlmError('UNAVAILABLE', error instanceof Error ? error.message : String(error))
    } finally {
      this.busy = false
      this.phase = this.modelId ? 'ready' : 'idle'
      this.message = this.modelId
        ? `Qwen Instruct listo (${this.config.catalogId})`
        : `Qwen Instruct (${this.config.catalogId}) sin cargar`
      this.emit()
    }
  }

  private assertNotBusy(action: string): void {
    if (this.busy) {
      throw new QvacLlmError('UNAVAILABLE', `No se puede ${action}: hay otra operación QVAC en curso.`)
    }
  }

  private emit(): void {
    this.onProgress?.(this.snapshot())
  }
}

