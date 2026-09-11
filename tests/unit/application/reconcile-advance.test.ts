import { describe, expect, it } from 'vitest'
import { createMemoryDeps, createReconcileAdvance, DEMO_TRIP } from '@viaticocero/core'

describe('reconcile-advance', () => {
  it('concilia adelanto, comprobantes respaldados y los montos aprobados', async () => {
    const deps = createMemoryDeps()
    await deps.trips.save(DEMO_TRIP)
    await deps.receipts.save({
      id: 'receipt-procede',
      tripId: DEMO_TRIP.id,
      capturedAt: '2026-09-12T12:00:00.000Z',
      extraction: {
        proveedor: 'Soda La Casita',
        fecha: '2026-09-12',
        monto: 8500,
        moneda: 'CRC',
        tipo_documento: 'recibo',
        confianza_lectura: 'alta',
        raw_text: 'SODA 8500',
      },
      usedExtraction: {
        proveedor: 'Soda La Casita',
        fecha: '2026-09-12',
        monto: 8500,
        moneda: 'CRC',
        tipo_documento: 'recibo',
        confianza_lectura: 'alta',
        raw_text: 'SODA 8500',
      },
      verdict: 'PROCEDE',
      triggeredRules: [],
      audit: [],
    })

    const settlement = await createReconcileAdvance(deps).execute(DEMO_TRIP.id)

    expect(settlement.backedTotal.amount).toBe(8500)
    expect(settlement.approvedTotal.amount).toBe(8500)
    expect(settlement.toReturn.amount).toBe(191_500)
    expect(settlement.procedeCount).toBe(1)
  })
})
