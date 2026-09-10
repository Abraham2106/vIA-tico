import { effectiveVerdict, formatMoney, labelForVerdict, type ExportPayload } from '@viaticocero/core'

export function receiptRows(payload: ExportPayload): string[][] {
  const header = [
    'id',
    'proveedor',
    'fecha',
    'monto',
    'moneda',
    'categoria',
    'veredicto',
    'reglas',
    'confianza',
  ]
  if (payload.includeRaw) header.push('raw')
  const rows = payload.receipts.map((receipt) => {
    const used = receipt.usedExtraction
    const row = [
      receipt.id,
      used.proveedor,
      used.fecha,
      String(used.monto),
      used.moneda,
      used.categoria ?? '',
      labelForVerdict(effectiveVerdict(receipt)),
      receipt.triggeredRules.map((rule) => rule.code).join('|'),
      used.confianza_lectura,
    ]
    if (payload.includeRaw) row.push(used.raw_text)
    return row
  })
  return [header, ...rows]
}

export function settlementLines(payload: ExportPayload): string[] {
  const s = payload.settlement
  return [
    `Viaje: ${payload.trip.destination} (${payload.trip.startDate} – ${payload.trip.endDate})`,
    `Viajero: ${payload.traveler.name}`,
    `Adelanto: ${formatMoney(s.advance)}`,
    `Respaldado: ${formatMoney(s.backedTotal)}`,
    `Aprobado: ${formatMoney(s.approvedTotal)}`,
    `En revisión: ${formatMoney(s.pendingReviewTotal)}`,
    `No procede: ${formatMoney(s.rejectedTotal)}`,
    `A reembolsar: ${formatMoney(s.toReimburse)}`,
    `A devolver: ${formatMoney(s.toReturn)}`,
    `Excepciones abiertas: ${s.openExceptionCount}`,
  ]
}

export function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}
