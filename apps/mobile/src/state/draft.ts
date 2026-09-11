import type { AnalysisJob, VisionResult } from '@viaticocero/contracts'

export type CaptureDraft = {
  imagePath?: string
  tripId: string
  dto: VisionResult
}

const DEFAULT_DTO: VisionResult = {
  proveedor: '',
  fecha: '2026-09-12',
  monto: 0,
  moneda: 'CRC',
  tipo_documento: 'recibo',
  confianza_lectura: 'alta',
  raw_text: '',
  categoria: 'alimentacion',
}

let draft: CaptureDraft = {
  tripId: 'trip-liberia-sep',
  dto: { ...DEFAULT_DTO },
}

export function normalizeMotive(motivo: string | undefined): string | undefined {
  const trimmed = motivo?.trim()
  return trimmed ? trimmed : undefined
}

export function getDraft(): CaptureDraft {
  return draft
}

export function setDraft(next: Partial<Omit<CaptureDraft, 'dto'>> & { dto?: Partial<VisionResult> }) {
  const dtoPatch = next.dto ? { ...next.dto } : undefined
  if (dtoPatch && Object.prototype.hasOwnProperty.call(dtoPatch, 'motivo')) {
    dtoPatch.motivo = normalizeMotive(dtoPatch.motivo)
  }
  draft = { ...draft, ...next, dto: { ...draft.dto, ...(dtoPatch ?? {}) } }
}

export function resetDraft() {
  draft = { tripId: draft.tripId, dto: { ...DEFAULT_DTO } }
}

export function hasCaptureDraft(value: CaptureDraft = draft): boolean {
  return Boolean(
    value.imagePath ||
      value.dto.proveedor.trim() ||
      value.dto.monto > 0 ||
      normalizeMotive(value.dto.motivo) ||
      value.dto.raw_text.trim(),
  )
}

export function visionResultFromDraft(dto: VisionResult = draft.dto): VisionResult {
  const motivo = normalizeMotive(dto.motivo)
  const visionResult: VisionResult = { ...dto }
  if (motivo) {
    visionResult.motivo = motivo
  } else {
    delete visionResult.motivo
  }
  return visionResult
}

export function draftToJob(deviceId = 'mobile-local'): AnalysisJob {
  return {
    id: `job-${Date.now()}`,
    tripId: draft.tripId,
    createdAt: new Date().toISOString(),
    sourceDeviceId: deviceId,
    attachmentPath: draft.imagePath,
    visionResult: visionResultFromDraft(draft.dto),
    status: 'pending',
  }
}
