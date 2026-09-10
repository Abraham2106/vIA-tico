import { describe, expect, it } from 'vitest'
import { applyDigitGuard, compareImmutableFields } from '@viaticocero/core'
import type { VisionResult } from '@viaticocero/contracts'

const raw: VisionResult = {
  proveedor: 'Soda',
  fecha: '2026-09-12',
  monto: 8500,
  moneda: 'CRC',
  tipo_documento: 'recibo',
  confianza_lectura: 'alta',
  raw_text: 'SODA 8500',
}

describe('digit guard', () => {
  it('acepta postproceso que solo cambia etiquetas', () => {
    const refined = { ...raw, proveedor: 'Soda La Casita', categoria: 'alimentacion' as const }
    expect(compareImmutableFields(raw, refined).ok).toBe(true)
    expect(applyDigitGuard(raw, refined).discarded).toBe(false)
    expect(applyDigitGuard(raw, refined).used.proveedor).toBe('Soda La Casita')
  })

  it('descarta postproceso que cambia el monto (12.50 ≠ 1.50)', () => {
    const refined = { ...raw, monto: 1500 }
    const result = applyDigitGuard(raw, refined)
    expect(result.discarded).toBe(true)
    expect(result.used.monto).toBe(8500)
    expect(result.alteredFields).toEqual(['monto'])
  })

  it('descarta cambios de fecha o moneda', () => {
    expect(compareImmutableFields(raw, { ...raw, fecha: '2026-09-13' }).ok).toBe(false)
    expect(compareImmutableFields(raw, { ...raw, moneda: 'USD' }).ok).toBe(false)
  })
})
