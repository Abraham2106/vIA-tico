import { Button, Select, SelectItem } from '@carbon/react'
import { formatMoney, type Trip, type WorkspaceSnapshot } from '@viaticocero/core'
import { formatDisplayDate } from '@viaticocero/ui-tokens'
import { statsForTrip } from '../lib/tripView'

type RouteId = 'inicio' | 'viajes' | 'comprobantes' | 'recibir' | 'revisar' | 'liquidacion' | 'exportar' | 'ajustes'

type Props = {
  snapshot: WorkspaceSnapshot
  trip?: Trip
  onSelectTrip: (tripId: string) => void
  onNavigate: (route: RouteId) => void
}

export function TripContextBar({ snapshot, trip, onSelectTrip, onNavigate }: Props) {
  if (snapshot.trips.length === 0) {
    return (
      <div className="vz-trip-bar" role="region" aria-label="Viaje actual">
        <p className="vz-trip-bar__copy">Todavía no hay un viaje. Empieza por registrar el período y el adelanto.</p>
        <Button size="sm" onClick={() => onNavigate('viajes')}>
          Registrar viaje
        </Button>
      </div>
    )
  }

  if (!trip) return null
  const stats = statsForTrip(snapshot, trip)

  return (
    <div className="vz-trip-bar" role="region" aria-label="Viaje en contexto">
      <Select
        id="trip-context"
        labelText="Viaje en contexto"
        hideLabel
        size="md"
        value={trip.id}
        onChange={(event) => onSelectTrip(event.target.value)}
      >
        {snapshot.trips.map((item) => (
          <SelectItem
            key={item.id}
            value={item.id}
            text={`${item.destination} · ${formatDisplayDate(item.startDate)}`}
          />
        ))}
      </Select>
      <p className="vz-trip-bar__meta">
        <span className="vz-num">
          {formatDisplayDate(trip.startDate)} – {formatDisplayDate(trip.endDate)}
        </span>
        <span aria-hidden="true"> · </span>
        adelanto {formatMoney(trip.advance)}
        <span aria-hidden="true"> · </span>
        {stats.openExceptionCount === 0
          ? 'nada pendiente de persona'
          : `${stats.openExceptionCount} por revisar`}
      </p>
      <div className="vz-trip-bar__actions">
        <Button kind="ghost" size="sm" onClick={() => onNavigate('comprobantes')}>
          Comprobantes
        </Button>
        {stats.openExceptionCount > 0 ? (
          <Button kind="secondary" size="sm" onClick={() => onNavigate('revisar')}>
            Por revisar ({stats.openExceptionCount})
          </Button>
        ) : (
          <Button kind="ghost" size="sm" onClick={() => onNavigate('liquidacion')}>
            Liquidación
          </Button>
        )}
      </div>
    </div>
  )
}
