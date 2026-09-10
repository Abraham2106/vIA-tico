import type { VisionResult } from '@viaticocero/contracts'

/**
 * Puerto de postproceso lingüístico.
 * La implementación QVAC (Qwen Instruct) vive en
 * `apps/desktop/src/adapters/driven/qvac-llm`.
 * No autoriza veredictos ni cambia dígitos (ADR 0010).
 */
export type LanguageModelStatus = 'ready' | 'unavailable' | 'not-wired'

export interface ILanguageModel {
  status(): LanguageModelStatus
  refine(extraction: VisionResult): Promise<VisionResult>
}
