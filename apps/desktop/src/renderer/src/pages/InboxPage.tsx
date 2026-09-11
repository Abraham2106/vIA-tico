import { useEffect, useMemo, useState } from 'react'
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
  tripId?: string
  onNeedTrip: () => void
  onIngested: () => void
}

function sampleJob(tripId: string) {
  return `{
  "id": ${JSON.stringify(`job-manual-${Date.now()}`)},
  "tripId": ${JSON.stringify(tripId)},
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
}

export function InboxPage({ snapshot, api, onChange, tripId, onNeedTrip, onIngested }: Props) {
  const defaultRaw = useMemo(() => (tripId ? sampleJob(tripId) : ''), [tripId])
  const [raw, setRaw] = useState(defaultRaw)
  const [message, setMessage] = useState<string | null>(null)
  const [technical, setTechnical] = useState(false)
  const jobs = snapshot.jobs.filter((job) => !tripId || job.tripId === tripId)

  useEffect(() => {
    setRaw(defaultRaw)
  }, [defaultRaw])

  async function ingest() {
    if (!tripId) {
      onNeedTrip()
      return
    }
    try {
      const source = technical ? (raw || defaultRaw).trim() : sampleJob(tripId)
      const job = parseAnalysisJob(JSON.parse(source))
      await api.ingestJob(job)
      setMessage(`Recibido ${job.visionResult.proveedor}. El código ya lo validó contra el viaje.`)
      await onChange()
      onIngested()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error))
    }
  }

  if (!tripId) {
    return (
      <PageScaffold title="Recibir gastos" subtitle="Paso 2: lo que el celular ya leyó entra aquí, no a Liquidación.">
        <AppEmptyState
          title="Primero el viaje"
          subtitle="Elige o registra un viaje. Sin período no se puede validar un ticket."
          action={{ text: 'Ir a Viajes', onClick: onNeedTrip }}
        />
      </PageScaffold>
    )
  }

  return (
    <PageScaffold
      title="Recibir gastos"
      subtitle="Paso 2: el teléfono extrae proveedor, fecha y monto. Este escritorio los guarda y los pasa por las reglas."
    >
      {jobs.length === 0 ? (
        <AppEmptyState
          title="Todavía no llegó nada del celular"
          subtitle="En el teléfono: Capturar → Revisar gasto → compartir. Mientras tanto puedes pegar el JSON de prueba."
        />
      ) : (
        <TableContainer>
          <Table size="lg" aria-label="Gastos recibidos">
            <TableHead>
              <TableRow>
                <TableHeader>Proveedor</TableHeader>
                <TableHeader>Viaje</TableHeader>
                <TableHeader>Estado</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>{job.visionResult.proveedor}</TableCell>
                  <TableCell className="vz-num">{job.tripId ?? '—'}</TableCell>
                  <TableCell>{job.status === 'ingested' ? 'Validado' : job.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <p className="cds--label-01" style={{ marginTop: '1.5rem' }}>
        El POST automático al inbox todavía no está en este preview. Pega el JSON o usa el ejemplo de Uber
        (dentro del período del viaje demo).
      </p>
      <Button kind="ghost" size="sm" onClick={() => setTechnical((value) => !value)}>
        {technical ? 'Ocultar JSON' : 'Mostrar JSON de ejemplo'}
      </Button>
      {technical ? (
        <>
          <TextArea
            id="job-json"
            labelText="JSON enviado por el celular"
            value={raw || defaultRaw}
            onChange={(event) => setRaw(event.target.value)}
            rows={14}
            style={{ marginTop: '1rem', fontFamily: '"IBM Plex Mono", monospace' }}
          />
          <Button style={{ marginTop: '1rem' }} onClick={() => void ingest()}>
            Validar y cargar
          </Button>
        </>
      ) : (
        <Button style={{ marginTop: '1rem' }} onClick={() => void ingest()}>
          Cargar ejemplo (Uber ₡4 200)
        </Button>
      )}
      {message ? <p className="cds--label-01">{message}</p> : null}
    </PageScaffold>
  )
}
