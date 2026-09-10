import { useState } from 'react'
import { Button, Checkbox, Select, SelectItem, Stack } from '@carbon/react'
import type { ExportFormat } from '@viaticocero/contracts'
import type { WorkspaceSnapshot } from '@viaticocero/core'
import { PageScaffold } from '../components/PageScaffold'
import type { DesktopApi } from '../../../adapters/driving/renderer-bridge/index.ts'

type Props = {
  snapshot: WorkspaceSnapshot
  api: DesktopApi
}

function download(filename: string, mime: string, body: string | Uint8Array) {
  const part = typeof body === 'string' ? body : (body.buffer as ArrayBuffer)
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
    <PageScaffold title="Exportar" subtitle="PDF, CSV, XLSX y JSON locales. Sin ERP ni nube.">
      <Stack gap={5} style={{ maxWidth: '32rem' }}>
        <Select id="export-trip" labelText="Viaje" value={tripId} onChange={(event) => setTripId(event.target.value)}>
          {snapshot.trips.map((trip) => (
            <SelectItem key={trip.id} value={trip.id} text={`${trip.destination} (${trip.startDate})`} />
          ))}
        </Select>
        <Checkbox
          id="include-raw"
          labelText="Incluir RAW de visión"
          checked={includeRaw}
          onChange={(_, { checked }) => setIncludeRaw(checked)}
        />
        <Stack gap={3} orientation="horizontal">
          <Button onClick={() => void run('json')}>JSON</Button>
          <Button kind="secondary" onClick={() => void run('csv')}>
            CSV
          </Button>
          <Button kind="secondary" onClick={() => void run('xlsx')}>
            Excel
          </Button>
          <Button kind="tertiary" onClick={() => void run('pdf')}>
            PDF
          </Button>
        </Stack>
        {message ? <p className="cds--label-01">{message}</p> : null}
      </Stack>
    </PageScaffold>
  )
}
