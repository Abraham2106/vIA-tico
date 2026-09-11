import { InlineNotification, Stack, Tag } from '@carbon/react'
import type { AuditEvent, Receipt, Trip, WorkspaceSnapshot } from '@viaticocero/core'
import { RULE_LABELS, effectiveVerdict, formatMoney } from '@viaticocero/core'
import { formatDisplayDate } from '@viaticocero/ui-tokens'
import { CategoryChip } from '../../components/CategoryChip'
import { ConfidenceBar } from '../../components/ConfidenceBar'
import { VerdictPill } from '../../components/VerdictPill'
import {
  AUDIT_ACTOR_LABEL,
  actionLabel,
  eventStory,
  fieldTraces,
  qwenStatus,
  type FieldTrace,
} from './trace'

type Props = {
  event: AuditEvent
  snapshot: WorkspaceSnapshot
}

export function AiTrace({ event, snapshot }: Props) {
  const receipt = event.receiptId
    ? snapshot.receipts.find((item) => item.id === event.receiptId)
    : undefined
  const trip = (event.tripId ? snapshot.trips.find((item) => item.id === event.tripId) : undefined) ??
    (receipt ? snapshot.trips.find((item) => item.id === receipt.tripId) : undefined)

  return (
    <Stack gap={6}>
      <p>{eventStory(event)}</p>
      <p className="cds--label-01">
        {AUDIT_ACTOR_LABEL[event.actor]} · {actionLabel(event.action)}
        {event.detail ? ` · ${event.detail}` : ''}
      </p>
      {receipt ? <ReceiptPipeline receipt={receipt} trip={trip} focus={event.action} /> : null}
    </Stack>
  )
}

