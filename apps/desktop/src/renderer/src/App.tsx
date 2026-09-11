import { Fragment, useEffect, useMemo, useState } from 'react'
import {
  Button,
  Content,
  Header,
  HeaderGlobalAction,
  HeaderGlobalBar,
  HeaderMenuButton,
  HeaderName,
  InlineNotification,
  Loading,
  SideNav,
  SideNavDivider,
  SideNavItems,
  SideNavLink,
  SkipToContent,
} from '@carbon/react'
import {
  Asleep,
  Calculator,
  DocumentExport,
  Email,
  Home,
  Light,
  Map,
  Receipt,
  Settings,
  WarningAlt,
} from '@carbon/icons-react'
import { useWorkspace } from './hooks/useWorkspace'
import { TripContextBar } from './components/TripContextBar'
import { InicioPage, type AppRoute } from './pages/InicioPage'
import { ExportPage } from './pages/ExportPage'
import { InboxPage } from './pages/InboxPage'
import { ReceiptsPage } from './pages/ReceiptsPage'
import { SettingsPage } from './pages/SettingsPage'
import { SettlementPage } from './pages/SettlementPage'
import { TripsPage } from './pages/TripsPage'
import { ExceptionsPage } from './pages/ExceptionsPage'
import { useTheme } from './theme/ThemeProvider'
import { readStoredTripId, storeTripId, tripFromSnapshot } from './lib/tripView'

const ROUTES: { id: AppRoute; label: string; icon: typeof Home; section?: 'flujo' | 'mas' }[] = [
  { id: 'inicio', label: 'Inicio', icon: Home },
  { id: 'viajes', label: 'Viajes', icon: Map, section: 'flujo' },
  { id: 'comprobantes', label: 'Comprobantes', icon: Receipt, section: 'flujo' },
  { id: 'recibir', label: 'Recibir', icon: Email, section: 'flujo' },
  { id: 'revisar', label: 'Por revisar', icon: WarningAlt, section: 'flujo' },
  { id: 'liquidacion', label: 'Liquidación', icon: Calculator, section: 'flujo' },
  { id: 'exportar', label: 'Exportar', icon: DocumentExport, section: 'mas' },
  { id: 'ajustes', label: 'Ajustes', icon: Settings, section: 'mas' },
]

function isAppRoute(value: string): value is AppRoute {
  return ROUTES.some((item) => item.id === value)
}

function readRouteHash(): AppRoute {
  if (typeof window === 'undefined') return 'inicio'
  const id = window.location.hash.replace('#', '')
  return isAppRoute(id) ? id : 'inicio'
}

