import type { CurrencyCode } from '@viaticocero/contracts'

export type Money = {
  amount: number
  currency: CurrencyCode
}

export function money(amount: number, currency: CurrencyCode): Money {
  return { amount, currency }
}

export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`No se pueden sumar ${a.currency} y ${b.currency}`)
  }
  return { amount: roundMoney(a.amount + b.amount), currency: a.currency }
}

export function subtractMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`No se pueden restar ${a.currency} y ${b.currency}`)
  }
  return { amount: roundMoney(a.amount - b.amount), currency: a.currency }
}

export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100
}

export function formatMoney(value: Money, locale = 'es-CR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: value.currency,
    maximumFractionDigits: value.currency === 'CRC' ? 0 : 2,
  }).format(value.amount)
}
