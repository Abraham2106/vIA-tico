import { useState } from 'react'
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow, TextArea } from '@carbon/react'
import { parseAnalysisJob } from '@viaticocero/contracts'
import { type WorkspaceSnapshot } from '@viaticocero/core'
import { AppEmptyState } from '../components/AppEmptyState'
import { PageScaffold } from '../components/PageScaffold'
import type { DesktopApi } from '../../../ports/desktop-api.ts'

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
    <PageScaffold
      title="Inbox"
      subtitle="analysis-job JSON del teléfono al escritorio. No es delegated inference."
    >
      {snapshot.jobs.length === 0 ? (
        <AppEmptyState title="Inbox vacío" subtitle="Pega un analysis-job o envíalo desde el celular." />
      ) : (
        <TableContainer>
          <Table size="lg" aria-label="Jobs ingestados">
            <TableHead>
              <TableRow>
                <TableHeader>Job</TableHeader>
                <TableHeader>Viaje</TableHeader>
                <TableHeader>Proveedor</TableHeader>
                <TableHeader>Estado</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {snapshot.jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="vz-num">{job.id}</TableCell>
                  <TableCell className="vz-num">{job.tripId ?? '—'}</TableCell>
                  <TableCell>{job.visionResult.proveedor}</TableCell>
                  <TableCell>{job.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <TextArea
        id="job-json"
        labelText="Pegar analysis-job"
        value={raw}
        onChange={(event) => setRaw(event.target.value)}
        rows={14}
        style={{ marginTop: '1.5rem', fontFamily: '"IBM Plex Mono", monospace' }}
      />
      <Button style={{ marginTop: '1rem' }} onClick={() => void ingest()}>
        Ingestar
      </Button>
      {message ? <p className="cds--label-01">{message}</p> : null}
    </PageScaffold>
  )
}
