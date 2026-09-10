import { z } from 'zod'
import { CONFIDENCE_LEVELS, RECEIPT_CATEGORIES } from '../vision-result/index.ts'

/**
 * Boca del clasificador de motivo (Qwen Instruct).
 * El JSON no lleva veredicto: eso solo lo escribe packages/core.
 */
export const motiveClassificationSchema = z
  .object({
    categoria: z.enum(RECEIPT_CATEGORIES),
    razon: z.string().trim().min(1, 'razon requerida'),
    confianza_clasificacion: z.enum(CONFIDENCE_LEVELS),
  })
  .strict()

export type MotiveClassification = z.infer<typeof motiveClassificationSchema>

export function parseMotiveClassification(input: unknown): MotiveClassification {
  return motiveClassificationSchema.parse(input)
}

export function safeParseMotiveClassification(input: unknown) {
  return motiveClassificationSchema.safeParse(input)
}
