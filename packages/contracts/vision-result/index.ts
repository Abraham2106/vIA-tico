import { z } from 'zod'

export const CURRENCIES = ['CRC', 'MXN', 'USD', 'EUR'] as const
export type CurrencyCode = (typeof CURRENCIES)[number]

export const DOCUMENT_TYPES = ['recibo', 'factura', 'ticket', 'otro'] as const
export type DocumentType = (typeof DOCUMENT_TYPES)[number]

export const CONFIDENCE_LEVELS = ['alta', 'media', 'baja'] as const
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number]

export const RECEIPT_CATEGORIES = [
  'combustible',
  'peaje',
  'alimentacion',
  'hospedaje',
  'estacionamiento',
  'representacion',
  'otro',
] as const
export type ReceiptCategory = (typeof RECEIPT_CATEGORIES)[number]

export const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

export const visionResultSchema = z.object({
  proveedor: z.string().trim().min(1, 'proveedor requerido'),
  fecha: z.string().regex(DATE_ONLY, 'fecha debe ser YYYY-MM-DD'),
  monto: z.number().finite().nonnegative(),
  moneda: z.enum(CURRENCIES),
  tipo_documento: z.enum(DOCUMENT_TYPES),
  confianza_lectura: z.enum(CONFIDENCE_LEVELS),
  raw_text: z.string(),
  categoria: z.enum(RECEIPT_CATEGORIES).optional(),
  motivo: z.string().optional(),
  iva: z.number().finite().nonnegative().optional(),
})

export type VisionResult = z.infer<typeof visionResultSchema>

export function parseVisionResult(input: unknown): VisionResult {
  return visionResultSchema.parse(input)
}

export function safeParseVisionResult(input: unknown) {
  return visionResultSchema.safeParse(input)
}

/** Campos que el postproceso lingüístico no puede alterar. */
export const IMMUTABLE_VISION_FIELDS = ['monto', 'fecha', 'moneda', 'iva'] as const
export type ImmutableVisionField = (typeof IMMUTABLE_VISION_FIELDS)[number]