function ReceiptPipeline({
  receipt,
  trip,
  focus,
}: {
  receipt: Receipt
  trip?: Trip
  focus: string
}) {
  const fields = fieldTraces(receipt)
  const qwen = qwenStatus(receipt)
  const extraction = receipt.usedExtraction

  return (
    <>
      <InlineNotification
        kind="info"
        title="El modelo no autoriza"
        subtitle="VisionPsy y Qwen interpretan. El veredicto (PROCEDE / REVISIÓN / NO PROCEDE) lo escribe el código."
        lowContrast
        hideCloseButton
      />

      {trip ? (
        <p className="cds--label-01">
          {trip.destination} · {formatDisplayDate(trip.startDate)} – {formatDisplayDate(trip.endDate)}
          {extraction.proveedor
            ? ` · ${extraction.proveedor} · ${formatMoney({ amount: extraction.monto, currency: extraction.moneda })}`
            : ''}
        </p>
      ) : null}

      <div className={stepClass('extract', focus)}>
        <h3 className="cds--heading-compact-01">1. VisionPsy — lectura</h3>
        <p className="cds--label-01">
          Lo que el celular extrajo del ticket. Confianza baja o media no aprueba: abre revisión.
        </p>
        <ConfidenceBar level={receipt.extraction.confianza_lectura} />
        <FieldTable fields={fields} column="vision" />
        <RawBlock label="Texto RAW de la lectura" text={receipt.extraction.raw_text} />
      </div>

      <div className={stepClass('postprocess', focus)}>
        <h3 className="cds--heading-compact-01">2. Qwen — postproceso lingüístico</h3>
        {qwen === 'skipped' ? (
          <p className="cds--label-01">
            Qwen no corrió. En el preview web el Instruct no está cableado; el DTO de VisionPsy pasó
            directo al código. En Electron, con el modelo listo, aquí verías qué texto reescribió y
            si el código lo aceptó.
          </p>
        ) : null}
        {qwen === 'applied' ? (
          <p className="cds--label-01">
            Qwen reescribió texto. Monto, fecha, moneda e IVA coinciden con VisionPsy, así que el
            código usó esta versión.
          </p>
        ) : null}
        {qwen === 'discarded' ? (
          <InlineNotification
            kind="warning"
            title="Postproceso descartado"
            subtitle="Qwen cambió un dígito, fecha o moneda. Gana la lectura original y el gasto entra a revisión."
            lowContrast
            hideCloseButton
          />
        ) : null}
        {receipt.linguisticPostprocess ? <FieldTable fields={fields} column="qwen" /> : null}
      </div>

      <div className={stepClass('classify-motive', focus)}>
        <h3 className="cds--heading-compact-01">3. Qwen — clasificación de motivo</h3>
        {receipt.motiveClassification ? (
          <>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <CategoryChip category={receipt.motiveClassification.categoria} source="ai" />
              <Tag type="gray" size="sm">
                confianza {receipt.motiveClassification.confianza_clasificacion}
              </Tag>
            </div>
            <p>
              <strong>Razón del modelo:</strong> {receipt.motiveClassification.razon}
            </p>
            <p className="cds--label-01">
              Esta categoría no es un veredicto. Si la confianza no es alta, el código abre revisión.
            </p>
          </>
        ) : (
          <p className="cds--label-01">
            No hubo clasificación. Qwen solo clasifica cuando hay motivo libre y el Instruct está
            listo. El demo del preview casi nunca llega a este paso.
          </p>
        )}
      </div>

      <div className={stepClass('verdict', focus)}>
        <h3 className="cds--heading-compact-01">4. Código — lo que se usó y el veredicto</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <VerdictPill verdict={effectiveVerdict(receipt)} />
          <CategoryChip category={extraction.categoria} />
        </div>
        {receipt.humanDecision ? (
          <p>
            Una persona cambió el resultado a {receipt.humanDecision.verdict}
            {receipt.humanDecision.note ? `: ${receipt.humanDecision.note}` : '.'} (
            {receipt.humanDecision.decidedBy})
          </p>
        ) : null}
        {receipt.triggeredRules.length === 0 ? (
          <p className="cds--label-01">Ninguna regla disparó. El código dejó pasar el gasto.</p>
        ) : (
          <ul className="vz-audit-rules">
            {receipt.triggeredRules.map((rule) => (
              <li key={rule.code}>
                <strong>{RULE_LABELS[rule.code]}</strong>
                <span className="cds--label-01"> ({rule.severity})</span>
                <br />
                {rule.message}
              </li>
            ))}
          </ul>
        )}
        <FieldTable fields={fields} column="used" />
      </div>
    </>
  )
}

function stepClass(step: string, focus: string): string {
  const aliases: Record<string, string[]> = {
    extract: ['extract'],
    postprocess: ['postprocess', 'postprocess-discarded'],
    'classify-motive': ['classify-motive'],
    verdict: ['verdict', 'open-exception', 'approve', 'reject', 'keep-exception'],
  }
  const focused = aliases[step]?.includes(focus)
  return focused ? 'vz-audit-step vz-audit-step--focus' : 'vz-audit-step'
}

function FieldTable({ fields, column }: { fields: FieldTrace[]; column: 'vision' | 'qwen' | 'used' }) {
  return (
    <table className="vz-audit-fields">
      <tbody>
        {fields.map((field) => {
          const value = column === 'vision' ? field.vision : column === 'qwen' ? (field.qwen ?? '—') : field.used
          const mark =
            column === 'qwen' && field.blocked
              ? 'vz-audit-fields__value--blocked'
              : column === 'qwen' && field.qwenChanged
                ? 'vz-audit-fields__value--changed'
                : undefined
          return (
            <tr key={field.key}>
              <th scope="row">
                {field.label}
                {field.immutable ? <span className="cds--label-01"> · inmutable</span> : null}
              </th>
              <td className={mark}>{value}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function RawBlock({ label, text }: { label: string; text: string }) {
  return (
    <figure className="vz-audit-raw">
      <figcaption className="cds--label-01">{label}</figcaption>
      <pre>{text || 'Sin RAW'}</pre>
    </figure>
  )
}
