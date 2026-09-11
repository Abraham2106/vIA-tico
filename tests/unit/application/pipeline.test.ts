import { describe, expect, it } from 'vitest'
import {
  createWorkspace,
  createMemoryDeps,
  seedDemoWorkspace,
  SequenceIdGenerator,
  FixedClock,
  UnwiredLanguageModel,
  type ILanguageModel,
} from '@viaticocero/core'
import type { VisionResult } from '@viaticocero/contracts'
import { DEMO_TRIP } from '@viaticocero/core'

describe('pipeline de expediente (sin QVAC)', () => {
  it('siembra el demo: 6 PROCEDE y 2 REVISIÓN', async () => {
    const workspace = await seedDemoWorkspace()
    const snap = await workspace.snapshot()
    const verdicts = snap.receipts.map((item) => item.verdict)
    expect(verdicts.filter((v) => v === 'PROCEDE')).toHaveLength(6)
    expect(verdicts.filter((v) => v === 'REVISION')).toHaveLength(2)
    expect(snap.exceptions.filter((item) => item.status === 'open')).toHaveLength(2)
    const codes = snap.receipts.flatMap((item) => item.triggeredRules.map((rule) => rule.code))
    expect(codes).toContain('FECHA_FUERA_PERIODO')
    expect(codes).toContain('DUPLICADO')
    expect(snap.auditEvents.length).toBeGreaterThan(0)
    expect(snap.auditEvents.some((item) => item.action === 'verdict')).toBe(true)
    expect(snap.auditEvents.some((item) => item.action === 'open-exception')).toBe(true)
  })

  it('ingesta un analysis-job y abre excepción por confianza media', async () => {
    const deps = createMemoryDeps()
    deps.ids = new SequenceIdGenerator()
    const workspace = createWorkspace(deps)
    await workspace.deps.travelers.save({ id: 't1', name: 'Ana' })
    const trip = await workspace.registerTrip({
      travelerId: 't1',
      destination: 'San José',
      startDate: '2026-09-10',
      endDate: '2026-09-14',
      advanceAmount: 50_000,
    })
    const receipt = await workspace.ingestVisionResult({
      id: 'job-media',
      tripId: trip.id,
      createdAt: '2026-09-12T10:00:00.000Z',
      sourceDeviceId: 'pixel-1',
      status: 'pending',
      visionResult: {
        proveedor: 'Taxi',
        fecha: '2026-09-12',
        monto: 4000,
        moneda: 'CRC',
        tipo_documento: 'recibo',
        confianza_lectura: 'media',
        raw_text: 'TAXI 4000',
        categoria: 'otro',
      },
    })
    expect(receipt.verdict).toBe('REVISION')
    const jobs = await workspace.deps.jobs.list()
    expect(jobs[0]?.status).toBe('ingested')
    const after = await workspace.snapshot()
    expect(after.auditEvents.some((item) => item.action === 'register-trip' && item.tripId === trip.id)).toBe(
      true,
    )
    expect(after.auditEvents.some((item) => item.action === 'verdict' && item.receiptId === receipt.id)).toBe(
      true,
    )
  })

  it('descarta postproceso que altera dígitos y marca REVISIÓN', async () => {
    const deps = createMemoryDeps()
    const tamper: ILanguageModel = {
      status: () => 'ready',
      async refine(extraction: VisionResult) {
        return { ...extraction, monto: 1500 }
      },
      async classifyMotive() {
        return { categoria: 'alimentacion', razon: 'mock', confianza_clasificacion: 'alta' }
      },
    }
    deps.languageModel = tamper
    deps.clock = new FixedClock('2026-09-12T15:00:00.000Z')
    const workspace = createWorkspace(deps)
    await workspace.deps.travelers.save({ id: DEMO_TRIP.travelerId, name: 'María Soto' })
    await workspace.deps.trips.save(DEMO_TRIP)
    const receipt = await workspace.attachReceipt({
      tripId: DEMO_TRIP.id,
      extraction: {
        proveedor: 'Soda',
        fecha: '2026-09-12',
        monto: 8500,
        moneda: 'CRC',
        tipo_documento: 'recibo',
        confianza_lectura: 'alta',
        raw_text: 'SODA 8500',
        categoria: 'alimentacion',
      },
    })
    expect(receipt.usedExtraction.monto).toBe(8500)
    expect(receipt.verdict).toBe('REVISION')
    expect(receipt.triggeredRules.map((rule) => rule.code)).toContain('DIGITOS_ALTERADOS')
    const discarded = receipt.audit.find((entry) => entry.action === 'postprocess-discarded')
    expect(discarded?.detail).toContain('monto')
    const snap = await workspace.snapshot()
    expect(snap.auditEvents.some((event) => event.action === 'postprocess-discarded' && event.detail?.includes('monto'))).toBe(
      true,
    )
  })

  it('no deja que un LLM no cableado cambie el veredicto', async () => {
    const deps = createMemoryDeps()
    expect(deps.languageModel).toBeInstanceOf(UnwiredLanguageModel)
    expect(deps.languageModel.status()).toBe('not-wired')
    const workspace = createWorkspace(deps)
    await workspace.deps.travelers.save({ id: DEMO_TRIP.travelerId, name: 'María Soto' })
    await workspace.deps.trips.save(DEMO_TRIP)
    const receipt = await workspace.attachReceipt({
      tripId: DEMO_TRIP.id,
      extraction: {
        proveedor: 'Peaje San Ramón',
        fecha: '2026-09-11',
        monto: 1200,
        moneda: 'CRC',
        tipo_documento: 'ticket',
        confianza_lectura: 'alta',
        raw_text: 'PEAJE 1200',
        categoria: 'peaje',
      },
    })
    expect(receipt.linguisticPostprocess).toBeUndefined()
    expect(receipt.verdict).toBe('PROCEDE')
  })

  it('aplica categoria de classify-motive solo con confianza alta y sin categoria previa', async () => {
    const deps = createMemoryDeps()
    deps.languageModel = {
      status: () => 'ready',
      refine: async (extraction) => extraction,
      classifyMotive: async () => ({
        categoria: 'representacion',
        razon: 'Almuerzo con cliente',
        confianza_clasificacion: 'alta',
      }),
    }
    deps.clock = new FixedClock('2026-09-12T15:00:00.000Z')
    const workspace = createWorkspace(deps)
    await workspace.deps.travelers.save({ id: DEMO_TRIP.travelerId, name: 'María Soto' })
    await workspace.deps.trips.save(DEMO_TRIP)
    const receipt = await workspace.attachReceipt({
      tripId: DEMO_TRIP.id,
      extraction: {
        proveedor: 'Restaurante',
        fecha: '2026-09-12',
        monto: 12_000,
        moneda: 'CRC',
        tipo_documento: 'factura',
        confianza_lectura: 'alta',
        raw_text: 'ALMUERZO 12000',
        motivo: 'Almorcé con el cliente regional',
      },
    })
    expect(receipt.usedExtraction.categoria).toBe('representacion')
    expect(receipt.motiveClassification?.confianza_clasificacion).toBe('alta')
    expect(receipt.verdict).toBe('PROCEDE')
  })

  it('confianza de clasificación media fuerza REVISIÓN y no inventa categoria', async () => {
    const deps = createMemoryDeps()
    deps.languageModel = {
      status: () => 'ready',
      refine: async (extraction) => extraction,
      classifyMotive: async () => ({
        categoria: 'otro',
        razon: 'Motivo vago',
        confianza_clasificacion: 'media',
      }),
    }
    deps.clock = new FixedClock('2026-09-12T15:00:00.000Z')
    const workspace = createWorkspace(deps)
    await workspace.deps.travelers.save({ id: DEMO_TRIP.travelerId, name: 'María Soto' })
    await workspace.deps.trips.save(DEMO_TRIP)
    const receipt = await workspace.attachReceipt({
      tripId: DEMO_TRIP.id,
      extraction: {
        proveedor: 'Tienda',
        fecha: '2026-09-12',
        monto: 3000,
        moneda: 'CRC',
        tipo_documento: 'recibo',
        confianza_lectura: 'alta',
        raw_text: 'TIENDA 3000',
        motivo: 'Compré unas cosas para el viaje',
      },
    })
    expect(receipt.usedExtraction.categoria).toBeUndefined()
    expect(receipt.triggeredRules.map((rule) => rule.code)).toContain('CONFIANZA_CLASIFICACION')
    expect(receipt.verdict).toBe('REVISION')
  })

  it('resolver excepción aprueba y entra a liquidación', async () => {
    const workspace = await seedDemoWorkspace()
    const snap = await workspace.snapshot()
    const exception = snap.exceptions.find((item) =>
      item.rules.some((rule) => rule.code === 'FECHA_FUERA_PERIODO'),
    )
    expect(exception).toBeTruthy()
    await workspace.resolveException({
      exceptionId: exception!.id,
      action: 'approve',
      note: 'Extensión del viaje autorizada',
      by: 'contador',
    })
    const settlement = await workspace.settleTrip(DEMO_TRIP.id)
    expect(settlement.revisionCount).toBe(1)
    expect(settlement.procedeCount).toBe(7)
    const after = await workspace.snapshot()
    expect(after.auditEvents.some((event) => event.action === 'approve' && event.actor === 'human')).toBe(true)
  })

  it('no cierra viaje con excepciones abiertas', async () => {
    const workspace = await seedDemoWorkspace()
    await expect(workspace.closeTrip(DEMO_TRIP.id)).rejects.toThrow(/excepciones abiertas/)
  })
})
