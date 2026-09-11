import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { QvacLanguageModelStub } from '../src/adapters/driven/qvac-llm/stub.ts'
import { openNodeSqlite } from '../src/adapters/driven/persistence/open-node.ts'
import { assembleDesktopWorkspace } from '../src/composition/assemble-workspace.ts'

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
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
