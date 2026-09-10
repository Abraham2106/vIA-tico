import { useEffect, useState } from 'react'
import { formatMoney, type Settlement, type WorkspaceSnapshot } from '@viaticocero/core'
import type { DesktopApi } from '../../../adapters/driving/renderer-bridge/index.ts'

type Props = {
  snapshot: WorkspaceSnapshot
  api: DesktopApi
  focusTripId?: string
  onChange: () => Promise<void>
}

export function SettlementPage({ snapshot, api, focusTripId, onChange }: Props) {
  const trip = snapshot.trips.find((item) => item.id === focusTripId) ?? snapshot.trips[0]
  const [settlement, setSettlement] = useState<Settlement | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!trip) return
    void api.settleTrip(trip.id).then(setSettlement)
  }, [api, trip])

  if (!trip) return <div className="card empty">No hay viajes.</div>

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
    <div>
      <div className="page-head">
        <div>
          <h1>Liquidación</h1>
          <p>
            Aritmética de dominio: adelanto vs respaldado vs aprobado. El modelo no suma.
          </p>
        </div>
        <button className="btn" onClick={() => void close()}>
          Cerrar viaje
        </button>
      </div>
      {error ? <div className="card" style={{ marginBottom: 12, color: '#ffd0d0' }}>{error}</div> : null}
      {settlement ? (
        <div className="grid stats">
          <Box k="Adelanto" v={formatMoney(settlement.advance)} />
          <Box k="Respaldado" v={formatMoney(settlement.backedTotal)} />
          <Box k="Aprobado" v={formatMoney(settlement.approvedTotal)} />
          <Box k="En revisión" v={formatMoney(settlement.pendingReviewTotal)} />
          <Box k="No procede" v={formatMoney(settlement.rejectedTotal)} />
          <Box k="A devolver" v={formatMoney(settlement.toReturn)} />
          <Box k="A reembolsar" v={formatMoney(settlement.toReimburse)} />
          <Box k="Excepciones abiertas" v={String(settlement.openExceptionCount)} />
        </div>
      ) : null}
      <div className="card">
        <p>
          {trip.destination} · {trip.startDate} – {trip.endDate} · {trip.status}
        </p>
        <p className="muted">
          {settlement?.procedeCount} PROCEDE · {settlement?.revisionCount} REVISIÓN ·{' '}
          {settlement?.noProcedeCount} NO PROCEDE
        </p>
      </div>
    </div>
  )
}

function Box({ k, v }: { k: string; v: string }) {
  return (
    <div className="card stat">
      <div className="k">{k}</div>
      <div className="v">{v}</div>
    </div>
  )
}
