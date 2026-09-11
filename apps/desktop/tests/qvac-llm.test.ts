import { describe, expect, it } from 'vitest'
import type { VisionResult } from '@viaticocero/contracts'
import { QvacLanguageModel } from '../src/adapters/driven/qvac-llm/language-model.ts'
import { parseInstructConfig, resolveInstructConfig } from '../src/adapters/driven/qvac-llm/config.ts'
import { QvacLlmError } from '../src/adapters/driven/qvac-llm/errors.ts'
import { parseModelJson } from '../src/adapters/driven/qvac-llm/json-output.ts'
import type { QvacCompletionRuntime } from '../src/adapters/driven/qvac-llm/runtime.ts'

const extraction: VisionResult = {
  proveedor: 'soda la casita',
  fecha: '2026-09-12',
  monto: 8500,
  moneda: 'CRC',
  tipo_documento: 'recibo',
  confianza_lectura: 'alta',
  raw_text: 'SODA 8500',
}

class MockCompletionRuntime implements QvacCompletionRuntime {
  loads = 0
  unloads: string[] = []

  constructor(private readonly completeText: string) {}

  async load(): Promise<string> {
    this.loads += 1
    return 'qwen-test'
  }

  async complete() {
    return { requestId: 'req-1', contentText: this.completeText }
  }

  async cancel(): Promise<void> {}

  async unload(modelId: string): Promise<void> {
    this.unloads.push(modelId)
  }

  async close(): Promise<void> {}
}

function runtime(completeText: string): MockCompletionRuntime {
  return new MockCompletionRuntime(completeText)
}

describe('config Instruct', () => {
  it('rechaza el catálogo de difusión', () => {
    expect(() =>
      resolveInstructConfig({
        config: parseInstructConfig({ catalogId: 'QWEN3_4B_Q4_K_M' }),
      }),
    ).toThrow(/prohibido/)
  })

  it('aplica overrides de entorno sin localStorage', () => {
    const config = resolveInstructConfig({
      jsonText: JSON.stringify({ catalogId: 'QWEN3_4B_INST_Q4_K_M', preload: false }),
      env: { VIATICOCERO_QWEN_PRELOAD: 'true', VIATICOCERO_QWEN_SRC: 'C:/models/qwen.gguf' },
    })
    expect(config.preload).toBe(true)
    expect(config.localSrc).toBe('C:/models/qwen.gguf')
  })
})

describe('parseModelJson', () => {
  it('quita <think> y fences', () => {
    const parsed = parseModelJson('<think>ruido</think>```json\n{"ok":true}\n```')
    expect(parsed).toEqual({ ok: true })
  })
})

describe('QvacLanguageModel con runtime falso', () => {
  it('queda not-wired cuando la configuración lo deshabilita', async () => {
    const client = runtime('{}')
    const model = new QvacLanguageModel({ runtime: client, config: { ...parseInstructConfig(undefined), enabled: false } })

    expect(model.status()).toBe('not-wired')
    await model.load()
    expect(client.loads).toBe(0)
    expect(model.snapshot().phase).toBe('idle')
  })

  it('carga, refina y no requiere GPU', async () => {
    const client = runtime(
      JSON.stringify({
        ...extraction,
        proveedor: 'Soda La Casita',
      }),
    )
    const model = new QvacLanguageModel({ runtime: client })
    expect(model.status()).toBe('unavailable')
    await model.load()
    expect(model.status()).toBe('ready')
    const refined = await model.refine(extraction)
    expect(refined.proveedor).toBe('Soda La Casita')
    expect(refined.monto).toBe(8500)
    await model.unload()
    expect(client.unloads).toEqual(['qwen-test'])
    expect(model.status()).toBe('unavailable')
  })

  it('clasifica motivo desde JSON del modelo', async () => {
    const client = runtime(
      '<think>x</think>{"categoria":"representacion","razon":"Cliente","confianza_clasificacion":"alta"}',
    )
    const model = new QvacLanguageModel({ runtime: client })
    await model.load()
    const classified = await model.classifyMotive({ motivo: 'Almorcé con el cliente' })
    expect(classified.categoria).toBe('representacion')
    expect(classified).not.toHaveProperty('veredicto')
  })

  it('exige modelo cargado y motivo no vacío', async () => {
    const model = new QvacLanguageModel({ runtime: runtime('{}') })
    await expect(model.refine(extraction)).rejects.toBeInstanceOf(QvacLlmError)
    await model.load()
    await expect(model.classifyMotive({ motivo: '   ' })).rejects.toMatchObject({ code: 'INVALID_INPUT' })
  })
})
