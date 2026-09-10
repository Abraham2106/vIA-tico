import type { VisionResult } from '@viaticocero/contracts'

/**
 * Puerto de comprensión documental.
 * La implementación QVAC (VisionPsy Nano) vive en
 * `apps/mobile/src/adapters/driven/qvac-visionpsy`.
 * Este paquete no importa @qvac/*.
 */
export type VisionRequest = {
  imagePath: string
  profile?: 'base' | 'flash'
}

export type VisionPortStatus = 'ready' | 'unavailable' | 'not-wired'

export interface IVisionInference {
  status(): VisionPortStatus
  analyze(request: VisionRequest): Promise<VisionResult>
}
