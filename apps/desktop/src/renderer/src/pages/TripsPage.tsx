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
  onOpenTrip: (tripId: string) => void
}

export function TripsPage({ snapshot, api, onChange, onOpenTrip }: Props) {
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
    onOpenTrip(trip.id)
  }

  return (
    <PageScaffold
      title="Viajes"
      subtitle="El comprobante vive en un viaje. Sin ventana de fechas no hay veredicto útil."
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
            {snapshot.trips.map((trip) => (
              <TableRow key={trip.id} onClick={() => onOpenTrip(trip.id)}>
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
                <TableCell>{snapshot.receipts.filter((item) => item.tripId === trip.id).length}</TableCell>
              </TableRow>
            ))}
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
        <h3 className="cds--heading-compact-01">Registrar viaje</h3>
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
          labelText="Motivo"
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
