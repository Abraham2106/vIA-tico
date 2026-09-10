import { useState } from 'react'
import { parseAnalysisJob } from '@viaticocero/contracts'
import { type WorkspaceSnapshot } from '@viaticocero/core'
import type { DesktopApi } from '../../../adapters/driving/renderer-bridge/index.ts'

type Props = {
  snapshot: WorkspaceSnapshot
  api: DesktopApi
  onChange: () => Promise<void>
}

const SAMPLE = `{
  "id": "job-manual-1",
  "tripId": "trip-liberia-sep",
  "createdAt": "2026-09-12T16:00:00.000Z",
  "sourceDeviceId": "pixel-demo",
  "status": "pending",
  "visionResult": {
    "proveedor": "Uber",
    "fecha": "2026-09-12",
    "monto": 4200,
    "moneda": "CRC",
    "tipo_documento": "recibo",
    "confianza_lectura": "alta",
    "raw_text": "UBER 4200",
    "categoria": "otro"
  }
}`

export function InboxPage({ snapshot, api, onChange }: Props) {
  const [raw, setRaw] = useState(SAMPLE)
  const [message, setMessage] = useState<string | null>(null)

  async function ingest() {
    try {
      const job = parseAnalysisJob(JSON.parse(raw))
      await api.ingestJob(job)
      setMessage(`Ingestado ${job.id}`)
      await onChange()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error))
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Inbox</h1>
          <p>Camino de producto: analysis-job JSON (teléfono → escritorio). No es delegated inference.</p>
        </div>
      </div>
      <div className="detail">
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Job</th>
                <th>Viaje</th>
                <th>Proveedor</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.jobs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="muted">
                    Vacío. Pega un DTO o impórtalo desde el móvil.
                  </td>
                </tr>
              ) : (
                snapshot.jobs.map((job) => (
                  <tr key={job.id}>
                    <td className="mono">{job.id}</td>
                    <td className="mono">{job.tripId ?? '—'}</td>
                    <td>{job.visionResult.proveedor}</td>
                    <td>{job.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="card">
          <strong>Pegar analysis-job</strong>
          <textarea
            className="mono"
            rows={16}
            value={raw}
            onChange={(event) => setRaw(event.target.value)}
            style={{ marginTop: 10 }}
          />
          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn primary" onClick={() => void ingest()}>
              Ingestar
            </button>
            {message ? <span className="muted">{message}</span> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
