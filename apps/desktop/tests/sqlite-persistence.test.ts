import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { DEMO_TRAVELER, DEMO_TRIP } from '@viaticocero/core'
import { QvacLanguageModelStub } from '../src/adapters/driven/qvac-llm/stub.ts'
import { openNodeSqlite } from '../src/adapters/driven/persistence/open-node.ts'
import {
  applySchema,
  createSqliteRepositories,
} from '../src/adapters/driven/persistence/index.ts'
import { assembleDesktopWorkspace } from '../src/composition/assemble-workspace.ts'
import { writeJson } from '../src/adapters/driven/persistence/json.ts'

const stub = new QvacLanguageModelStub()

describe('persistencia SQLite del escritorio', () => {
  it('siembra el demo en SQLite y conserva 6 PROCEDE + 2 REVISIÓN', async () => {
    const opened = await openNodeSqlite(':memory:')
    const { workspace, storageInfo } = await assembleDesktopWorkspace(stub, opened)
    const snap = await workspace.snapshot()
    expect(storageInfo.engine).toBe('sqlite3')
    expect(storageInfo.driver).toBe('node:sqlite')
    expect(snap.receipts).toHaveLength(8)
    expect(snap.receipts.filter((item) => item.verdict === 'PROCEDE')).toHaveLength(6)
    expect(snap.exceptions.filter((item) => item.status === 'open')).toHaveLength(2)
    expect(snap.auditEvents.some((event) => event.action === 'verdict')).toBe(true)
    expect(snap.auditEvents.some((event) => event.action === 'open-exception')).toBe(true)
  })

  it('reescribe un comprobante sin romper la FK de excepciones', async () => {
    const opened = await openNodeSqlite(':memory:')
    const { workspace } = await assembleDesktopWorkspace(stub, opened)
    const snap = await workspace.snapshot()
    const open = snap.exceptions.find((item) => item.status === 'open')
    expect(open).toBeDefined()
    await workspace.resolveException({
      exceptionId: open!.id,
      action: 'approve',
      note: 'visto en caja',
      by: 'test',
    })
    const after = await workspace.snapshot()
    const resolved = after.exceptions.find((item) => item.id === open!.id)
    expect(resolved?.status).toBe('resolved')
    const receipt = after.receipts.find((item) => item.id === open!.receiptId)
    expect(receipt?.humanDecision?.verdict).toBe('PROCEDE')
    expect(after.auditEvents.some((event) => event.action === 'approve' && event.actor === 'human')).toBe(
      true,
    )
  })

  it('abre de nuevo el archivo .sqlite y no vuelve a sembrar el demo', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'vz-sqlite-'))
    const filePath = join(dir, 'viaticocero.sqlite')
    try {
      const first = await assembleDesktopWorkspace(stub, await openNodeSqlite(filePath))
      const created = await first.workspace.registerTrip({
        travelerId: (await first.workspace.snapshot()).travelers[0]!.id,
        destination: 'Cartago',
        startDate: '2026-10-01',
        endDate: '2026-10-03',
        advanceAmount: 40_000,
      })
      const rotated = await first.workspace.pairDevices.rotate()

      const second = await assembleDesktopWorkspace(stub, await openNodeSqlite(filePath), {
        skipDemoSeed: false,
      })
      const snap = await second.workspace.snapshot()
      expect(second.storageInfo.location).toBe('file')
      expect(snap.trips.some((trip) => trip.id === created.id)).toBe(true)
      expect(snap.trips).toHaveLength(2)
      expect(snap.pairing.pairingCode).toBe(rotated.pairingCode)
      expect(snap.receipts).toHaveLength(8)
      expect(snap.auditEvents.some((event) => event.action === 'register-trip' && event.detail === 'Cartago')).toBe(
        true,
      )
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('rellena audit_events desde receipts.audit_json al subir de esquema v1', async () => {
    const opened = await openNodeSqlite(':memory:')
    applySchema(opened.session, '2026-09-11T00:00:00.000Z')
    const repos = createSqliteRepositories(opened.session)
    await repos.travelers.save(DEMO_TRAVELER)
    await repos.trips.save(DEMO_TRIP)
    await repos.receipts.save({
      id: 'r-legacy',
      tripId: DEMO_TRIP.id,
      capturedAt: '2026-09-12T10:00:00.000Z',
      extraction: {
        proveedor: 'Soda',
        fecha: '2026-09-12',
        monto: 1000,
        moneda: 'CRC',
        tipo_documento: 'recibo',
        confianza_lectura: 'alta',
        raw_text: 'SODA 1000',
      },
      usedExtraction: {
        proveedor: 'Soda',
        fecha: '2026-09-12',
        monto: 1000,
        moneda: 'CRC',
        tipo_documento: 'recibo',
        confianza_lectura: 'alta',
        raw_text: 'SODA 1000',
      },
      verdict: 'PROCEDE',
      triggeredRules: [],
      audit: [
        { at: '2026-09-12T10:00:00.000Z', actor: 'vision', action: 'extract' },
        { at: '2026-09-12T10:00:00.000Z', actor: 'system', action: 'verdict', detail: 'PROCEDE' },
      ],
    })
    opened.session.run('DELETE FROM audit_events')
    opened.session.run(
      `INSERT INTO meta (key, value_json) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json`,
      ['schema_version', writeJson(1)],
    )
    applySchema(opened.session, '2026-09-11T12:00:00.000Z')
    const events = await repos.auditLog.list({ receiptId: 'r-legacy' })
    expect(events).toHaveLength(2)
    expect(events.map((item) => item.action)).toEqual(['extract', 'verdict'])
  })
})
