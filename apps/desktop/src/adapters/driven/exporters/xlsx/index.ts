import type { ExportArtifact } from '@viaticocero/contracts'
import type { ExportPayload } from '@viaticocero/core'
import { receiptRows, settlementLines } from '../shared.ts'

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function cellXml(value: string): string {
  const numeric = /^-?\d+(\.\d+)?$/.test(value)
  if (numeric) {
    return `<Cell><Data ss:Type="Number">${xmlEscape(value)}</Data></Cell>`
  }
  return `<Cell><Data ss:Type="String">${xmlEscape(value)}</Data></Cell>`
}

export function exportXlsx(payload: ExportPayload): ExportArtifact {
  const summary = settlementLines(payload).map((line) => `<Row>${cellXml(line)}</Row>`).join('')
  const table = receiptRows(payload)
    .map((row) => `<Row>${row.map(cellXml).join('')}</Row>`)
    .join('')
  const body = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Liquidacion">
  <Table>
   ${summary}
   <Row></Row>
   ${table}
  </Table>
 </Worksheet>
</Workbook>
`
  return {
    format: 'xlsx',
    filename: `liquidacion-${payload.trip.id}.xls`,
    mimeType: 'application/vnd.ms-excel',
    body,
  }
}
