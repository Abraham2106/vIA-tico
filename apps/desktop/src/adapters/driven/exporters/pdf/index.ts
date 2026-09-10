import type { ExportArtifact } from '@viaticocero/contracts'
import type { ExportPayload } from '@viaticocero/core'
import { receiptRows, settlementLines } from '../shared.ts'

function pdfEscape(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

export function exportPdf(payload: ExportPayload): ExportArtifact {
  const lines = [
    'ViaticoCero — liquidacion',
    ...settlementLines(payload),
    '',
    ...receiptRows(payload).map((row) => row.join(' | ')),
  ]
  const content = lines
    .map((line, index) => `BT /F1 10 Tf 40 ${780 - index * 14} Td (${pdfEscape(line.slice(0, 110))}) Tj ET`)
    .join('\n')
  const stream = content
  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj',
    `4 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
    '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Courier >> endobj',
  ]
  let offset = 9
  const xref = ['0000000000 65535 f ']
  const chunks = ['%PDF-1.4\n']
  for (const object of objects) {
    xref.push(`${String(offset).padStart(10, '0')} 00000 n `)
    chunks.push(`${object}\n`)
    offset += object.length + 1
  }
  const xrefPos = offset
  chunks.push(`xref\n0 ${objects.length + 1}\n${xref.join('\n')}\n`)
  chunks.push(`trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`)
  const body = chunks.join('')
  return {
    format: 'pdf',
    filename: `liquidacion-${payload.trip.id}.pdf`,
    mimeType: 'application/pdf',
    body,
  }
}
