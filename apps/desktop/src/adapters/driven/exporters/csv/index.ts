import type { ExportArtifact } from '@viaticocero/contracts'
import type { ExportPayload } from '@viaticocero/core'
import { csvEscape, receiptRows, settlementLines } from '../shared.ts'

export function exportCsv(payload: ExportPayload): ExportArtifact {
  const preamble = settlementLines(payload).map((line) => `# ${line}`)
  const table = receiptRows(payload).map((row) => row.map(csvEscape).join(','))
  const body = [...preamble, ...table].join('\n')
  return {
    format: 'csv',
    filename: `liquidacion-${payload.trip.id}.csv`,
    mimeType: 'text/csv;charset=utf-8',
    body,
  }
}
