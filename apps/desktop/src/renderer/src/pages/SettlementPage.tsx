import { useEffect, useState } from 'react'
import {
  InlineNotification,
  StructuredListBody,
  StructuredListCell,
  StructuredListHead,
  StructuredListRow,
  StructuredListWrapper,
} from '@carbon/react'
import { formatMoney, type WorkspaceSnapshot } from '@viaticocero/core'
import { formatDisplayDate } from '@viaticocero/ui-tokens'
import { AppEmptyState } from '../components/AppEmptyState'
import { PageScaffold } from '../components/PageScaffold'
import type { DesktopApi } from '../../../ports/desktop-api.ts'

type Props = {
  snapshot: WorkspaceSnapshot
  api: DesktopApi
  focusTripId?: string
  onChange: () => Promise<void>
  onNeedTrip: () => void
}

export function SettlementPage({ snapshot, api, focusTripId, onChange, onNeedTrip }: Props) {
  const trip = snapshot.trips.find((item) => item.id === focusTripId) ?? snapshot.trips[0]
  const [settlement, setSettlement] = useState<Awaited<ReturnType<DesktopApi['settleTrip']>> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!trip) return
    void api.settleTrip(trip.id).then(setSettlement)
  }, [api, trip])

  if (!trip) {
    return (
      <PageScaffold title="Liquidación">
        <AppEmptyState
          title="No hay un viaje en contexto"
          subtitle="La liquidación compara el adelanto con los comprobantes de un viaje."
          action={{ text: 'Ir a Viajes', onClick: onNeedTrip }}
        />
      </PageScaffold>
    )
  }

  async function close() {
    if (!trip) return
    try {
      setError(null)
      const next = await api.closeTrip(trip.id)
      setSettlement(next)
      await onChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <PageScaffold
      title="Liquidación"
      subtitle={`Paso 4: ${trip.destination} · ${formatDisplayDate(trip.startDate)} – ${formatDisplayDate(trip.endDate)}. Adelanto contra lo aprobado; lo que sigue en revisión no se cierra.`}
      pageActions={[{ kind: 'secondary', label: 'Cerrar viaje', onClick: () => void close() }]}
    >
      {error ? (
        <InlineNotification
          kind="error"
          title="No se pudo cerrar el viaje"
          subtitle={error}
          lowContrast
          hideCloseButton
        />
      ) : null}
      {settlement ? (
        <StructuredListWrapper ariaLabel="Resumen de liquidación">
          <StructuredListHead>
            <StructuredListRow head>
              <StructuredListCell head>Concepto</StructuredListCell>
              <StructuredListCell head>Monto</StructuredListCell>
            </StructuredListRow>
          </StructuredListHead>
          <StructuredListBody>
            <Row k="Adelanto" v={formatMoney(settlement.advance)} />
            <Row k="Respaldado" v={formatMoney(settlement.backedTotal)} />
            <Row k="Aprobado" v={formatMoney(settlement.approvedTotal)} />
            <Row k="En revisión" v={formatMoney(settlement.pendingReviewTotal)} />
            <Row k="No procede" v={formatMoney(settlement.rejectedTotal)} />
            <Row k="A devolver" v={formatMoney(settlement.toReturn)} />
            <Row k="A reembolsar" v={formatMoney(settlement.toReimburse)} />
          </StructuredListBody>
        </StructuredListWrapper>
      ) : null}
      {settlement ? (
        <p className="cds--label-01" style={{ marginTop: '1rem' }}>
          {settlement.procedeCount} aprobados · {settlement.revisionCount} por revisar · {settlement.noProcedeCount}{' '}
          no proceden · {settlement.openExceptionCount} excepciones abiertas
        </p>
      ) : null}
    </PageScaffold>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <StructuredListRow>
      <StructuredListCell>{k}</StructuredListCell>
      <StructuredListCell className="vz-num">{v}</StructuredListCell>
    </StructuredListRow>
  )
}
