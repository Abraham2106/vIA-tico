import type { IVisionInference, VisionResult } from '@viaticocero/core'

/**
 * Stub de VisionPsy Nano. No importa @qvac/sdk.
 * La captura de etapa no-QVAC usa el DTO manual (`ManualDtoVision`).
 */
export class QvacVisionPsyStub implements IVisionInference {
  status() {
    return 'not-wired' as const
  }
  async analyze(): Promise<VisionResult> {
    throw new Error('qvac-visionpsy: VisionPsy Nano no cableado en este PR')
  }
}

export class ManualDtoVision implements IVisionInference {
  constructor(private readonly dto: VisionResult) {}
  status() {
    return 'ready' as const
  }
  async analyze(): Promise<VisionResult> {
    return this.dto
  }
}
