import type { MotiveClassification, VisionResult } from '@viaticocero/contracts'

/**
 * Puerto de postproceso lingüístico y classify-motive.
 * La implementación QVAC (Qwen Instruct) vive en
 * `apps/desktop/src/adapters/driven/qvac-llm`.
 * No autoriza veredictos ni cambia dígitos (ADR 0010).
 */
export type LanguageModelStatus = 'ready' | 'unavailable' | 'not-wired'

export type ClassifyMotiveInput = {
  motivo: string
  extraction?: Pick<VisionResult, 'proveedor' | 'tipo_documento' | 'raw_text'>
}

export interface ILanguageModel {
  status(): LanguageModelStatus
  refine(extraction: VisionResult): Promise<VisionResult>
  classifyMotive(input: ClassifyMotiveInput): Promise<MotiveClassification>
}
