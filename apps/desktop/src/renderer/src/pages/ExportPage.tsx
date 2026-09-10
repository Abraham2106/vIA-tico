import { useState } from 'react'
import type { ExportFormat } from '@viaticocero/contracts'
import type { WorkspaceSnapshot } from '@viaticocero/core'
import type { DesktopApi } from '../../../adapters/driving/renderer-bridge/index.ts'

type Props = {
  snapshot: WorkspaceSnapshot
  api: DesktopApi
}

function download(filename: string, mime: string, body: string | Uint8Array) {
  const part = typeof body === 'string' ? body : body.buffer as ArrayBuffer
  const blob = new Blob([part], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function ExportPage({ snapshot, api }: Props) {
  const [tripId, setTripId] = useState(snapshot.trips[0]?.id ?? '')
  const [includeRaw, setIncludeRaw] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  async function run(format: ExportFormat) {
    const artifact = await api.exportReport({ tripId, format, includeRaw })
    download(artifact.filename, artifact.mimeType, artifact.body)
    setMessage(`Exportado ${artifact.filename}`)
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Exportar</h1>
          <p>PDF, CSV, XLSX y JSON locales. Sin ERP ni nube.</p>
        </div>
      </div>
      <div className="card" style={{ maxWidth: 560 }}>
        <label>
          Viaje
          <select value={tripId} onChange={(event) => setTripId(event.target.value)}>
            {snapshot.trips.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.destination} ({trip.startDate})
              </option>
            ))}
          </select>
        </label>
        <label style={{ marginTop: 12 }}>
          <span className="row">
            <input
              type="checkbox"
              checked={includeRaw}
              onChange={(event) => setIncludeRaw(event.target.checked)}
              style={{ width: 'auto' }}
            />
            Incluir RAW de visión
          </span>
        </label>
        <div className="row" style={{ marginTop: 16 }}>
          <button className="btn primary" onClick={() => void run('json')}>
            JSON
          </button>
          <button className="btn" onClick={() => void run('csv')}>
            CSV
          </button>
          <button className="btn" onClick={() => void run('xlsx')}>
            Excel
          </button>
          <button className="btn" onClick={() => void run('pdf')}>
            PDF
          </button>
        </div>
        {message ? <p className="muted">{message}</p> : null}
      </div>
    </div>
  )
}
