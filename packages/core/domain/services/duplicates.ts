import type { VisionResult } from '@viaticocero/contracts'
import type { Receipt } from '../receipt/index.ts'

export function normalizeProvider(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function isDuplicateVision(a: VisionResult, b: VisionResult): boolean {
  return (
    normalizeProvider(a.proveedor) === normalizeProvider(b.proveedor) &&
    a.fecha === b.fecha &&
    a.monto === b.monto &&
    a.moneda === b.moneda
  )
}

export function findDuplicate(
  candidate: VisionResult,
  siblings: Receipt[],
  excludeId?: string,
): Receipt | undefined {
  return siblings.find(
    (item) => item.id !== excludeId && isDuplicateVision(candidate, item.usedExtraction),
  )
}
