/**
 * Composition Bare (QVAC in-process).
 * No se implementa en este PR: requiere @qvac/inference y plugins llamacpp.
 */
export function createBareComposition(): never {
  throw new Error('composition/bare: reservado para el worker QVAC')
}
