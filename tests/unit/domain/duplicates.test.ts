import { describe, expect, it } from 'vitest'
import { findDuplicate, normalizeProvider } from '@viaticocero/core'
import type { Receipt } from '@viaticocero/core'
import type { VisionResult } from '@viaticocero/contracts'

const extraction: VisionResult = {
  proveedor: 'Soda La Casita',
  fecha: '2026-09-12',
  monto: 8500,
  moneda: 'CRC',
  tipo_documento: 'recibo',
  confianza_lectura: 'alta',
  raw_text: 'SODA 8500',
}

function receipt(id: string, used: VisionResult): Receipt {
  return {
    id,
    tripId: 'trip',
    capturedAt: '2026-09-12T12:00:00.000Z',
    extraction: used,
    usedExtraction: used,
    verdict: 'PROCEDE',
    triggeredRules: [],
    audit: [],
  }
}

describe('duplicates', () => {
  it('normaliza acentos y mayúsculas del proveedor', () => {
    expect(normalizeProvider('Soda La Casita')).toBe(normalizeProvider('SODA  la   CASITA'))
  })

  it('detecta mismo proveedor + fecha + monto', () => {
    const hit = findDuplicate(
      { ...extraction, proveedor: 'soda la casita' },
      [receipt('r1', extraction)],
    )
    expect(hit?.id).toBe('r1')
  })

  it('no marca duplicado si el monto cambia', () => {
    const hit = findDuplicate({ ...extraction, monto: 8501 }, [receipt('r1', extraction)])
    expect(hit).toBeUndefined()
  })
})
