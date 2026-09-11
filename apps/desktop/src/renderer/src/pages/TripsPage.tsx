import { useState } from 'react'
import {
  Button,
  DatePicker,
  DatePickerInput,
  Form,
  NumberInput,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
  TextInput,
} from '@carbon/react'
import { formatMoney, type WorkspaceSnapshot } from '@viaticocero/core'
import { formatDisplayDate } from '@viaticocero/ui-tokens'
import { PageScaffold } from '../components/PageScaffold'
import { toIsoDate } from '../lib/isoDate'
import type { DesktopApi } from '../../../ports/desktop-api.ts'

type Props = {
  snapshot: WorkspaceSnapshot
  api: DesktopApi
  onChange: () => Promise<void>
  selectedTripId?: string
  onSelectTrip: (tripId: string) => void
  onOpenReceipts: (tripId: string) => void
}

export function TripsPage({
  snapshot,
  api,
  onChange,
  selectedTripId,
  onSelectTrip,
  onOpenReceipts,
}: Props) {
  const traveler = snapshot.travelers[0]
  const [destination, setDestination] = useState('Puntarenas')
  const [startDate, setStartDate] = useState('2026-09-15')
  const [endDate, setEndDate] = useState('2026-09-17')
  const [advance, setAdvance] = useState(80_000)
  const [purpose, setPurpose] = useState('Seguimiento comercial')

  async function createTrip() {
    if (!traveler) return
    const trip = (await api.registerTrip({
      travelerId: traveler.id,
      destination,
      startDate,
      endDate,
      advanceAmount: Number(advance),
      purpose,
    })) as { id: string }
    await onChange()
    onSelectTrip(trip.id)
  }

  return (
    <PageScaffold
      title="Viajes"
      subtitle="Paso 1: el viaje es el marco. Fechas, destino y adelanto. Cada comprobante se compara contra este período."
    >
      <TableContainer>
        <Table size="lg" aria-label="Viajes">
          <TableHead>
            <TableRow>
              <TableHeader>Destino</TableHeader>
              <TableHeader>Período</TableHeader>
              <TableHeader>Adelanto</TableHeader>
              <TableHeader>Estado</TableHeader>
              <TableHeader>Comprobantes</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {snapshot.trips.map((trip) => {
              const selected = trip.id === selectedTripId
              return (
                <TableRow
                  key={trip.id}
                  onClick={() => onSelectTrip(trip.id)}
                  className={selected ? 'cds--data-table--selected' : undefined}
                >
                  <TableCell>{trip.destination}</TableCell>
                  <TableCell className="vz-num">
                    {formatDisplayDate(trip.startDate)} – {formatDisplayDate(trip.endDate)}
                  </TableCell>
                  <TableCell className="vz-num">{formatMoney(trip.advance)}</TableCell>
                  <TableCell>
                    <Tag type={trip.status === 'open' ? 'blue' : 'green'} size="sm">
                      {trip.status === 'open' ? 'Abierto' : 'Liquidado'}
                    </Tag>
                  </TableCell>
                  <TableCell>
                    <div className="vz-trip-row-actions">
                      {snapshot.receipts.filter((item) => item.tripId === trip.id).length}
                      <Button
                        kind="ghost"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation()
                          onOpenReceipts(trip.id)
                        }}
                      >
                        Ver gastos
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Form
        aria-label="Registrar viaje"
        onSubmit={(event) => {
          event.preventDefault()
          void createTrip()
        }}
      >
        <h3 className="cds--heading-compact-01">Registrar otro viaje</h3>
        <p className="cds--label-01">
          El viaje demo (Liberia, 10–14 Sep) ya está cargado. Crea otro si quieres probar un período distinto.
        </p>
        <TextInput
          id="destino"
          labelText="Destino"
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
        />
        <DatePicker
          datePickerType="single"
          dateFormat="Y-m-d"
          value={startDate}
          onChange={(dates) => {
            const next = dates[0]
            if (next) setStartDate(toIsoDate(next))
          }}
        >
          <DatePickerInput id="inicio" labelText="Inicio" placeholder="yyyy-mm-dd" />
        </DatePicker>
        <DatePicker
          datePickerType="single"
          dateFormat="Y-m-d"
          value={endDate}
          onChange={(dates) => {
            const next = dates[0]
            if (next) setEndDate(toIsoDate(next))
          }}
        >
          <DatePickerInput id="fin" labelText="Fin" placeholder="yyyy-mm-dd" />
        </DatePicker>
        <NumberInput
          id="adelanto"
          label="Adelanto"
          value={advance}
          hideSteppers
          onChange={(_, state) => setAdvance(Number(state.value))}
        />
        <TextInput
          id="motivo"
          labelText="Motivo del viaje"
          value={purpose}
          onChange={(event) => setPurpose(event.target.value)}
        />
        <Button type="submit" disabled={!traveler}>
          Crear viaje
        </Button>
      </Form>
    </PageScaffold>
  )
}
