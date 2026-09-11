import type { VisionResult } from '@viaticocero/contracts'
import type { IDeclareMotive } from '../../ports/inbound/index.ts'

export type DeclareMotiveRequest = {
  extraction: VisionResult
  motivo?: string
}

/**
 * Conserva la declaración humana junto a la extracción sin inferir categoría
 * ni tomar decisiones de dominio.
 */
export function createDeclareMotive(): IDeclareMotive {
  return {
    execute({ extraction, motivo }: DeclareMotiveRequest): VisionResult {
      const normalized = motivo?.trim()
      return { ...extraction, motivo: normalized || undefined }
    },
  }
}
