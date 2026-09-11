import type { MotiveClassification, VisionResult } from '@viaticocero/contracts'
import type { IClock } from '../application/ports/outbound/clock.ts'
import type { IIdGenerator } from '../application/ports/outbound/ids.ts'
import type { ILanguageModel } from '../application/ports/outbound/language-model.ts'
import type { IQvacProvider } from '../application/ports/outbound/qvac-provider.ts'
import type { ExportPayload, IReportExporter } from '../application/ports/outbound/exporter.ts'
import type { IVisionInference } from '../application/ports/outbound/vision.ts'

export class SystemClock implements IClock {
  nowIso(): string {
    return new Date().toISOString()
  }
}

export class FixedClock implements IClock {
  constructor(private value: string) {}
  nowIso(): string {
    return this.value
  }
}

export class UuidGenerator implements IIdGenerator {
  next(): string {
    return crypto.randomUUID()
  }
}

export class SequenceIdGenerator implements IIdGenerator {
  private n = 0
  next(): string {
    this.n += 1
    return `id-${this.n}`
  }
}

/** Adaptador no-op: el motor QVAC no está cableado. */
export class UnwiredLanguageModel implements ILanguageModel {
  status() {
    return 'not-wired' as const
  }
  async refine(extraction: VisionResult): Promise<VisionResult> {
    return extraction
  }
  async classifyMotive(): Promise<MotiveClassification> {
    throw new Error('ILanguageModel: classify-motive requiere Qwen Instruct cableado')
  }
}

/** Adaptador no-op: VisionPsy vive en el adaptador móvil QVAC. */
export class UnwiredVision implements IVisionInference {
  status() {
    return 'not-wired' as const
  }
  async analyze(): Promise<VisionResult> {
    throw new Error('IVisionInference: adaptador QVAC VisionPsy no cableado')
  }
}

export class UnwiredQvacProvider implements IQvacProvider {
  status() {
    return 'not-wired' as const
  }
  async start(): Promise<void> {
    throw new Error('IQvacProvider: startQVACProvider no cableado')
  }
  async stop(): Promise<void> {}
  publicKey(): undefined {
    return undefined
  }
}

export class JsonReportExporter implements IReportExporter {
  async export(format: import('@viaticocero/contracts').ExportFormat, payload: ExportPayload) {
    const body = JSON.stringify(
      {
        trip: payload.trip,
        traveler: payload.traveler,
        settlement: payload.settlement,
        receipts: payload.receipts.map((receipt) => ({
          id: receipt.id,
          verdict: receipt.humanDecision?.verdict ?? receipt.verdict,
          used: receipt.usedExtraction,
          rules: receipt.triggeredRules,
          raw: payload.includeRaw ? receipt.usedExtraction.raw_text : undefined,
        })),
      },
      null,
      2,
    )
    return {
      format,
      filename: `liquidacion-${payload.trip.id}.json`,
      mimeType: 'application/json',
      body,
    }
  }
}

export class ManualVision implements IVisionInference {
  constructor(private readonly result: VisionResult) {}
  status() {
    return 'ready' as const
  }
  async analyze(): Promise<VisionResult> {
    return this.result
  }
}
