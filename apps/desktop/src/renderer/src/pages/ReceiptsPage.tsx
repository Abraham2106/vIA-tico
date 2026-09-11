import { useMemo, useState } from 'react'
import {
  Button,
  Form,
  NumberInput,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TextInput,
} from '@carbon/react'
import { RECEIPT_CATEGORIES, type ReceiptCategory } from '@viaticocero/contracts'
import { effectiveVerdict, formatMoney, type WorkspaceSnapshot } from '@viaticocero/core'
import { CATEGORY_LABELS, formatDisplayDate } from '@viaticocero/ui-tokens'
import { AppEmptyState } from '../components/AppEmptyState'
import { CategoryChip } from '../components/CategoryChip'
import { ConfidenceBar } from '../components/ConfidenceBar'
import { PageScaffold } from '../components/PageScaffold'
import { VerdictPill } from '../components/VerdictPill'
import type { DesktopApi } from '../../../ports/desktop-api.ts'

type Props = {
  snapshot: WorkspaceSnapshot
  api: DesktopApi
  onChange: () => Promise<void>
  focusTripId?: string
  onNeedTrip: () => void
}

export function ReceiptsPage({ snapshot, api, onChange, focusTripId, onNeedTrip }: Props) {
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

  if (!trip) {
    return (
      <PageScaffold title="Comprobantes">
        <AppEmptyState
          title="No hay un viaje en contexto"
          subtitle="Registra un viaje. Los gastos viven dentro de ese período."
          action={{ text: 'Ir a Viajes', onClick: onNeedTrip }}
        />
      </PageScaffold>
    )
  }

  return (
    <PageScaffold
      title="Comprobantes"
      subtitle={`${trip.destination} · ${formatDisplayDate(trip.startDate)} – ${formatDisplayDate(trip.endDate)} · adelanto ${formatMoney(trip.advance)}. Todos los tickets del viaje, no solo los que fallan.`}
      tags={[
        { label: `${counts.procede} aprobados`, type: 'green' },
        { label: `${counts.revision} por revisar`, type: 'warm-gray' },
      ]}
    >
      {receipts.length === 0 ? (
        <AppEmptyState
          title="Sin comprobantes en este viaje"
          subtitle="Recíbelos desde el celular (Recibir) o registra uno a mano abajo."
        />
      ) : (
        <TableContainer>
          <Table size="lg" aria-label="Comprobantes del viaje">
            <TableHead>
              <TableRow>
                <TableHeader>Proveedor</TableHeader>
                <TableHeader>Fecha</TableHeader>
                <TableHeader>Monto</TableHeader>
                <TableHeader>Categoría</TableHeader>
                <TableHeader>Veredicto</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {receipts.map((receipt) => {
                const extraction = receipt.usedExtraction
                return (
                  <TableRow key={receipt.id}>
                    <TableCell>{extraction.proveedor}</TableCell>
                    <TableCell className="vz-num">{formatDisplayDate(extraction.fecha)}</TableCell>
                    <TableCell className="vz-num">
                      {formatMoney({ amount: extraction.monto, currency: extraction.moneda })}
                    </TableCell>
                    <TableCell>
                      <CategoryChip category={extraction.categoria} source="ai" />
                    </TableCell>
                    <TableCell>
                      <VerdictPill verdict={effectiveVerdict(receipt)} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Form
        aria-label="Adjuntar comprobante"
        onSubmit={(event) => {
          event.preventDefault()
          void attach()
        }}
      >
        <h3 className="cds--heading-compact-01">Registrar un gasto a mano</h3>
        <p className="cds--label-01">
          El camino normal es el celular. Esto simula un ticket ya leído para probar las reglas (fecha fuera
          del viaje, duplicado, confianza baja).
        </p>
        <TextInput
          id="proveedor"
          labelText="Proveedor"
          value={proveedor}
          onChange={(event) => setProveedor(event.target.value)}
        />
        <TextInput
          id="fecha"
          type="date"
          labelText="Fecha"
          value={fecha}
          onChange={(event) => setFecha(event.target.value)}
        />
        <NumberInput
          id="monto"
          label="Monto"
          value={monto}
          hideSteppers
          onChange={(_, state) => setMonto(Number(state.value))}
        />
        <Select
          id="categoria"
          labelText="Categoría"
          value={categoria}
          onChange={(event) => setCategoria(event.target.value as ReceiptCategory)}
        >
          {RECEIPT_CATEGORIES.map((item) => (
            <SelectItem key={item} value={item} text={CATEGORY_LABELS[item]} />
          ))}
        </Select>
        <Select
          id="confianza"
          labelText="Confianza de lectura"
          value={confianza}
          onChange={(event) => setConfianza(event.target.value as 'alta' | 'media' | 'baja')}
        >
          <SelectItem value="alta" text="Alta" />
          <SelectItem value="media" text="Media — confirmar" />
          <SelectItem value="baja" text="Baja — revisar datos" />
        </Select>
        <ConfidenceBar level={confianza} />
        <Button type="submit">Validar y adjuntar</Button>
      </Form>
    </PageScaffold>
  )
}
