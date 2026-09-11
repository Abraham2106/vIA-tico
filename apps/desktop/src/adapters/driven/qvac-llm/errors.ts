export type QvacLlmErrorCode =
  | 'INVALID_INPUT'
  | 'INVALID_OUTPUT'
  | 'UNAVAILABLE'
  | 'TIMEOUT'
  | 'CANCELLED'
  | 'FORBIDDEN_MODEL'

export class QvacLlmError extends Error {
  readonly code: QvacLlmErrorCode

  constructor(code: QvacLlmErrorCode, message: string) {
    super(message)
    this.name = 'QvacLlmError'
    this.code = code
  }
}

export function assertRecord(value: unknown, field: string): asserts value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new QvacLlmError('INVALID_INPUT', `${field} debe ser un objeto.`)
  }
}

export function assertNonEmpty(value: unknown, field: string): asserts value is string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new QvacLlmError('INVALID_INPUT', `${field} debe ser un texto no vacío.`)
  }
}

export function assertFiniteNumber(value: unknown, field: string): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new QvacLlmError('INVALID_INPUT', `${field} debe ser un número finito.`)
  }
}
