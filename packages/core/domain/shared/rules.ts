export const RULE_CODES = [
  'FECHA_FUERA_PERIODO',
  'DUPLICADO',
  'CONFIANZA_BAJA',
  'CONFIANZA_MEDIA',
  'SCHEMA_INVALIDO',
  'DIGITOS_ALTERADOS',
  'TOPE_CATEGORIA',
  'TOPE_MONTO',
  'TOPE_ALIMENTACION_DIA',
  'TOPE_HOSPEDAJE',
  'MOTIVO_AMBIGUO',
  'DOCUMENTO_ILEGIBLE',
  'MONEDA_DISTINTA_POLITICA',
] as const

export type RuleCode = (typeof RULE_CODES)[number]

export type RuleSeverity = 'review' | 'reject'

export type FiredRule = {
  code: RuleCode
  severity: RuleSeverity
  message: string
}

export const RULE_LABELS: Record<RuleCode, string> = {
  FECHA_FUERA_PERIODO: 'Fecha fuera del período',
  DUPLICADO: 'Posible duplicado',
  CONFIANZA_BAJA: 'Confianza de lectura baja',
  CONFIANZA_MEDIA: 'Confianza de lectura media',
  SCHEMA_INVALIDO: 'Schema inválido',
  DIGITOS_ALTERADOS: 'Postproceso alteró dígitos',
  TOPE_CATEGORIA: 'Tope de categoría excedido',
  TOPE_MONTO: 'Tope de monto excedido',
  TOPE_ALIMENTACION_DIA: 'Tope diario de alimentación',
  TOPE_HOSPEDAJE: 'Tope de hospedaje por noche',
  MOTIVO_AMBIGUO: 'Motivo ambiguo',
  DOCUMENTO_ILEGIBLE: 'Documento ilegible',
  MONEDA_DISTINTA_POLITICA: 'Moneda distinta a la política',
}
