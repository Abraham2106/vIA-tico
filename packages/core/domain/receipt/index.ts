import type { MotiveClassification, VisionResult } from '@viaticocero/contracts'
import type { AuditEntry } from '../shared/audit.ts'
import type { EntityId } from '../shared/ids.ts'
import type { FiredRule } from '../shared/rules.ts'
import type { Verdict } from '../shared/verdict.ts'

export type HumanDecision = {
  verdict: Verdict
  note: string
  decidedAt: string
  decidedBy: string
}

export type Receipt = {
  id: EntityId
  tripId: EntityId
  capturedAt: string
  attachmentPath?: string
  sourceJobId?: string
  extraction: VisionResult
  linguisticPostprocess?: VisionResult
  motiveClassification?: MotiveClassification
  usedExtraction: VisionResult
  verdict: Verdict
  triggeredRules: FiredRule[]
  humanDecision?: HumanDecision
  audit: AuditEntry[]
}

export function effectiveVerdict(receipt: Receipt): Verdict {
  return receipt.humanDecision?.verdict ?? receipt.verdict
}

export function isExceptionRow(receipt: Receipt): boolean {
  const verdict = effectiveVerdict(receipt)
  return verdict === 'REVISION' || verdict === 'NO_PROCEDE'
}
