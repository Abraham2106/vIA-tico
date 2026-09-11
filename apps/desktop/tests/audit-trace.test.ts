import { describe, expect, it } from 'vitest'
import type { Receipt } from '@viaticocero/core'
import {
  eventStory,
  fieldTraces,
  matchesAuditFilter,
  postprocessWasDiscarded,
  qwenStatus,
} from '../src/renderer/src/features/audit/trace.ts'

const extraction = {
  proveedor: 'Soda La Casita',
  fecha: '2026-09-12',
  monto: 8500,
  moneda: 'CRC' as const,
  tipo_documento: 'recibo' as const,
  confianza_lectura: 'alta' as const,
  raw_text: 'SODA LA CASITA 8500',
  categoria: 'alimentacion' as const,
}

function receipt(patch: Partial<Receipt> = {}): Receipt {
  return {
    id: 'r-1',
    tripId: 't-1',
    capturedAt: '2026-09-12T10:00:00.000Z',
    extraction,
    usedExtraction: extraction,
    verdict: 'PROCEDE',
    triggeredRules: [],
    audit: [],
    ...patch,
  }
}

describe('rastro de auditoría de IA', () => {
  it('marca monto inmutable cuando Qwen lo cambia y el código lo tira', () => {
    const item = receipt({
      linguisticPostprocess: { ...extraction, monto: 1500, proveedor: 'Soda editada' },
      usedExtraction: extraction,
      verdict: 'REVISION',
      triggeredRules: [
        { code: 'DIGITOS_ALTERADOS', severity: 'review', message: 'El postproceso cambió: monto' },
      ],
    })
    expect(postprocessWasDiscarded(item)).toBe(true)
    expect(qwenStatus(item)).toBe('discarded')
    const monto = fieldTraces(item).find((field) => field.key === 'monto')
    expect(monto?.blocked).toBe(true)
    expect(monto?.qwen).toBe('1500')
    expect(monto?.used).toBe('8500')
  })

  it('acepta un postproceso que solo cambia texto', () => {
    const refined = { ...extraction, proveedor: 'Soda La Casita S.A.' }
    const item = receipt({
      linguisticPostprocess: refined,
      usedExtraction: refined,
    })
    expect(qwenStatus(item)).toBe('applied')
    const proveedor = fieldTraces(item).find((field) => field.key === 'proveedor')
    expect(proveedor?.qwenChanged).toBe(true)
    expect(proveedor?.blocked).toBe(false)
    expect(proveedor?.used).toBe('Soda La Casita S.A.')
  })

  it('explica que VisionPsy no autoriza', () => {
    expect(eventStory({ id: '1', at: 't', actor: 'vision', action: 'extract' })).toMatch(/no autoriza/)
    expect(
      matchesAuditFilter({ id: '1', at: 't', actor: 'vision', action: 'extract' }, 'ai'),
    ).toBe(true)
    expect(
      matchesAuditFilter({ id: '1', at: 't', actor: 'system', action: 'verdict' }, 'ai'),
    ).toBe(false)
  })
})
