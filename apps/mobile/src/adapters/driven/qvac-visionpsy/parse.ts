import {
  CURRENCIES,
  DOCUMENT_TYPES,
  CONFIDENCE_LEVELS,
  RECEIPT_CATEGORIES,
  safeParseVisionResult,
  type VisionResult,
} from '@viaticocero/contracts'

/** JSON Schema explícito: `strict` de QVAC no aprieta el schema por sí solo. */
export const VISION_RESULT_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'proveedor',
    'fecha',
    'monto',
    'moneda',
    'tipo_documento',
    'confianza_lectura',
    'raw_text',
  ],
  properties: {
    proveedor: { type: 'string', minLength: 1 },
    fecha: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
    monto: { type: 'number', minimum: 0 },
    moneda: { type: 'string', enum: [...CURRENCIES] },
    tipo_documento: { type: 'string', enum: [...DOCUMENT_TYPES] },
    confianza_lectura: { type: 'string', enum: [...CONFIDENCE_LEVELS] },
    raw_text: { type: 'string' },
    categoria: { type: 'string', enum: [...RECEIPT_CATEGORIES] },
    motivo: { type: 'string' },
    iva: { type: 'number', minimum: 0 },
  },
} as const

export const VISIONPSY_EXTRACT_PROMPT = [
  'Lee el comprobante de la imagen.',
  'Responde solo un objeto JSON con: proveedor, fecha (YYYY-MM-DD), monto (número),',
  'moneda (CRC, MXN, USD o EUR), tipo_documento (recibo, factura, ticket u otro),',
  'confianza_lectura (alta, media o baja) y raw_text (texto visible).',
  'Opcional: categoria, motivo, iva.',
  'No inventes un veredicto. No apruebes el gasto.',
].join(' ')

export function parseVisionpsyCompletion(text: string): VisionResult {
  let parsedJson: unknown
  try {
    parsedJson = extractJsonObject(text)
  } catch {
    throw new Error('VisionPsy: salida sin JSON válido; schema rechazado')
  }
  const parsed = safeParseVisionResult(parsedJson)
  if (!parsed.success) {
    throw new Error('VisionPsy: schema inválido; completa el DTO a mano')
  }
  return parsed.data
}

function extractJsonObject(text: string): unknown {
  const trimmed = text.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = (fenced?.[1] ?? trimmed).trim()
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start === -1 || end <= start) {
    throw new Error('VisionPsy: salida sin objeto JSON')
  }
  return JSON.parse(candidate.slice(start, end + 1)) as unknown
}
