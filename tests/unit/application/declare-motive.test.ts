import { describe, expect, it } from 'vitest'
import { createDeclareMotive } from '@viaticocero/core'
import type { VisionResult } from '@viaticocero/contracts'

const extraction: VisionResult = {
  proveedor: 'Soda La Casita',
  fecha: '2026-09-12',
  monto: 8500,
  moneda: 'CRC',
  tipo_documento: 'recibo',
  confianza_lectura: 'alta',
  raw_text: 'SODA 8500',
  categoria: 'alimentacion',
}

describe('declare-motive', () => {
  it('omite un motivo vacío sin modificar la categoría', () => {
    const result = createDeclareMotive().execute({ extraction, motivo: '   ' })

    expect(result.motivo).toBeUndefined()
    expect(result.categoria).toBe('alimentacion')
    expect(result).not.toHaveProperty('veredicto')
  })

  it('recorta el texto libre sin inferir nada', () => {
    const result = createDeclareMotive().execute({
      extraction,
      motivo: '  Almuerzo con el cliente regional  ',
    })

    expect(result).toEqual({
      ...extraction,
      motivo: 'Almuerzo con el cliente regional',
    })
  })
})
