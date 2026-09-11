export type SqlPrimitive = string | number | null

export type StorageLocation = 'file' | 'indexeddb' | 'memory'

export type StorageInfo = {
  engine: 'sqlite3'
  location: StorageLocation
  driver: 'node:sqlite' | 'sql.js'
  path?: string
}

export type SqliteSession = {
  exec(sql: string): void
  run(sql: string, params?: SqlPrimitive[]): void
  get<T extends Record<string, unknown>>(sql: string, params?: SqlPrimitive[]): T | undefined
  all<T extends Record<string, unknown>>(sql: string, params?: SqlPrimitive[]): T[]
  persist(): Promise<void>
}

export function asSql(value: string | number | boolean | undefined | null): SqlPrimitive {
  if (value === undefined || value === null) return null
  if (typeof value === 'boolean') return value ? 1 : 0
  return value
}
