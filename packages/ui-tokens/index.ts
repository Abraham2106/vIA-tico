import type { ConfidenceLevel, ReceiptCategory } from '@viaticocero/contracts'

export type ColorMode = 'light' | 'dark'
export type ThemePreference = 'light' | 'dark' | 'auto'
export type ConfidenceTone = 'high' | 'medium' | 'low'
export type FeedbackTone = 'success' | 'warning' | 'error' | 'info'

type Dual = { light: string; dark: string }

export const THEME_STORAGE_KEY = 'viaticocero-theme'

export const tokens = {
  color: {
    brand: {
      primary: { light: '#0A1628', dark: '#3B82F6' } satisfies Dual,
      secondary: { light: '#1A56DB', dark: '#60A5FA' } satisfies Dual,
      tertiary: { light: '#3B82F6', dark: '#93C5FD' } satisfies Dual,
    },
    surface: {
      default: { light: '#E8ECF1', dark: '#0C0E12' } satisfies Dual,
      raised: { light: '#FFFFFF', dark: '#161A22' } satisfies Dual,
      sunken: { light: '#F1F4F8', dark: '#0A0C10' } satisfies Dual,
      header: { light: '#0A1628', dark: '#111827' } satisfies Dual,
      inverse: { light: '#0F1720', dark: '#F9FAFB' } satisfies Dual,
    },
    content: {
      primary: { light: '#111827', dark: '#F9FAFB' } satisfies Dual,
      secondary: { light: '#4B5563', dark: '#9CA3AF' } satisfies Dual,
      tertiary: { light: '#6B7280', dark: '#9CA3AF' } satisfies Dual,
      inverse: { light: '#FFFFFF', dark: '#111827' } satisfies Dual,
      brand: { light: '#1A56DB', dark: '#60A5FA' } satisfies Dual,
    },
    border: {
      default: { light: '#E5E7EB', dark: '#374151' } satisfies Dual,
      strong: { light: '#D1D5DB', dark: '#4B5563' } satisfies Dual,
      error: { light: '#DC2626', dark: '#F87171' } satisfies Dual,
      success: { light: '#059669', dark: '#34D399' } satisfies Dual,
    },
    interactive: {
      default: { light: '#1A56DB', dark: '#3B82F6' } satisfies Dual,
      hover: { light: '#1E40AF', dark: '#2563EB' } satisfies Dual,
      pressed: { light: '#1E3A8A', dark: '#1D4ED8' } satisfies Dual,
      disabled: { light: '#9CA3AF', dark: '#4B5563' } satisfies Dual,
      surface: { light: '#EFF6FF', dark: '#1E3A5F' } satisfies Dual,
    },
    feedback: {
      success: { light: '#059669', dark: '#34D399' } satisfies Dual,
      successBg: { light: '#ECFDF5', dark: '#064E3B' } satisfies Dual,
      warning: { light: '#D97706', dark: '#FBBF24' } satisfies Dual,
      warningBg: { light: '#FFFBEB', dark: '#78350F' } satisfies Dual,
      error: { light: '#DC2626', dark: '#F87171' } satisfies Dual,
      errorBg: { light: '#FEF2F2', dark: '#7F1D1D' } satisfies Dual,
      info: { light: '#1A56DB', dark: '#60A5FA' } satisfies Dual,
      infoBg: { light: '#EFF6FF', dark: '#1E3A5F' } satisfies Dual,
    },
    category: {
      combustible: { light: '#2563EB', dark: '#60A5FA' } satisfies Dual,
      peaje: { light: '#0891B2', dark: '#22D3EE' } satisfies Dual,
      alimentacion: { light: '#059669', dark: '#34D399' } satisfies Dual,
      hospedaje: { light: '#7C3AED', dark: '#A78BFA' } satisfies Dual,
      estacionamiento: { light: '#1A56DB', dark: '#93C5FD' } satisfies Dual,
      representacion: { light: '#D97706', dark: '#FBBF24' } satisfies Dual,
      otro: { light: '#6B7280', dark: '#9CA3AF' } satisfies Dual,
    },
    confidence: {
      high: { light: '#059669', dark: '#34D399' } satisfies Dual,
      medium: { light: '#D97706', dark: '#FBBF24' } satisfies Dual,
      low: { light: '#DC2626', dark: '#F87171' } satisfies Dual,
    },
  },
  type: {
    fontFamily: {
      regular: 'Inter',
      medium: 'Inter',
      semibold: 'Inter',
      bold: 'Inter',
      mono: 'IBM Plex Mono',
    },
    scale: {
      display: { size: 22, weight: '600', lineHeight: 28 },
      heading: { size: 16, weight: '600', lineHeight: 22 },
      subheading: { size: 14, weight: '500', lineHeight: 20 },
      body: { size: 14, weight: '400', lineHeight: 20 },
      bodySmall: { size: 12, weight: '400', lineHeight: 16 },
      caption: { size: 11, weight: '500', lineHeight: 14 },
      mono: { size: 14, weight: '400', lineHeight: 20 },
    },
  },
  elevation: {
    low: '0 1px 2px rgba(0, 0, 0, 0.05)',
    medium: '0 4px 6px rgba(0, 0, 0, 0.07)',
    high: '0 10px 15px rgba(0, 0, 0, 0.1)',
  },
  space: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
  },
  radius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  motion: {
    fast: 150,
    normal: 200,
    slow: 300,
    progress: 400,
    pressedOpacity: 0.72,
  },
} as const

export const CATEGORY_LABELS: Record<ReceiptCategory, string> = {
  combustible: 'Combustible',
  peaje: 'Peaje',
  alimentacion: 'Alimentación',
  hospedaje: 'Hospedaje',
  estacionamiento: 'Estacionamiento',
  representacion: 'Representación',
  otro: 'Otros',
}

const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export function formatDisplayDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!match) return iso
  const monthIndex = Number(match[2]) - 1
  const month = MONTHS_SHORT[monthIndex]
  if (!month) return iso
  return `${match[3]} ${month} ${match[1]}`
}

export function confidenceTone(level: ConfidenceLevel): ConfidenceTone {
  if (level === 'alta') return 'high'
  if (level === 'media') return 'medium'
  return 'low'
}

/** Visual band only. The DTO has alta/media/baja — never invent a model percentage. */
export function confidenceFill(level: ConfidenceLevel): number {
  if (level === 'alta') return 100
  if (level === 'media') return 66
  return 33
}

export function categoryColor(category: ReceiptCategory | undefined, mode: ColorMode): string {
  const key = category ?? 'otro'
  return tokens.color.category[key][mode]
}

export function pick(dual: Dual, mode: ColorMode): string {
  return dual[mode]
}

/** Mobile pressed feedback. Desktop uses Carbon layer-active. */
export function pressedStyle(pressed: boolean): { opacity: number } | null {
  return pressed ? { opacity: tokens.motion.pressedOpacity } : null
}

export function feedbackForVerdict(verdict: 'PROCEDE' | 'REVISION' | 'NO_PROCEDE'): FeedbackTone {
  if (verdict === 'PROCEDE') return 'success'
  if (verdict === 'REVISION') return 'warning'
  return 'error'
}

export function exceptionTone(severity: 'review' | 'reject'): FeedbackTone {
  return severity === 'reject' ? 'error' : 'warning'
}

export function resolveColorMode(
  preference: ThemePreference,
  system: ColorMode,
): ColorMode {
  if (preference === 'auto') return system
  return preference
}
