import { Button, Tag, Tile } from '@carbon/react'
import {
  Calculator,
  Email,
  Map,
  WarningAlt,
} from '@carbon/icons-react'
import { formatMoney, type WorkspaceSnapshot } from '@viaticocero/core'
import { formatDisplayDate } from '@viaticocero/ui-tokens'
import { PageScaffold } from '../components/PageScaffold'
import { statsForTrip, tripFromSnapshot } from '../lib/tripView'

export type AppRoute =
  | 'inicio'
  | 'viajes'
  | 'comprobantes'
  | 'recibir'
  | 'revisar'
  | 'liquidacion'
  | 'exportar'
  | 'ajustes'

type Props = {
  snapshot: WorkspaceSnapshot
  selectedTripId?: string
  onNavigate: (route: AppRoute) => void
}

const STEPS = [
  {
    id: 'viajes' as const,
    step: '1',
    title: 'Viaje',
    body: 'Destino, fechas y adelanto. Sin este marco el ticket no se puede validar.',
    icon: Map,
  },
  {
    id: 'recibir' as const,
    step: '2',
    title: 'Recibir gastos',
    body: 'El celular lee el comprobante. Aquí entra lo extraído, no una foto suelta.',
    icon: Email,
  },
  {
    id: 'revisar' as const,
    step: '3',
    title: 'Por revisar',
    body: 'Solo lo que no cuadra: fecha fuera, duplicado, confianza baja, tope.',
    icon: WarningAlt,
  },
  {
    id: 'liquidacion' as const,
    step: '4',
    title: 'Liquidar',
    body: 'Adelanto contra lo aprobado. Lo automático no pasa por esta cola.',
    icon: Calculator,
  },
]

export function InicioPage({ snapshot, selectedTripId, onNavigate }: Props) {
  const trip = tripFromSnapshot(snapshot, selectedTripId)
  const stats = trip ? statsForTrip(snapshot, trip) : null
  const openAll = snapshot.exceptions.filter((item) => item.status === 'open').length
  const next = nextAction(stats, snapshot.trips.length)

  return (
    <PageScaffold
      title="Inicio"
      subtitle="La IA lee el comprobante. El código decide si procede. Tú solo ves lo que no cuadra."
    >
      <section className="vz-home-lead" aria-labelledby="home-what">
        <h3 id="home-what" className="cds--heading-compact-01">
          Qué hace ViáticoCero
        </h3>
        <p>
          Liquida viáticos en este equipo. Un viaje es el contexto; cada recibo se compara con esas
          fechas, la política y los duplicados. El modelo nunca autoriza un pago.
        </p>
        <p className="cds--label-01">
          Aprobado = el código lo deja pasar (PROCEDE). Por revisar = una persona debe mirarlo.
        </p>
      </section>

      <ol className="vz-flow" aria-label="Flujo del producto">
        {STEPS.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.id}>
              <button type="button" className="vz-flow__tile" onClick={() => onNavigate(item.id)}>
                <span className="vz-flow__step">{item.step}</span>
                <Icon size={20} aria-hidden />
                <strong>{item.title}</strong>
                <span>{item.body}</span>
              </button>
            </li>
          )
        })}
      </ol>

      {stats && trip ? (
        <Tile className="vz-home-summary">
          <div className="vz-home-summary__head">
            <div>
              <p className="cds--label-01">Viaje en curso</p>
              <h3 className="cds--heading-compact-02">{trip.destination}</h3>
              <p className="cds--label-01">
                {stats.travelerName ? `${stats.travelerName} · ` : ''}
                {formatDisplayDate(trip.startDate)} – {formatDisplayDate(trip.endDate)}
                {trip.purpose ? ` · ${trip.purpose}` : ''}
              </p>
            </div>
            <Tag type={trip.status === 'open' ? 'blue' : 'green'} size="md">
              {trip.status === 'open' ? 'Abierto' : 'Liquidado'}
            </Tag>
          </div>
          <dl className="vz-home-kpis">
            <Kpi label="Adelanto" value={formatMoney(trip.advance)} />
            <Kpi label="Comprobantes" value={String(stats.receiptCount)} />
            <Kpi label="Aprobados" value={String(stats.procedeCount)} />
            <Kpi label="Por revisar" value={String(stats.openExceptionCount)} emphasize={stats.openExceptionCount > 0} />
          </dl>
          <div className="vz-home-summary__actions">
            <Button onClick={() => onNavigate(next.route)}>{next.label}</Button>
            <Button kind="secondary" onClick={() => onNavigate('viajes')}>
              Cambiar o crear viaje
            </Button>
          </div>
        </Tile>
      ) : (
        <Tile className="vz-home-summary">
          <h3 className="cds--heading-compact-02">Empieza por un viaje</h3>
          <p>
            Sin período no hay veredicto útil: un almuerzo del 25 de septiembre no cuadra en un viaje
            del 10 al 14.
          </p>
          <Button onClick={() => onNavigate('viajes')}>Registrar el primer viaje</Button>
        </Tile>
      )}

      {openAll > 0 ? (
        <div className="vz-home-queue">
          <p className="cds--label-01">
            Hay {openAll} {openAll === 1 ? 'gasto' : 'gastos'} que el código no pudo liquidar solo.
          </p>
          <Button kind="ghost" size="sm" onClick={() => onNavigate('revisar')}>
            Ir a la cola
          </Button>
        </div>
      ) : (
        <p className="cds--label-01">
          No hay cola humana. Lo que ya procede está en Liquidación y en Comprobantes.
        </p>
      )}
    </PageScaffold>
  )
}

function Kpi({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className={emphasize ? 'vz-home-kpis__item vz-home-kpis__item--warn' : 'vz-home-kpis__item'}>
      <dt>{label}</dt>
      <dd className="vz-num">{value}</dd>
    </div>
  )
}

function nextAction(
  stats: ReturnType<typeof statsForTrip> | null,
  tripCount: number,
): { route: AppRoute; label: string } {
  if (tripCount === 0) return { route: 'viajes', label: 'Registrar un viaje' }
  if (!stats) return { route: 'viajes', label: 'Registrar un viaje' }
  if (stats.openExceptionCount > 0) {
    return {
      route: 'revisar',
      label: `Revisar ${stats.openExceptionCount} ${stats.openExceptionCount === 1 ? 'excepción' : 'excepciones'}`,
    }
  }
  if (stats.receiptCount === 0) return { route: 'recibir', label: 'Recibir el primer gasto' }
  return { route: 'liquidacion', label: 'Ver la liquidación' }
}
