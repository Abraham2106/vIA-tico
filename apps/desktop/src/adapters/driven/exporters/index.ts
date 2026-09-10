import type { ExportFormat } from '@viaticocero/contracts'
import type { ExportPayload, IReportExporter } from '@viaticocero/core'
import { exportCsv } from './csv/index.ts'
import { exportJson } from './json/index.ts'
import { exportPdf } from './pdf/index.ts'
import { exportXlsx } from './xlsx/index.ts'

export class DesktopReportExporter implements IReportExporter {
  async export(format: ExportFormat, payload: ExportPayload) {
    switch (format) {
      case 'json':
        return exportJson(payload)
      case 'csv':
        return exportCsv(payload)
      case 'xlsx':
        return exportXlsx(payload)
      case 'pdf':
        return exportPdf(payload)
    }
  }
}
