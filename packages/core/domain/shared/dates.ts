const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

export function isDateOnly(value: string): boolean {
  return DATE_ONLY.test(value)
}

export function compareDateOnly(a: string, b: string): number {
  if (a === b) return 0
  return a < b ? -1 : 1
}

export function isDateInInclusiveRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end
}

export function assertDateOnly(value: string, field: string): void {
  if (!DATE_ONLY.test(value)) {
    throw new Error(`${field} debe ser YYYY-MM-DD`)
  }
}
