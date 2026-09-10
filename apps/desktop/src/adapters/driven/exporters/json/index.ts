import type { ExportArtifact } from '@viaticocero/contracts'
import { effectiveVerdict, type ExportPayload } from '@viaticocero/core'

export function exportJson(payload: ExportPayload): ExportArtifact {
  const body = JSON.stringify(
    {
      trip: payload.trip,
      traveler: payload.traveler,
      settlement: payload.settlement,
      receipts: payload.receipts.map((receipt) => ({
        id: receipt.id,
        verdict: effectiveVerdict(receipt),
        automaticVerdict: receipt.verdict,
        humanDecision: receipt.humanDecision,
        used: receipt.usedExtraction,
        rules: receipt.triggeredRules,
        audit: receipt.audit,
        raw: payload.includeRaw ? receipt.usedExtraction.raw_text : undefined,
      })),
    },
    null,
    2,
  )
  return {
    format: 'json',
    filename: `liquidacion-${payload.trip.id}.json`,
    mimeType: 'application/json',
    body,
  }
}
