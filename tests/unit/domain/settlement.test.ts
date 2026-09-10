import { describe, expect, it } from 'vitest'
import { settleTrip, type Receipt } from '@viaticocero/core'
import { DEMO_TRIP } from '@viaticocero/core'
import type { VisionResult } from '@viaticocero/contracts'

function receipt(id: string, monto: number, verdict: Receipt['verdict']): Receipt {
  const used: VisionResult = {
    proveedor: id,
    fecha: '2026-09-12',
    monto,
    moneda: 'CRC',
    tipo_documento: 'recibo',
    confianza_lectura: 'alta',
    raw_text: id,
  }
  return {
    id,
    tripId: DEMO_TRIP.id,
    capturedAt: '2026-09-12T12:00:00.000Z',
    extraction: used,
    usedExtraction: used,
    verdict,
    triggeredRules: [],
    audit: [],
  }
}

describe('settleTrip', () => {
  it('suma adelanto vs respaldado vs aprobado vs pendientes', () => {
    const settlement = settleTrip(
      DEMO_TRIP,
      [
        receipt('a', 80_000, 'PROCEDE'),
        receipt('b', 9_200, 'REVISION'),
        receipt('c', 8_500, 'REVISION'),
        receipt('d', 10_000, 'NO_PROCEDE'),
      ],
      [
        {
          id: 'e1',
          receiptId: 'b',
          tripId: DEMO_TRIP.id,
          verdict: 'REVISION',
          rules: [],
          openedAt: '2026-09-12T12:00:00.000Z',
          status: 'open',
        },
      ],
    )
    expect(settlement.backedTotal.amount).toBe(107_700)
    expect(settlement.approvedTotal.amount).toBe(80_000)
    expect(settlement.pendingReviewTotal.amount).toBe(17_700)
    expect(settlement.rejectedTotal.amount).toBe(10_000)
    expect(settlement.toReturn.amount).toBe(120_000)
    expect(settlement.toReimburse.amount).toBe(0)
    expect(settlement.openExceptionCount).toBe(1)
  })

  it('usa la decisión humana si existe', () => {
    const approved = receipt('a', 9_200, 'REVISION')
    approved.humanDecision = {
      verdict: 'PROCEDE',
      note: 'Fecha justificada',
      decidedAt: '2026-09-14T10:00:00.000Z',
      decidedBy: 'contador',
    }
    const settlement = settleTrip(DEMO_TRIP, [approved], [])
    expect(settlement.approvedTotal.amount).toBe(9_200)
    expect(settlement.revisionCount).toBe(0)
    expect(settlement.procedeCount).toBe(1)
  })
})
