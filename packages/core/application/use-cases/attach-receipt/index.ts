import { audit } from '../../../domain/shared/audit.ts'
import type { FiredRule } from '../../../domain/shared/rules.ts'
import { applyDigitGuard } from '../../../domain/services/digit-guard.ts'
import { evaluateReceipt } from '../../../domain/services/verdict-engine.ts'
import type { Receipt } from '../../../domain/receipt/index.ts'
import type { AttachReceiptInput } from '../../ports/inbound/index.ts'
import type { CoreDeps } from '../../ports/outbound/workspace.ts'
import { validateExtraction } from '../validate-extraction/index.ts'
import { createAnalyzeWithLlm } from '../analyze-with-llm/index.ts'
import { createClassifyMotive } from '../classify-motive/index.ts'
import { createOpenException } from '../open-exception/index.ts'
import { createRecordAudit } from '../record-audit/index.ts'

export function createAttachReceipt(deps: CoreDeps) {
  const analyzeWithLlm = createAnalyzeWithLlm(deps.languageModel)
  const classifyMotive = createClassifyMotive(deps.languageModel)
  const openException = createOpenException(deps)
  const recordAudit = createRecordAudit(deps)

  return {
    async execute(input: AttachReceiptInput): Promise<Receipt> {
      const trip = await deps.trips.get(input.tripId)
      if (!trip) throw new Error(`Viaje ${input.tripId} no existe`)
      if (trip.status === 'settled') throw new Error('El viaje ya está liquidado')

      const parsed = validateExtraction.execute(input.extraction)
      const extraRules: FiredRule[] = []
      if (!parsed.ok) {
        extraRules.push({
          code: 'SCHEMA_INVALIDO',
          severity: 'review',
          message: parsed.message,
        })
      }

      const extraction = parsed.ok ? parsed.value : input.extraction
      const llm = await analyzeWithLlm.execute(extraction)
      const guarded = applyDigitGuard(extraction, llm.refined)
      if (guarded.discarded) {
        extraRules.push({
          code: 'DIGITOS_ALTERADOS',
          severity: 'review',
          message: `El postproceso cambió: ${guarded.alteredFields.join(', ')}`,
        })
      }

      const classified = await classifyMotive.execute({
        motivo: guarded.used.motivo,
        extraction: guarded.used,
      })
      extraRules.push(...classified.extraRules)

      let usedExtraction = guarded.used
      if (
        classified.classification &&
        classified.classification.confianza_clasificacion === 'alta' &&
        !usedExtraction.categoria
      ) {
        usedExtraction = {
          ...usedExtraction,
          categoria: classified.classification.categoria,
        }
      }

      const siblings = await deps.receipts.listByTrip(trip.id)
      const policy = await deps.policy.getActive()
      const evaluation = evaluateReceipt({
        trip,
        extraction: usedExtraction,
        policy,
        siblings,
        extraRules,
      })

      const now = deps.clock.nowIso()
      const receipt: Receipt = {
        id: deps.ids.next(),
        tripId: trip.id,
        capturedAt: now,
        attachmentPath: input.attachmentPath,
        sourceJobId: input.sourceJobId,
        extraction,
        linguisticPostprocess: llm.refined,
        motiveClassification: classified.classification,
        usedExtraction,
        verdict: evaluation.verdict,
        triggeredRules: evaluation.rules,
        audit: [
          audit(now, 'vision', 'extract', `confianza=${extraction.confianza_lectura}`),
          ...(llm.refined
            ? [audit(now, 'llm', llm.discarded ? 'postprocess-discarded' : 'postprocess', undefined)]
            : []),
          ...(classified.classification
            ? [
                audit(
                  now,
                  'llm',
                  'classify-motive',
                  `${classified.classification.categoria}/${classified.classification.confianza_clasificacion}`,
                ),
              ]
            : []),
          audit(now, 'system', 'verdict', evaluation.verdict),
        ],
      }

      await deps.receipts.save(receipt)
      const opened = await openException.execute(receipt)
      await recordAudit.writeMany(receipt.audit, { receiptId: receipt.id, tripId: receipt.tripId })
      if (opened) {
        await recordAudit.write({
          at: opened.openedAt,
          actor: 'system',
          action: 'open-exception',
          detail: opened.verdict,
          receiptId: receipt.id,
          tripId: receipt.tripId,
          exceptionId: opened.id,
        })
      }
      return receipt
    },
  }
}
