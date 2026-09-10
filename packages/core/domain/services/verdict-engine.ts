import { safeParseVisionResult, type VisionResult } from '@viaticocero/contracts'
import type { Policy } from '../policy/index.ts'
import type { Receipt } from '../receipt/index.ts'
import type { Trip } from '../trip/index.ts'
import { isDateInInclusiveRange } from '../shared/dates.ts'
import { type FiredRule } from '../shared/rules.ts'
import type { Verdict } from '../shared/verdict.ts'
import { isAmbiguousMotive } from './ambiguous-motive.ts'
import { findDuplicate } from './duplicates.ts'

export type EvaluationInput = {
  trip: Trip
  extraction: VisionResult
  policy: Policy
  siblings: Receipt[]
  extraRules?: FiredRule[]
  excludeReceiptId?: string
}

export type EvaluationResult = {
  verdict: Verdict
  rules: FiredRule[]
}

export function evaluateReceipt(input: EvaluationInput): EvaluationResult {
  const parsed = safeParseVisionResult(input.extraction)
  const rules: FiredRule[] = [...(input.extraRules ?? [])]

  if (!parsed.success) {
    rules.push({
      code: 'SCHEMA_INVALIDO',
      severity: 'review',
      message: parsed.error.issues.map((issue) => issue.message).join('; '),
    })
    return combine(rules)
  }

  const extraction = parsed.data

  if (extraction.confianza_lectura === 'baja') {
    rules.push({
      code: 'CONFIANZA_BAJA',
      severity: 'review',
      message: 'confianza_lectura=baja fuerza REVISIÓN aunque el resto cuadre',
    })
  } else if (extraction.confianza_lectura === 'media') {
    rules.push({
      code: 'CONFIANZA_MEDIA',
      severity: 'review',
      message: 'confianza_lectura=media no puede liquidarse en automático',
    })
  }

  if (!extraction.raw_text.trim() && extraction.confianza_lectura !== 'alta') {
    rules.push({
      code: 'DOCUMENTO_ILEGIBLE',
      severity: 'review',
      message: 'Documento sin RAW usable; no se inventan campos',
    })
  }

  if (!isDateInInclusiveRange(extraction.fecha, input.trip.startDate, input.trip.endDate)) {
    rules.push({
      code: 'FECHA_FUERA_PERIODO',
      severity: 'review',
      message: `Fecha ${extraction.fecha} fuera de ${input.trip.startDate}–${input.trip.endDate}`,
    })
  }

  const duplicate = findDuplicate(extraction, input.siblings, input.excludeReceiptId)
  if (duplicate) {
    rules.push({
      code: 'DUPLICADO',
      severity: 'review',
      message: `Mismo proveedor + fecha + monto que ${duplicate.id}`,
    })
    // Un duplicado no es gasto nuevo: no se apilan topes sobre el original.
    return combine(rules)
  }

  if (extraction.moneda !== input.policy.currency) {
    rules.push({
      code: 'MONEDA_DISTINTA_POLITICA',
      severity: 'review',
      message: `Moneda ${extraction.moneda} ≠ política ${input.policy.currency}`,
    })
  }

  if (input.policy.maxReceiptAmount != null && extraction.monto > input.policy.maxReceiptAmount) {
    rules.push({
      code: 'TOPE_MONTO',
      severity: 'reject',
      message: `Monto ${extraction.monto} supera el tope ${input.policy.maxReceiptAmount}`,
    })
  }

  const category = extraction.categoria
  if (category && input.policy.categoryCaps?.[category] != null) {
    const cap = input.policy.categoryCaps[category]
    if (cap != null && extraction.monto > cap) {
      rules.push({
        code: 'TOPE_CATEGORIA',
        severity: 'reject',
        message: `Categoría ${category} supera tope ${cap}`,
      })
    }
  }

  if (category === 'alimentacion' && input.policy.dailyMealCap != null) {
    const sameDay = input.siblings
      .filter((item) => item.id !== input.excludeReceiptId)
      .filter((item) => item.usedExtraction.categoria === 'alimentacion')
      .filter((item) => item.usedExtraction.fecha === extraction.fecha)
      .reduce((sum, item) => sum + item.usedExtraction.monto, 0)
    if (sameDay + extraction.monto > input.policy.dailyMealCap) {
      rules.push({
        code: 'TOPE_ALIMENTACION_DIA',
        severity: 'reject',
        message: `Alimentación del ${extraction.fecha} supera ${input.policy.dailyMealCap}`,
      })
    }
  }

  if (category === 'hospedaje' && input.policy.lodgingCapPerNight != null) {
    if (extraction.monto > input.policy.lodgingCapPerNight) {
      rules.push({
        code: 'TOPE_HOSPEDAJE',
        severity: 'reject',
        message: `Hospedaje ${extraction.monto} supera ${input.policy.lodgingCapPerNight} por noche`,
      })
    }
  }

  if (category === 'representacion' && input.policy.representationRequiresNote && !extraction.motivo?.trim()) {
    rules.push({
      code: 'MOTIVO_AMBIGUO',
      severity: 'review',
      message: 'Representación exige nota / motivo',
    })
  }

  if (isAmbiguousMotive(extraction.motivo)) {
    rules.push({
      code: 'MOTIVO_AMBIGUO',
      severity: 'review',
      message: `Motivo poco específico: «${extraction.motivo}»`,
    })
  }

  return combine(rules)
}

export function combineRules(rules: FiredRule[]): Verdict {
  if (rules.some((rule) => rule.severity === 'reject')) return 'NO_PROCEDE'
  if (rules.length > 0) return 'REVISION'
  return 'PROCEDE'
}

function combine(rules: FiredRule[]): EvaluationResult {
  return { verdict: combineRules(rules), rules }
}
