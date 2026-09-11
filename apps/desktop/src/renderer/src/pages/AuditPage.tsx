import { Tag, Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@carbon/react'
import type { AuditEvent, WorkspaceSnapshot } from '@viaticocero/core'
import { PageScaffold } from '../components/PageScaffold'

type Props = {
  snapshot: WorkspaceSnapshot
  tripId?: string
}

const ACTOR_LABEL: Record<AuditEvent['actor'], string> = {
  system: 'Código',
  human: 'Persona',
  vision: 'VisionPsy',
  llm: 'Qwen',
}

function actionLabel(action: string): string {
  const labels: Record<string, string> = {
    extract: 'Lectura del ticket',
    postprocess: 'Postproceso lingüístico',
    'postprocess-discarded': 'Postproceso descartado',
    'classify-motive': 'Clasificación de motivo',
    verdict: 'Veredicto del código',
    'open-exception': 'Abierta a revisión',
    approve: 'Aprobado por persona',
    reject: 'Rechazado por persona',
    'keep-exception': 'Sigue en revisión',
    'register-trip': 'Viaje registrado',
    'close-trip': 'Viaje liquidado',
    'update-policy': 'Política actualizada',
  }
  return labels[action] ?? action
}

function formatWhen(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat('es-CR', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export function AuditPage({ snapshot, tripId }: Props) {
  const events = snapshot.auditEvents
    .filter((item) => (tripId ? item.tripId === tripId : true))
    .slice()
    .reverse()

  return (
    <PageScaffold
      title="Auditoría"
      subtitle="Por qué un gasto terminó aprobado o en revisión. El modelo no autoriza; este rastro sí se puede reconstruir."
    >
      {events.length === 0 ? (
        <p className="cds--label-01">Todavía no hay eventos en este expediente.</p>
      ) : (
        <TableContainer>
          <Table size="lg" aria-label="Eventos de auditoría">
            <TableHead>
              <TableRow>
                <TableHeader>Cuándo</TableHeader>
                <TableHeader>Quién</TableHeader>
                <TableHeader>Qué</TableHeader>
                <TableHeader>Detalle</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="vz-num">{formatWhen(event.at)}</TableCell>
                  <TableCell>
                    <Tag type={event.actor === 'human' ? 'blue' : 'gray'} size="sm">
                      {ACTOR_LABEL[event.actor]}
                    </Tag>
                  </TableCell>
                  <TableCell>{actionLabel(event.action)}</TableCell>
                  <TableCell>{event.detail ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </PageScaffold>
  )
}
