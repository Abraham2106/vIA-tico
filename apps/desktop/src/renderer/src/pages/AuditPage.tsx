import { useMemo, useState } from 'react'
import {
  ContentSwitcher,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
} from '@carbon/react'
import { SidePanel } from '@carbon/ibm-products'
import type { AuditEvent, WorkspaceSnapshot } from '@viaticocero/core'
import { PageScaffold } from '../components/PageScaffold'
import { AiTrace } from '../features/audit/AiTrace'
import {
  AUDIT_ACTOR_LABEL,
  actionLabel,
  matchesAuditFilter,
  type AuditFilter,
} from '../features/audit/trace'

type Props = {
  snapshot: WorkspaceSnapshot
  tripId?: string
}

const ACTOR_TAG: Record<AuditEvent['actor'], 'teal' | 'purple' | 'gray' | 'blue'> = {
  vision: 'teal',
  llm: 'purple',
  system: 'gray',
  human: 'blue',
}

function formatWhen(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat('es-CR', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export function AuditPage({ snapshot, tripId }: Props) {
  const [filter, setFilter] = useState<AuditFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [panelOpen, setPanelOpen] = useState(true)

  const events = useMemo(() => {
    return snapshot.auditEvents
      .filter((item) => (tripId ? item.tripId === tripId : true))
      .filter((item) => matchesAuditFilter(item, filter))
      .slice()
      .reverse()
  }, [filter, snapshot.auditEvents, tripId])

  const selected = panelOpen
    ? (events.find((item) => item.id === selectedId) ?? events[0] ?? null)
    : null

  const receiptLabel = (event: AuditEvent) => {
    if (!event.receiptId) return '—'
    const receipt = snapshot.receipts.find((item) => item.id === event.receiptId)
    return receipt?.usedExtraction.proveedor ?? event.receiptId
  }

  return (
    <PageScaffold
      title="Auditoría"
      subtitle="Qué leyó VisionPsy, qué reescribió Qwen y qué decidió el código. El modelo no autoriza; este rastro se puede reconstruir."
    >
      <p className="vz-audit-lead">
        Un renglón no basta. Abre un evento de VisionPsy o Qwen para ver el DTO, el RAW, el diff del
        postproceso y las reglas que dispararon el veredicto.
      </p>
      <ContentSwitcher
        size="sm"
        selectedIndex={['all', 'ai', 'code', 'human'].indexOf(filter)}
        onChange={(event) => {
          const name = String(event.name)
          if (name === 'ai' || name === 'code' || name === 'human' || name === 'all') {
            setFilter(name)
          }
        }}
      >
        <Switch name="all" text="Todos" />
        <Switch name="ai" text="Solo IA" />
        <Switch name="code" text="Código" />
        <Switch name="human" text="Persona" />
      </ContentSwitcher>

      {events.length === 0 ? (
        <p className="cds--label-01">No hay eventos en este filtro.</p>
      ) : (
        <>
          <TableContainer>
            <Table size="lg" aria-label="Eventos de auditoría">
              <TableHead>
                <TableRow>
                  <TableHeader>Cuándo</TableHeader>
                  <TableHeader>Quién</TableHeader>
                  <TableHeader>Qué</TableHeader>
                  <TableHeader>Comprobante</TableHeader>
                  <TableHeader>Detalle</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((event) => {
                  const isSelected = selected?.id === event.id
                  return (
                    <TableRow
                      key={event.id}
                      onClick={() => {
                        setSelectedId(event.id)
                        setPanelOpen(true)
                      }}
                      className={isSelected ? 'cds--data-table--selected' : undefined}
                    >
                      <TableCell className="vz-num">{formatWhen(event.at)}</TableCell>
                      <TableCell>
                        <Tag type={ACTOR_TAG[event.actor]} size="sm">
                          {AUDIT_ACTOR_LABEL[event.actor]}
                        </Tag>
                      </TableCell>
                      <TableCell>{actionLabel(event.action)}</TableCell>
                      <TableCell>{receiptLabel(event)}</TableCell>
                      <TableCell>{event.detail ?? '—'}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
          {selected ? (
            <SidePanel
              open={panelOpen}
              size="lg"
              includeOverlay
              preventCloseOnClickOutside
              closeIconDescription="Cerrar"
              labelText="Rastro del modelo"
              title={actionLabel(selected.action)}
              subtitle={`${AUDIT_ACTOR_LABEL[selected.actor]} · ${receiptLabel(selected)}`}
              onRequestClose={() => setPanelOpen(false)}
            >
              <AiTrace event={selected} snapshot={snapshot} />
            </SidePanel>
          ) : null}
        </>
      )}
    </PageScaffold>
  )
}
