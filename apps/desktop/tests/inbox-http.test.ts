import { afterEach, describe, expect, it } from 'vitest'
import type { AnalysisJob } from '@viaticocero/contracts'
import { createInboxHttpServer, type InboxHttpServer } from '../src/adapters/driven/inbox-http/server.ts'

let inbox: InboxHttpServer | undefined

const job: AnalysisJob = {
  id: 'job-http-1',
  tripId: 'trip-demo',
  createdAt: '2026-09-12T16:00:00.000Z',
  sourceDeviceId: 'pixel-demo',
  status: 'pending',
  visionResult: {
    proveedor: 'Uber',
    fecha: '2026-09-12',
    monto: 4200,
    moneda: 'CRC',
    tipo_documento: 'recibo',
    confianza_lectura: 'alta',
    raw_text: 'UBER 4200',
    categoria: 'otro',
  },
}

afterEach(async () => {
  await inbox?.stop()
  inbox = undefined
})

async function start(options: { pairingCode?: string } = {}): Promise<string> {
  inbox = createInboxHttpServer({
    host: '127.0.0.1',
    port: 0,
    getPairingCode: options.pairingCode ? async () => options.pairingCode : undefined,
  })
  const status = await inbox.start()
  expect(status.listening).toBe(true)
  return `http://127.0.0.1:${status.port}`
}

describe('inbox HTTP del escritorio', () => {
  it('valida y encola un AnalysisJob enviado por POST', async () => {
    const baseUrl = await start()

    const response = await fetch(`${baseUrl}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job),
    })

    expect(response.status).toBe(202)
    await expect(response.json()).resolves.toMatchObject({ ok: true, id: job.id })
    const pending = await fetch(`${baseUrl}/jobs/pending`)
    await expect(pending.json()).resolves.toEqual({ jobs: [job] })
  })

  it('rechaza un AnalysisJob inválido', async () => {
    const baseUrl = await start()

    const response = await fetch(`${baseUrl}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'incompleto' }),
    })

    expect(response.status).toBe(400)
  })

  it('rechaza el código de emparejamiento incorrecto', async () => {
    const baseUrl = await start({ pairingCode: '654321' })

    const response = await fetch(`${baseUrl}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Pairing-Code': '000000',
      },
      body: JSON.stringify(job),
    })

    expect(response.status).toBe(401)
  })

  it('expone salud del inbox', async () => {
    const baseUrl = await start()

    const response = await fetch(`${baseUrl}/health`)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true, service: 'viaticocero-inbox' })
  })
})
