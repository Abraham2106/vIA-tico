import {
  CONFIDENCE_LEVELS,
  CURRENCIES,
  DOCUMENT_TYPES,
  RECEIPT_CATEGORIES,
} from '@viaticocero/contracts'

const confidence = { type: 'string', enum: [...CONFIDENCE_LEVELS] }

export const REFINE_JSON_SCHEMA = {
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
    proveedor: { type: 'string' },
    fecha: { type: 'string' },
    monto: { type: 'number' },
    moneda: { type: 'string', enum: [...CURRENCIES] },
    tipo_documento: { type: 'string', enum: [...DOCUMENT_TYPES] },
    confianza_lectura: confidence,
    raw_text: { type: 'string' },
    categoria: { type: 'string', enum: [...RECEIPT_CATEGORIES] },
    motivo: { type: 'string' },
    iva: { type: 'number' },
  },
} as const

export const CLASSIFY_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['categoria', 'razon', 'confianza_clasificacion'],
  properties: {
    categoria: { type: 'string', enum: [...RECEIPT_CATEGORIES] },
    razon: { type: 'string' },
    confianza_clasificacion: confidence,
  },
} as const
