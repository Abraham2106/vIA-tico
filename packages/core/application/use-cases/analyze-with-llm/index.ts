import type { VisionResult } from '@viaticocero/contracts'
import type { IAnalyzeWithLlm } from '../../ports/inbound/index.ts'
import type { ILanguageModel } from '../../ports/outbound/language-model.ts'
import { applyDigitGuard } from '../../../domain/services/digit-guard.ts'

export function createAnalyzeWithLlm(languageModel: ILanguageModel): IAnalyzeWithLlm {
  return {
    async execute(extraction: VisionResult) {
      if (languageModel.status() !== 'ready') {
        return { used: extraction, discarded: false }
      }
      const refined = await languageModel.refine(extraction)
      const guarded = applyDigitGuard(extraction, refined)
      return {
        used: guarded.used,
        discarded: guarded.discarded,
        refined,
      }
    },
  }
}
