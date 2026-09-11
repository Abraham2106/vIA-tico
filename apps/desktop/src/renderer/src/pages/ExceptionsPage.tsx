import { useMemo, useState } from 'react'
import {
  Button,
  ContentSwitcher,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TextArea,
} from '@carbon/react'
import { SidePanel } from '@carbon/ibm-products'
import type { ButtonProps } from '@carbon/react'
import {
  effectiveVerdict,
  formatMoney,
  RULE_LABELS,
  type ExceptionCase,
  type Receipt,
  type Trip,
  type WorkspaceSnapshot,
} from '@viaticocero/core'
import { formatDisplayDate } from '@viaticocero/ui-tokens'
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
  onOpenReceipts: (tripId: string) => void
}

export function ExceptionsPage({ snapshot, api, onChange, focusTripId, onOpenReceipts }: Props) {
  const [filter, setFilter] = useState<'open' | 'all'>('open')
  const [selected, setSelected] = useState<string | null>(null)
  const [panelOpen, setPanelOpen] = useState(true)
  const [note, setNote] = useState('Revisado por contabilidad')

  const rows = useMemo(() => {
    return snapshot.exceptions
      .filter((item) => (filter === 'open' ? item.status === 'open' : true))
      .filter((item) => (focusTripId ? item.tripId === focusTripId : true))
      .map((item) => {
        const receipt = snapshot.receipts.find((row) => row.id === item.receiptId)
        const trip = snapshot.trips.find((row) => row.id === item.tripId)
        return { item, receipt, trip }
      })
      .filter((row) => row.receipt)
  }, [filter, focusTripId, snapshot])

  const current = panelOpen
    ? (rows.find((row) => row.item.id === selected) ?? rows[0] ?? null)
    : null
  const errorCount = rows.filter(
    (row) => row.item.verdict === 'NO_PROCEDE' || row.item.rules.some((rule) => rule.severity === 'reject'),
  ).length

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

  const actions = current
    ? ([
        {
          label: 'Aprobar',
          kind: 'primary',
          onClick: () => void resolve('approve'),
          disabled: current.item.status !== 'open',
        },
        {
          label: 'Rechazar',
          kind: 'danger',
          onClick: () => void resolve('reject'),
          disabled: current.item.status !== 'open',
        },
        {
          label: 'Dejar en revisión',
          kind: 'secondary',
          onClick: () => void resolve('keep'),
          disabled: current.item.status !== 'open',
        },
      ] as unknown as ButtonProps<'button'>[])
    : []

  return (
    <PageScaffold
      title="Por revisar"
      subtitle="Paso 3: cola humana. Lo que el código ya liquidó no aparece aquí. Aprobar aquí sí autoriza, el modelo no."
      tags={[
        { label: `${rows.length} en cola`, type: 'blue' },
        { label: `${errorCount} no proceden`, type: errorCount ? 'red' : 'green' },
      ]}
    >
      <ContentSwitcher
        size="sm"
        selectedIndex={filter === 'open' ? 0 : 1}
        onChange={(event) => setFilter(String(event.name) === 'all' ? 'all' : 'open')}
      >
        <Switch name="open" text="Abiertas" />
        <Switch name="all" text="Todas" />
      </ContentSwitcher>

      {rows.length === 0 ? (
        <AppEmptyState
          title="Nada que decidir"
          subtitle="Todo lo de este viaje pasó las reglas, o aún no hay gastos. Lo automático está en Comprobantes y Liquidación."
        />
      ) : (
        <>
          <TableContainer>
            <Table size="lg" aria-label="Gastos por revisar">
              <TableHead>
                <TableRow>
                  <TableHeader>Proveedor</TableHeader>
                  <TableHeader>Regla</TableHeader>
                  <TableHeader>Fecha</TableHeader>
                  <TableHeader>Viaje</TableHeader>
                  <TableHeader>Monto</TableHeader>
                  <TableHeader>Estado</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map(({ item, receipt, trip }) => {
                  const extraction = receipt!.usedExtraction
                  const isSelected = current?.item.id === item.id
                  return (
                    <TableRow
                      key={item.id}
                      onClick={() => {
                        setSelected(item.id)
                        setPanelOpen(true)
                      }}
                      className={isSelected ? 'cds--data-table--selected' : undefined}
                    >
                      <TableCell>{extraction.proveedor}</TableCell>
                      <TableCell>{item.rules[0] ? RULE_LABELS[item.rules[0].code] : '—'}</TableCell>
                      <TableCell className="vz-num">{formatDisplayDate(extraction.fecha)}</TableCell>
                      <TableCell>{trip?.destination}</TableCell>
                      <TableCell className="vz-num">
                        {formatMoney({ amount: extraction.monto, currency: extraction.moneda })}
                      </TableCell>
                      <TableCell>
                        <VerdictPill verdict={receipt ? effectiveVerdict(receipt) : item.verdict} />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
          {current?.receipt && current.trip ? (
            <SidePanel
              open={panelOpen}
              size="md"
              includeOverlay
              preventCloseOnClickOutside
              closeIconDescription="Cerrar"
              labelText="Excepción"
              title={current.receipt.usedExtraction.proveedor}
              subtitle={formatMoney({
                amount: current.receipt.usedExtraction.monto,
                currency: current.receipt.usedExtraction.moneda,
              })}
              onRequestClose={() => setPanelOpen(false)}
              actions={actions}
            >
              <ExceptionBody
                item={current.item}
                receipt={current.receipt}
                trip={current.trip}
                note={note}
                onNote={setNote}
                onOpenTrip={() => onOpenReceipts(current.trip!.id)}
              />
            </SidePanel>
          ) : null}
        </>
      )}
    </PageScaffold>
  )
}

function ExceptionBody({
  item,
  receipt,
  trip,
  note,
  onNote,
  onOpenTrip,
}: {
  item: ExceptionCase
  receipt: Receipt
  trip: Trip
  note: string
  onNote: (value: string) => void
  onOpenTrip: () => void
}) {
  const extraction = receipt.usedExtraction
  return (
    <Stack gap={5}>
      <p className="cds--label-01">
        {formatDisplayDate(extraction.fecha)} · {trip.destination}
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <VerdictPill verdict={effectiveVerdict(receipt)} />
        <CategoryChip category={extraction.categoria} source="ai" />
      </div>
      {item.rules.map((rule) => (
        <p key={rule.code}>
          <strong>{RULE_LABELS[rule.code]}</strong>
          <br />
          {rule.message}
        </p>
      ))}
      <ConfidenceBar level={extraction.confianza_lectura} />
      <p className="cds--label-01">{extraction.raw_text || 'Sin RAW'}</p>
      <TextArea
        id="exception-note"
        labelText="Nota de resolución"
        value={note}
        onChange={(event) => onNote(event.target.value)}
        rows={3}
      />
      <Button kind="ghost" size="sm" onClick={onOpenTrip}>
        Ver comprobantes del viaje
      </Button>
    </Stack>
  )
}
