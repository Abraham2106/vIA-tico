import type { ClassifyMotiveInput, ILanguageModel, LanguageModelStatus } from '@viaticocero/core'
import type { MotiveClassification, VisionResult } from '@viaticocero/contracts'
import { DEFAULT_INSTRUCT_CATALOG_ID } from './config.ts'
import type { QvacLlmSnapshot } from './language-model.ts'

/**
 * Stub para el composition web: el renderer no carga @qvac/sdk.
 */
export class QvacLanguageModelStub implements ILanguageModel {
  status(): LanguageModelStatus {
    return 'not-wired'
  }

  snapshot(): QvacLlmSnapshot {
    return {
      phase: 'idle',
      status: 'not-wired',
      catalogId: DEFAULT_INSTRUCT_CATALOG_ID,
      message: 'Qwen Instruct no corre en el preview web. Usa Electron.',
    }
  }

  setProgressListener(_listener?: (snapshot: QvacLlmSnapshot) => void): void {}

  async load(): Promise<QvacLlmSnapshot> {
    return this.snapshot()
  }

  async unload(): Promise<QvacLlmSnapshot> {
    return this.snapshot()
  }

  async refine(extraction: VisionResult): Promise<VisionResult> {
    return extraction
  }

  async classifyMotive(_input: ClassifyMotiveInput): Promise<MotiveClassification> {
    throw new Error('ILanguageModel no cableado: classify-motive requiere Electron + Qwen Instruct')
  }
}
