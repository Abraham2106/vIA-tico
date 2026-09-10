import type { ILanguageModel, VisionResult } from '@viaticocero/core'

/**
 * Stub del adaptador Qwen Instruct.
 * El SDK `@qvac/sdk` no se importa aquí todavía.
 */
export class QvacLanguageModelStub implements ILanguageModel {
  status() {
    return 'not-wired' as const
  }

  async refine(extraction: VisionResult): Promise<VisionResult> {
    return extraction
  }
}
