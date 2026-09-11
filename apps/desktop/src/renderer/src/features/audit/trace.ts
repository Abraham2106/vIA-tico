import { IMMUTABLE_VISION_FIELDS, type AuditEvent, type VisionResult } from '@viaticocero/contracts'
import { compareImmutableFields, type Receipt } from '@viaticocero/core'

export const AUDIT_ACTOR_LABEL: Record<AuditEvent['actor'], string> = {
  system: 'Código',
  human: 'Persona',
  vision: 'VisionPsy',
  llm: 'Qwen',
}

export const AUDIT_ACTION_LABEL: Record<string, string> = {
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

const FIELD_LABELS: Record<string, string> = {
  proveedor: 'Proveedor',
  fecha: 'Fecha',
  monto: 'Monto',
  moneda: 'Moneda',
  tipo_documento: 'Tipo de documento',
  categoria: 'Categoría',
  motivo: 'Motivo libre',
  iva: 'IVA',
  confianza_lectura: 'Confianza de lectura',
}

const TRACE_FIELDS = [
  'proveedor',
  'fecha',
  'monto',
  'moneda',
  'tipo_documento',
  'categoria',
  'motivo',
  'iva',
  'confianza_lectura',
] as const satisfies readonly (keyof VisionResult)[]

export type AuditFilter = 'all' | 'ai' | 'code' | 'human'

export type FieldTrace = {
  key: string
  label: string
  vision: string
  qwen: string | undefined
  used: string
  immutable: boolean
  qwenChanged: boolean
  blocked: boolean
}

export function actionLabel(action: string): string {
  return AUDIT_ACTION_LABEL[action] ?? action
}

export function matchesAuditFilter(event: AuditEvent, filter: AuditFilter): boolean {
  if (filter === 'all') return true
  if (filter === 'ai') return event.actor === 'vision' || event.actor === 'llm'
  if (filter === 'code') return event.actor === 'system'
  return event.actor === 'human'
}

export function postprocessWasDiscarded(receipt: Receipt): boolean {
  const refined = receipt.linguisticPostprocess
  if (!refined) return false
  return compareImmutableFields(receipt.extraction, refined).ok === false
}

export function formatVisionValue(value: unknown): string {
  if (value === undefined || value === null || value === '') return '—'
  return String(value)
}

export function fieldTraces(receipt: Receipt): FieldTrace[] {
  const vision = receipt.extraction
  const qwen = receipt.linguisticPostprocess
  const used = receipt.usedExtraction
  const discarded = postprocessWasDiscarded(receipt)
  return TRACE_FIELDS.map((key) => {
    const immutable = (IMMUTABLE_VISION_FIELDS as readonly string[]).includes(key)
    const qwenChanged = Boolean(qwen && formatVisionValue(vision[key]) !== formatVisionValue(qwen[key]))
    return {
      key,
      label: FIELD_LABELS[key] ?? key,
      vision: formatVisionValue(vision[key]),
      qwen: qwen ? formatVisionValue(qwen[key]) : undefined,
      used: formatVisionValue(used[key]),
      immutable,
      qwenChanged,
      blocked: Boolean(discarded && immutable && qwenChanged),
    }
  })
}

export function eventStory(event: AuditEvent): string {
  switch (event.action) {
    case 'extract':
      return 'VisionPsy leyó el ticket en el celular. El resultado es un DTO (proveedor, fecha, monto, RAW y confianza). Eso no autoriza un pago.'
    case 'postprocess':
      return 'Qwen Instruct reescribió texto del DTO. El código comparó monto, fecha, moneda e IVA con la lectura original y los dejó pasar.'
    case 'postprocess-discarded':
      return 'Qwen tocó un campo que no puede cambiar (monto, fecha, moneda o IVA). El código tiró ese postproceso, usó la lectura original y marcó revisión.'
    case 'classify-motive':
      return 'Qwen clasificó el motivo libre. Propone categoría y una razón. El veredicto lo sigue escribiendo el código, no el modelo.'
    case 'verdict':
      return 'El motor de reglas en packages/core emitió PROCEDE, REVISIÓN o NO PROCEDE. Ningún adaptador QVAC escribe este campo.'
    case 'open-exception':
      return 'El código abrió la cola humana. Aprobar aquí sí autoriza; el modelo no.'
    case 'approve':
      return 'Una persona sobreescribió el veredicto a PROCEDE y dejó nota. Queda en este rastro.'
    case 'reject':
      return 'Una persona marcó NO PROCEDE. El modelo no intervino en esa decisión.'
    case 'keep-exception':
      return 'Una persona dejó el gasto en revisión. Sigue en la cola.'
    case 'register-trip':
      return 'Se registró el marco del viaje (destino, fechas, adelanto). No hay modelo en este paso.'
    case 'close-trip':
      return 'Una persona liquidó el viaje. Exige que no queden excepciones abiertas.'
    case 'update-policy':
      return 'Una persona cambió un tope de política. El cambio queda auditado.'
    default:
      return event.detail ?? 'Evento del expediente.'
  }
}

export function qwenStatus(receipt: Receipt): 'skipped' | 'applied' | 'discarded' {
  if (!receipt.linguisticPostprocess) return 'skipped'
  return postprocessWasDiscarded(receipt) ? 'discarded' : 'applied'
}
