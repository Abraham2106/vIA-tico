import { useEffect, useMemo, useState } from 'react'
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
  SideNavItems,
  SideNavLink,
  SkipToContent,
} from '@carbon/react'
import {
  Asleep,
  Calculator,
  DocumentExport,
  Email,
  Light,
  Map,
  Receipt,
  Settings,
  WarningAlt,
} from '@carbon/icons-react'
import { useWorkspace } from './hooks/useWorkspace'
import { ExceptionsPage } from './pages/ExceptionsPage'
import { ExportPage } from './pages/ExportPage'
import { InboxPage } from './pages/InboxPage'
import { ReceiptsPage } from './pages/ReceiptsPage'
import { SettingsPage } from './pages/SettingsPage'
import { SettlementPage } from './pages/SettlementPage'
import { TripsPage } from './pages/TripsPage'
import { useTheme } from './theme/ThemeProvider'

const ROUTES = [
  { id: 'excepciones', label: 'Excepciones', icon: WarningAlt },
  { id: 'viajes', label: 'Viajes', icon: Map },
  { id: 'comprobantes', label: 'Comprobantes', icon: Receipt },
  { id: 'inbox', label: 'Inbox', icon: Email },
  { id: 'liquidacion', label: 'Liquidación', icon: Calculator },
  { id: 'exportar', label: 'Exportar', icon: DocumentExport },
  { id: 'ajustes', label: 'Ajustes', icon: Settings },
] as const

type RouteId = (typeof ROUTES)[number]['id']

export function App() {
  const { snapshot, error, api, reload } = useWorkspace()
  const { carbonTheme, preference, setPreference } = useTheme()
  const [route, setRoute] = useState<RouteId>('excepciones')
  const [navOpen, setNavOpen] = useState(() =>
    typeof window === 'undefined' ? true : window.matchMedia('(min-width: 66rem)').matches,
  )
  const [focusTripId, setFocusTripId] = useState<string | undefined>()

  useEffect(() => {
    const media = window.matchMedia('(min-width: 66rem)')
    const sync = () => {
      if (media.matches) setNavOpen(true)
    }
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  const openCount = useMemo(
    () => snapshot?.exceptions.filter((item) => item.status === 'open').length ?? 0,
    [snapshot],
  )

  const currentLabel = ROUTES.find((item) => item.id === route)?.label ?? 'Excepciones'

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
          href="#"
          prefix="ViáticoCero"
          onClick={(event) => {
            event.preventDefault()
            setRoute('excepciones')
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
          {ROUTES.map((item) => (
            <SideNavLink
              key={item.id}
              renderIcon={item.icon}
              isActive={route === item.id}
              href={`#${item.id}`}
              onClick={(event) => {
                event.preventDefault()
                setRoute(item.id)
              }}
            >
              {item.label}
              {item.id === 'excepciones' && openCount > 0 ? ` (${openCount})` : ''}
            </SideNavLink>
          ))}
        </SideNavItems>
      </SideNav>
      <Content
        id="main-content"
        className={navOpen ? 'vz-content' : 'vz-content vz-content--collapsed'}
      >
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
      </Content>
    </>
  )
}
