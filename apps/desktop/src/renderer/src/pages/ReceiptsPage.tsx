import { useMemo, useState } from 'react'
import { RECEIPT_CATEGORIES, type ReceiptCategory } from '@viaticocero/contracts'
import { effectiveVerdict, formatMoney, type WorkspaceSnapshot } from '@viaticocero/core'
import { VerdictPill } from '../components/VerdictPill'
import type { DesktopApi } from '../../../adapters/driving/renderer-bridge/index.ts'

type Props = {
  snapshot: WorkspaceSnapshot
  api: DesktopApi
  onChange: () => Promise<void>
  focusTripId?: string
}

export function ReceiptsPage({ snapshot, api, onChange, focusTripId }: Props) {
  const tripId = focusTripId ?? snapshot.trips[0]?.id
  const trip = snapshot.trips.find((item) => item.id === tripId)
  const receipts = snapshot.receipts.filter((item) => item.tripId === tripId)
  const [proveedor, setProveedor] = useState('Café Central')
  const [fecha, setFecha] = useState(trip?.startDate ?? '2026-09-10')
  const [monto, setMonto] = useState(3500)
  const [categoria, setCategoria] = useState<ReceiptCategory>('alimentacion')
  const [confianza, setConfianza] = useState<'alta' | 'media' | 'baja'>('alta')

  const counts = useMemo(() => {
    return {
      procede: receipts.filter((item) => effectiveVerdict(item) === 'PROCEDE').length,
      revision: receipts.filter((item) => effectiveVerdict(item) === 'REVISION').length,
    }
  }, [receipts])

  async function attach() {
    if (!trip) return
    await api.attachReceipt({
      tripId: trip.id,
      extraction: {
        proveedor,
        fecha,
        monto: Number(monto),
        moneda: trip.advance.currency,
        tipo_documento: 'recibo',
        confianza_lectura: confianza,
        raw_text: `${proveedor} ${fecha} ${monto}`,
        categoria,
      },
    })
    await onChange()
  }

  if (!trip) return <div className="card empty">No hay viajes.</div>

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{trip.destination}</h1>
          <p>
            {trip.startDate} – {trip.endDate} · adelanto {formatMoney(trip.advance)} · {counts.procede}{' '}
            PROCEDE · {counts.revision} en revisión
          </p>
        </div>
      </div>
      <div className="detail">
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Proveedor</th>
                <th>Fecha</th>
                <th>Monto</th>
                <th>Categoría</th>
                <th>Veredicto</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((receipt) => {
                const verdict = effectiveVerdict(receipt)
                return (
                  <tr key={receipt.id}>
                    <td>{verdict === 'PROCEDE' ? '✓' : '⚠'}</td>
                    <td>{receipt.usedExtraction.proveedor}</td>
                    <td className="mono">{receipt.usedExtraction.fecha}</td>
                    <td className="mono">{receipt.usedExtraction.monto}</td>
                    <td>{receipt.usedExtraction.categoria ?? '—'}</td>
                    <td>
                      <VerdictPill verdict={verdict} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <form
          className="card"
          onSubmit={(event) => {
            event.preventDefault()
            void attach()
          }}
        >
          <strong>Adjuntar comprobante (manual / DTO)</strong>
          <p className="muted">VisionPsy no está cableado. El DTO entra igual al motor de reglas.</p>
          <div className="form-grid" style={{ marginTop: 12 }}>
            <label>
              Proveedor
              <input value={proveedor} onChange={(event) => setProveedor(event.target.value)} />
            </label>
            <label>
              Fecha
              <input type="date" value={fecha} onChange={(event) => setFecha(event.target.value)} />
            </label>
            <label>
              Monto
              <input type="number" value={monto} onChange={(event) => setMonto(Number(event.target.value))} />
            </label>
            <label>
              Categoría
              <select value={categoria} onChange={(event) => setCategoria(event.target.value as ReceiptCategory)}>
                {RECEIPT_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Confianza
              <select
                value={confianza}
                onChange={(event) => setConfianza(event.target.value as 'alta' | 'media' | 'baja')}
              >
                <option value="alta">alta</option>
                <option value="media">media</option>
                <option value="baja">baja</option>
              </select>
            </label>
          </div>
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn primary" type="submit">
              Validar y adjuntar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
