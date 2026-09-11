import type { MotiveClassification, VisionResult } from '@viaticocero/contracts'
import type { IClassifyMotive } from '../../ports/inbound/index.ts'
import type { ILanguageModel } from '../../ports/outbound/language-model.ts'
import type { FiredRule } from '../../../domain/shared/rules.ts'

export type ClassifyMotiveRequest = {
  motivo?: string
  extraction?: Pick<VisionResult, 'proveedor' | 'tipo_documento' | 'raw_text'>
}

export type ClassifyMotiveResult = {
  classification?: MotiveClassification
  skipped: boolean
  extraRules: FiredRule[]
}

function classificationRules(classification: MotiveClassification): FiredRule[] {
  if (classification.confianza_clasificacion === 'alta') return []
  return [
    {
      code: 'CONFIANZA_CLASIFICACION',
      severity: 'review',
      message: `confianza_clasificacion=${classification.confianza_clasificacion}: ${classification.razon}`,
    },
  ]
}

export function createClassifyMotive(languageModel: ILanguageModel): IClassifyMotive {
  return {
    async execute(input: ClassifyMotiveRequest): Promise<ClassifyMotiveResult> {
      const motivo = input.motivo?.trim()
      if (!motivo) {
        return { skipped: true, extraRules: [] }
      }
      if (languageModel.status() !== 'ready') {
        return { skipped: true, extraRules: [] }
      }
      const classification = await languageModel.classifyMotive({
        motivo,
        extraction: input.extraction,
      })
      return {
        classification,
        skipped: false,
        extraRules: classificationRules(classification),
      }
    },
  }
}
