import { useMemo, useState } from 'react'
import {
  effectiveVerdict,
  RULE_LABELS,
  type ExceptionCase,
  type Receipt,
  type Trip,
  type WorkspaceSnapshot,
} from '@viaticocero/core'
import { VerdictPill } from '../components/VerdictPill'
import type { DesktopApi } from '../../../adapters/driving/renderer-bridge/index.ts'

type Props = {
  snapshot: WorkspaceSnapshot
  api: DesktopApi
  onChange: () => Promise<void>
  onOpenTrip: (tripId: string) => void
}

export function ExceptionsPage({ snapshot, api, onChange, onOpenTrip }: Props) {
  const [filter, setFilter] = useState<'open' | 'all'>('open')
  const [selected, setSelected] = useState<string | null>(null)
  const [note, setNote] = useState('Revisado por contabilidad')

  const rows = useMemo(() => {
    return snapshot.exceptions
      .filter((item) => (filter === 'open' ? item.status === 'open' : true))
      .map((item) => {
        const receipt = snapshot.receipts.find((row) => row.id === item.receiptId)
        const trip = snapshot.trips.find((row) => row.id === item.tripId)
        return { item, receipt, trip }
      })
      .filter((row) => row.receipt)
  }, [filter, snapshot])

  const current = rows.find((row) => row.item.id === selected) ?? rows[0]

  async function resolve(action: 'approve' | 'reject' | 'keep') {
    if (!current) return
    await api.resolveException({
      exceptionId: current.item.id,
      action,
      note,
      by: 'contador',
    })
    await onChange()
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Centro de excepciones</h1>
          <p>
            Solo las filas que el código no puede liquidar. Los PROCEDE no son cola de trabajo.
          </p>
        </div>
        <div className="row">
          <select value={filter} onChange={(event) => setFilter(event.target.value as 'open' | 'all')}>
            <option value="open">Abiertas</option>
            <option value="all">Todas</option>
          </select>
        </div>
      </div>

      <div className="grid stats">
        <Stat k="Abiertas" v={snapshot.exceptions.filter((item) => item.status === 'open').length} />
        <Stat k="REVISIÓN" v={snapshot.receipts.filter((item) => effectiveVerdict(item) === 'REVISION').length} />
        <Stat k="NO PROCEDE" v={snapshot.receipts.filter((item) => effectiveVerdict(item) === 'NO_PROCEDE').length} />
        <Stat k="PROCEDE" v={snapshot.receipts.filter((item) => effectiveVerdict(item) === 'PROCEDE').length} />
      </div>

      {rows.length === 0 ? (
        <div className="card empty">No hay excepciones {filter === 'open' ? 'abiertas' : ''}.</div>
      ) : (
        <div className="detail">
          <div className="card" style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Viaje</th>
                  <th>Proveedor</th>
                  <th>Fecha</th>
                  <th>Monto</th>
                  <th>Regla</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ item, receipt, trip }) => (
                  <tr
                    key={item.id}
                    className="clickable"
                    onClick={() => setSelected(item.id)}
                    style={current?.item.id === item.id ? { background: '#1c2530' } : undefined}
                  >
                    <td>{trip?.destination}</td>
                    <td>{receipt?.usedExtraction.proveedor}</td>
                    <td className="mono">{receipt?.usedExtraction.fecha}</td>
                    <td className="mono">{receipt?.usedExtraction.monto}</td>
                    <td>{item.rules[0] ? RULE_LABELS[item.rules[0].code] : '—'}</td>
                    <td>
                      <VerdictPill verdict={receipt ? effectiveVerdict(receipt) : item.verdict} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {current?.receipt && current.trip ? (
            <ExceptionDetail
              item={current.item}
              receipt={current.receipt}
              trip={current.trip}
              note={note}
              onNote={setNote}
              onApprove={() => void resolve('approve')}
              onReject={() => void resolve('reject')}
              onKeep={() => void resolve('keep')}
              onOpenTrip={() => onOpenTrip(current.trip!.id)}
            />
          ) : null}
        </div>
      )}
    </div>
  )
}

function Stat({ k, v }: { k: string; v: number }) {
  return (
    <div className="card stat">
      <div className="k">{k}</div>
      <div className="v">{v}</div>
    </div>
  )
}

function ExceptionDetail({
  item,
  receipt,
  trip,
  note,
  onNote,
  onApprove,
  onReject,
  onKeep,
  onOpenTrip,
}: {
  item: ExceptionCase
  receipt: Receipt
  trip: Trip
  note: string
  onNote: (value: string) => void
  onApprove: () => void
  onReject: () => void
  onKeep: () => void
  onOpenTrip: () => void
}) {
  return (
    <div className="card">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <strong>Por qué no se liquidó</strong>
        <button className="btn" onClick={onOpenTrip}>
          Ver viaje
        </button>
      </div>
      <p className="muted">
        {trip.destination} · {trip.startDate} – {trip.endDate}
      </p>
      <ul>
        {item.rules.map((rule) => (
          <li key={rule.code}>
            <strong>{RULE_LABELS[rule.code]}</strong>
            <div className="muted">{rule.message}</div>
          </li>
        ))}
      </ul>
      <p>
        {receipt.usedExtraction.proveedor} · {receipt.usedExtraction.fecha} ·{' '}
        <span className="mono">
          {receipt.usedExtraction.monto} {receipt.usedExtraction.moneda}
        </span>
      </p>
      <p className="muted">RAW: {receipt.usedExtraction.raw_text || '—'}</p>
      <label>
        Nota de resolución
        <textarea value={note} onChange={(event) => onNote(event.target.value)} rows={3} />
      </label>
      <div className="row" style={{ marginTop: 12 }}>
        <button className="btn primary" onClick={onApprove} disabled={item.status !== 'open'}>
          Aprobar
        </button>
        <button className="btn danger" onClick={onReject} disabled={item.status !== 'open'}>
          Rechazar
        </button>
        <button className="btn" onClick={onKeep} disabled={item.status !== 'open'}>
          Dejar en revisión
        </button>
      </div>
    </div>
  )
}