export function App() {
  const { snapshot, error, api, reload } = useWorkspace()
  const { carbonTheme, preference, setPreference } = useTheme()
  const [route, setRoute] = useState<AppRoute>(() => readRouteHash())
  const [navOpen, setNavOpen] = useState(() =>
    typeof window === 'undefined' ? true : window.matchMedia('(min-width: 66rem)').matches,
  )
  const [selectedTripId, setSelectedTripId] = useState<string | undefined>(() => readStoredTripId())

  useEffect(() => {
    const media = window.matchMedia('(min-width: 66rem)')
    const sync = () => {
      if (media.matches) setNavOpen(true)
    }
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const onHash = () => setRoute(readRouteHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const trip = snapshot ? tripFromSnapshot(snapshot, selectedTripId) : undefined

  useEffect(() => {
    if (trip && trip.id !== selectedTripId) {
      setSelectedTripId(trip.id)
      storeTripId(trip.id)
    }
  }, [trip, selectedTripId])

  function selectTrip(tripId: string) {
    setSelectedTripId(tripId)
    storeTripId(tripId)
  }

  function go(next: AppRoute) {
    setRoute(next)
    if (window.location.hash !== `#${next}`) {
      window.location.hash = next
    }
  }

  const openCount = useMemo(() => {
    if (!snapshot) return 0
    const scoped = trip
      ? snapshot.exceptions.filter((item) => item.tripId === trip.id && item.status === 'open')
      : snapshot.exceptions.filter((item) => item.status === 'open')
    return scoped.length
  }, [snapshot, trip])

  const currentLabel = ROUTES.find((item) => item.id === route)?.label ?? 'Inicio'

  function cycleTheme() {
    if (preference === 'light') setPreference('dark')
    else if (preference === 'dark') setPreference('auto')
    else setPreference('light')
  }

  if (error) {
    return (
      <div className="vz-boot">
        <InlineNotification
          kind="error"
          title="No se pudo cargar el expediente"
          subtitle={error}
          lowContrast
          hideCloseButton
        />
        <Button style={{ marginTop: '1rem' }} onClick={() => void reload()}>
          Reintentar
        </Button>
      </div>
    )
  }

  if (!snapshot || !api) {
    return (
      <div className="vz-boot vz-boot--center">
        <Loading description="Cargando expediente" withOverlay={false} />
      </div>
    )
  }

  return (
    <>
      <Header aria-label="ViáticoCero">
        <SkipToContent />
        <HeaderMenuButton
          aria-label={navOpen ? 'Cerrar menú' : 'Abrir menú'}
          isActive={navOpen}
          onClick={() => setNavOpen((open) => !open)}
        />
        <HeaderName
          href="#inicio"
          prefix="ViáticoCero"
          onClick={(event) => {
            event.preventDefault()
            go('inicio')
          }}
        >
          {currentLabel}
        </HeaderName>
        <HeaderGlobalBar>
          <HeaderGlobalAction
            aria-label={
              preference === 'auto'
                ? 'Tema según el sistema'
                : carbonTheme === 'g90'
                  ? 'Tema oscuro'
                  : 'Tema claro'
            }
            tooltipAlignment="end"
            onClick={cycleTheme}
          >
            {carbonTheme === 'g90' ? <Light size={20} /> : <Asleep size={20} />}
          </HeaderGlobalAction>
        </HeaderGlobalBar>
      </Header>
      <SideNav aria-label="Principal" expanded={navOpen} isChildOfHeader isFixedNav>
        <SideNavItems>
          {ROUTES.map((item, index) => {
            const prev = ROUTES[index - 1]
            const showDivider = Boolean(item.section && prev?.section !== item.section)
            return (
              <Fragment key={item.id}>
                {showDivider ? <SideNavDivider /> : null}
                <SideNavLink
                  renderIcon={item.icon}
                  isActive={route === item.id}
                  href={`#${item.id}`}
                  onClick={(event) => {
                    event.preventDefault()
                    go(item.id)
                  }}
                >
                  {item.label}
                  {item.id === 'revisar' && openCount > 0 ? ` (${openCount})` : ''}
                </SideNavLink>
              </Fragment>
            )
          })}
        </SideNavItems>
      </SideNav>
      <Content
        id="main-content"
        className={navOpen ? 'vz-content' : 'vz-content vz-content--collapsed'}
      >
        {route !== 'inicio' ? (
          <TripContextBar
            snapshot={snapshot}
            trip={trip}
            onSelectTrip={selectTrip}
            onNavigate={go}
          />
        ) : null}
        {route === 'inicio' ? (
          <InicioPage
            snapshot={snapshot}
            selectedTripId={trip?.id}
            onNavigate={go}
          />
        ) : null}
        {route === 'viajes' ? (
          <TripsPage
            snapshot={snapshot}
            api={api}
            selectedTripId={trip?.id}
            onChange={reload}
            onSelectTrip={(tripId) => {
              selectTrip(tripId)
            }}
            onOpenReceipts={(tripId) => {
              selectTrip(tripId)
              go('comprobantes')
            }}
          />
        ) : null}
        {route === 'comprobantes' ? (
          <ReceiptsPage
            snapshot={snapshot}
            api={api}
            onChange={reload}
            focusTripId={trip?.id}
            onNeedTrip={() => go('viajes')}
          />
        ) : null}
        {route === 'recibir' ? (
          <InboxPage
            snapshot={snapshot}
            api={api}
            onChange={reload}
            tripId={trip?.id}
            onNeedTrip={() => go('viajes')}
            onIngested={() => go('comprobantes')}
          />
        ) : null}
        {route === 'revisar' ? (
          <ExceptionsPage
            snapshot={snapshot}
            api={api}
            onChange={reload}
            focusTripId={trip?.id}
            onOpenReceipts={(tripId) => {
              selectTrip(tripId)
              go('comprobantes')
            }}
          />
        ) : null}
        {route === 'liquidacion' ? (
          <SettlementPage
            snapshot={snapshot}
            api={api}
            focusTripId={trip?.id}
            onChange={reload}
            onNeedTrip={() => go('viajes')}
          />
        ) : null}
        {route === 'exportar' ? (
          <ExportPage snapshot={snapshot} api={api} tripId={trip?.id} onSelectTrip={selectTrip} />
        ) : null}
        {route === 'ajustes' ? <SettingsPage snapshot={snapshot} api={api} onChange={reload} /> : null}
      </Content>
    </>
  )
}
