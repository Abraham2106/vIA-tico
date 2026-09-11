import { describe, expect, it } from 'vitest'
import {
  parseAnalysisJob,
  parseAuditEvent,
  parseMotiveClassification,
  parsePairingPayload,
  parseVisionResult,
  safeParseMotiveClassification,
  safeParseVisionResult,
} from '@viaticocero/contracts'

describe('vision-result schema', () => {
  it('acepta un DTO válido', () => {
    const value = parseVisionResult({
      proveedor: 'Soda La Casita',
      fecha: '2026-09-12',
      monto: 8500,
      moneda: 'CRC',
      tipo_documento: 'recibo',
      confianza_lectura: 'alta',
      raw_text: 'SODA LA CASITA 8500',
      categoria: 'alimentacion',
    })
    expect(value.monto).toBe(8500)
  })

  it('rechaza fecha que no es YYYY-MM-DD', () => {
    const parsed = safeParseVisionResult({
      proveedor: 'X',
      fecha: '12/09/2026',
      monto: 1,
      moneda: 'CRC',
      tipo_documento: 'recibo',
      confianza_lectura: 'alta',
      raw_text: '',
    })
    expect(parsed.success).toBe(false)
  })
})

describe('analysis-job y pairing', () => {
  it('parsea un job', () => {
    const job = parseAnalysisJob({
      id: 'job-1',
      tripId: 'trip-1',
      createdAt: '2026-09-12T10:00:00.000Z',
      sourceDeviceId: 'pixel-1',
      visionResult: {
        proveedor: 'Peaje',
        fecha: '2026-09-12',
        monto: 1200,
        moneda: 'CRC',
        tipo_documento: 'ticket',
        confianza_lectura: 'alta',
        raw_text: 'PEAJE 1200',
      },
      status: 'pending',
    })
    expect(job.status).toBe('pending')
  })

  it('parsea pairing DTO (sin exigir clave QVAC)', () => {
    const pairing = parsePairingPayload({
      desktopDeviceId: 'desk-1',
      desktopName: 'PC Contabilidad',
      pairingCode: '210614',
      transport: 'dto',
      createdAt: '2026-09-10T00:00:00.000Z',
    })
    expect(pairing.qvacProviderPublicKey).toBeUndefined()
  })
})

describe('audit-event', () => {
  it('acepta un evento sin veredicto de modelo', () => {
    const event = parseAuditEvent({
      id: 'evt-1',
      at: '2026-09-12T10:00:00.000Z',
      actor: 'system',
      action: 'verdict',
      detail: 'REVISION',
      receiptId: 'r-1',
      tripId: 't-1',
    })
    expect(event.actor).toBe('system')
  })
})

describe('motive-classification', () => {
  it('acepta categoria + razon + confianza y rechaza veredicto', () => {
    const value = parseMotiveClassification({
      categoria: 'representacion',
      razon: 'Reunión con cliente',
      confianza_clasificacion: 'alta',
    })
    expect(value.categoria).toBe('representacion')
    const rejected = safeParseMotiveClassification({
      categoria: 'representacion',
      razon: 'Reunión con cliente',
      confianza_clasificacion: 'alta',
      veredicto: 'PROCEDE',
    })
    expect(rejected.success).toBe(false)
  })
})
