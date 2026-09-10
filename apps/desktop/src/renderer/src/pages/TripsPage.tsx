import { useState } from 'react'
import { formatMoney, type WorkspaceSnapshot } from '@viaticocero/core'
import type { DesktopApi } from '../../../adapters/driving/renderer-bridge/index.ts'

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
    <div>
      <div className="page-head">
        <div>
          <h1>Viajes</h1>
          <p>El comprobante vive en un viaje. Sin ventana de fechas no hay veredicto útil.</p>
        </div>
      </div>
      <div className="detail">
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Destino</th>
                <th>Período</th>
                <th>Adelanto</th>
                <th>Estado</th>
                <th>Comprobantes</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.trips.map((trip) => (
                <tr key={trip.id} className="clickable" onClick={() => onOpenTrip(trip.id)}>
                  <td>{trip.destination}</td>
                  <td className="mono">
                    {trip.startDate} – {trip.endDate}
                  </td>
                  <td>{formatMoney(trip.advance)}</td>
                  <td>{trip.status === 'open' ? 'Abierto' : 'Liquidado'}</td>
                  <td>{snapshot.receipts.filter((item) => item.tripId === trip.id).length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form
          className="card"
          onSubmit={(event) => {
            event.preventDefault()
            void createTrip()
          }}
        >
          <strong>Registrar viaje</strong>
          <div className="form-grid" style={{ marginTop: 12 }}>
            <label>
              Destino
              <input value={destination} onChange={(event) => setDestination(event.target.value)} />
            </label>
            <label>
              Inicio
              <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            </label>
            <label>
              Fin
              <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
            </label>
            <label>
              Adelanto
              <input type="number" value={advance} onChange={(event) => setAdvance(Number(event.target.value))} />
            </label>
          </div>
          <label style={{ marginTop: 12 }}>
            Motivo
            <input value={purpose} onChange={(event) => setPurpose(event.target.value)} />
          </label>
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn primary" type="submit" disabled={!traveler}>
              Crear viaje
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
