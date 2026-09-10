import { useMemo, useState } from 'react'
import { useWorkspace } from './hooks/useWorkspace'
import { ExceptionsPage } from './pages/ExceptionsPage'
import { ExportPage } from './pages/ExportPage'
import { InboxPage } from './pages/InboxPage'
import { ReceiptsPage } from './pages/ReceiptsPage'
import { SettingsPage } from './pages/SettingsPage'
import { SettlementPage } from './pages/SettlementPage'
import { TripsPage } from './pages/TripsPage'

const ROUTES = [
  { id: 'excepciones', label: 'Excepciones' },
  { id: 'viajes', label: 'Viajes' },
  { id: 'comprobantes', label: 'Comprobantes' },
  { id: 'inbox', label: 'Inbox' },
  { id: 'liquidacion', label: 'Liquidación' },
  { id: 'exportar', label: 'Exportar' },
  { id: 'ajustes', label: 'Ajustes' },
] as const

type RouteId = (typeof ROUTES)[number]['id']

export function App() {
  const { snapshot, error, api, reload } = useWorkspace()
  const [route, setRoute] = useState<RouteId>('excepciones')
  const [focusTripId, setFocusTripId] = useState<string | undefined>()

  const openCount = useMemo(
    () => snapshot?.exceptions.filter((item) => item.status === 'open').length ?? 0,
    [snapshot],
  )

  if (error) {
    return <div className="main">Error: {error}</div>
  }
  if (!snapshot || !api) {
    return <div className="main muted">Cargando expediente…</div>
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <strong>ViáticoCero</strong>
          <small>La IA interpreta; el código autoriza</small>
        </div>
        <nav>
          {ROUTES.map((item) => (
            <button
              key={item.id}
              className={`nav-btn ${route === item.id ? 'active' : ''}`}
              onClick={() => setRoute(item.id)}
            >
              <span>{item.label}</span>
              {item.id === 'excepciones' && openCount > 0 ? <span className="badge">{openCount}</span> : null}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          QVAC no está cableado. El motor de reglas y el centro de excepciones ya funcionan con DTO
          manual.
        </div>
      </aside>
      <main className="main">
        {route === 'excepciones' ? (
          <ExceptionsPage
            snapshot={snapshot}
            api={api}
            onChange={reload}
            onOpenTrip={(tripId) => {
              setFocusTripId(tripId)
              setRoute('comprobantes')
            }}
          />
        ) : null}
        {route === 'viajes' ? (
          <TripsPage
            snapshot={snapshot}
            api={api}
            onChange={reload}
            onOpenTrip={(tripId) => {
              setFocusTripId(tripId)
              setRoute('comprobantes')
            }}
          />
        ) : null}
        {route === 'comprobantes' ? (
          <ReceiptsPage snapshot={snapshot} api={api} onChange={reload} focusTripId={focusTripId} />
        ) : null}
        {route === 'inbox' ? <InboxPage snapshot={snapshot} api={api} onChange={reload} /> : null}
        {route === 'liquidacion' ? (
          <SettlementPage snapshot={snapshot} api={api} focusTripId={focusTripId} onChange={reload} />
        ) : null}
        {route === 'exportar' ? <ExportPage snapshot={snapshot} api={api} /> : null}
        {route === 'ajustes' ? <SettingsPage snapshot={snapshot} api={api} onChange={reload} /> : null}
      </main>
    </div>
  )
}
