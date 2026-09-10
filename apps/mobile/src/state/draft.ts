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

export function getDraft(): CaptureDraft {
  return draft
}

export function setDraft(next: Partial<CaptureDraft>) {
  draft = { ...draft, ...next, dto: { ...draft.dto, ...(next.dto ?? {}) } }
}

export function resetDraft() {
  draft = { tripId: draft.tripId, dto: { ...DEFAULT_DTO } }
}

export function draftToJob(deviceId = 'mobile-local'): AnalysisJob {
  return {
    id: `job-${Date.now()}`,
    tripId: draft.tripId,
    createdAt: new Date().toISOString(),
    sourceDeviceId: deviceId,
    attachmentPath: draft.imagePath,
    visionResult: draft.dto,
    status: 'pending',
  }
}
