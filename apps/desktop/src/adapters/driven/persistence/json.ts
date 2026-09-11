export function readJson<T>(raw: string | null | undefined): T | undefined {
  if (raw == null || raw === '') return undefined
  return JSON.parse(raw) as T
}

export function writeJson(value: unknown): string {
  return JSON.stringify(value)
}
