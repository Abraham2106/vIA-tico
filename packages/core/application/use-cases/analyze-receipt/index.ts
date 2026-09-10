import type { IAnalyzeReceipt } from '../../ports/inbound/index.ts'
import type { IVisionInference } from '../../ports/outbound/vision.ts'

export function createAnalyzeReceipt(vision: IVisionInference): IAnalyzeReceipt {
  return {
    async execute({ imagePath, profile }) {
      return vision.analyze({ imagePath, profile })
    },
  }
}
