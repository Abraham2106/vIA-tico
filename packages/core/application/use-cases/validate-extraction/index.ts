import { safeParseVisionResult, type VisionResult } from '@viaticocero/contracts'
import type { IValidateExtraction } from '../../ports/inbound/index.ts'

export const validateExtraction: IValidateExtraction = {
  execute(input: unknown) {
    const parsed = safeParseVisionResult(input)
    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues.map((issue) => issue.message).join('; ') }
    }
    return { ok: true, value: parsed.data as VisionResult }
  },
}
