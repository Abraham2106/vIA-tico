import { describe, expect, it } from 'vitest'
import { DEFAULT_POLICY, evaluateReceipt } from '@viaticocero/core'
import type { VisionResult } from '@viaticocero/contracts'
import { DEMO_TRIP } from '@viaticocero/core'

function extraction(overrides: Partial<VisionResult> = {}): VisionResult {
  return {
    proveedor: 'Soda La Casita',
    fecha: '2026-09-12',
    monto: 8500,
    moneda: 'CRC',
    tipo_documento: 'recibo',
    confianza_lectura: 'alta',
    raw_text: 'SODA 8500',
    categoria: 'alimentacion',
    ...overrides,
  }
}

describe('evaluateReceipt', () => {
  it('PROCEDE cuando todo cuadra y la confianza es alta', () => {
    const result = evaluateReceipt({
      trip: DEMO_TRIP,
      extraction: extraction(),
      policy: DEFAULT_POLICY,
      siblings: [],
    })
    expect(result.verdict).toBe('PROCEDE')
    expect(result.rules).toEqual([])
  })

  it('REVISIÓN si la fecha está fuera del viaje (demo 25 sep)', () => {
    const result = evaluateReceipt({
      trip: DEMO_TRIP,
      extraction: extraction({ proveedor: 'El Farol', fecha: '2026-09-25', monto: 9200 }),
      policy: DEFAULT_POLICY,
      siblings: [],
    })
    expect(result.verdict).toBe('REVISION')
    expect(result.rules.map((rule) => rule.code)).toContain('FECHA_FUERA_PERIODO')
  })

  it('REVISIÓN si la confianza es baja aunque el resto cuadre', () => {
    const result = evaluateReceipt({
      trip: DEMO_TRIP,
      extraction: extraction({ confianza_lectura: 'baja', raw_text: '' }),
      policy: DEFAULT_POLICY,
      siblings: [],
    })
    expect(result.verdict).toBe('REVISION')
    expect(result.rules.map((rule) => rule.code)).toEqual(
      expect.arrayContaining(['CONFIANZA_BAJA', 'DOCUMENTO_ILEGIBLE']),
    )
  })

  it('NO_PROCEDE si el hospedaje supera el tope por noche', () => {
    const result = evaluateReceipt({
      trip: DEMO_TRIP,
      extraction: extraction({
        proveedor: 'Resort',
        categoria: 'hospedaje',
        monto: 120_000,
        raw_text: 'HOTEL 120000',
      }),
      policy: DEFAULT_POLICY,
      siblings: [],
    })
    expect(result.verdict).toBe('NO_PROCEDE')
    expect(result.rules.map((rule) => rule.code)).toContain('TOPE_HOSPEDAJE')
  })

  it('REVISIÓN si representación no tiene motivo', () => {
    const result = evaluateReceipt({
      trip: DEMO_TRIP,
      extraction: extraction({
        categoria: 'representacion',
        monto: 12_000,
        motivo: undefined,
      }),
      policy: DEFAULT_POLICY,
      siblings: [],
    })
    expect(result.verdict).toBe('REVISION')
    expect(result.rules.map((rule) => rule.code)).toContain('MOTIVO_AMBIGUO')
  })
})
