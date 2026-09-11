import type { Database, SqlJsStatic } from 'sql.js'
import type { SqlPrimitive, SqliteSession } from './session.ts'

type InitSqlJs = (config?: { wasmBinary?: Buffer | Uint8Array; locateFile?: (file: string) => string }) => Promise<SqlJsStatic>

async function loadSqlJs(): Promise<SqlJsStatic> {
  const imported = (await import('sql.js')) as unknown as { default: InitSqlJs }
  const initSqlJs = imported.default
  const wasmUrl = (await import('sql.js/dist/sql-wasm.wasm?url')).default
  return initSqlJs({ locateFile: () => wasmUrl })
}

export function wrapSqlJsDatabase(db: Database, persistBytes: (bytes: Uint8Array) => Promise<void>): SqliteSession {
  let persistChain = Promise.resolve()

  function all<T extends Record<string, unknown>>(sql: string, params: SqlPrimitive[] = []): T[] {
    const stmt = db.prepare(sql)
    try {
      if (params.length > 0) stmt.bind(params)
      const rows: T[] = []
      while (stmt.step()) {
        rows.push(stmt.getAsObject() as T)
      }
      return rows
    } finally {
      stmt.free()
    }
  }

  return {
    exec(sql) {
      db.exec(sql)
    },
    run(sql, params = []) {
      db.run(sql, params)
    },
    get<T extends Record<string, unknown>>(sql: string, params: SqlPrimitive[] = []) {
      return all<T>(sql, params)[0] as T | undefined
    },
    all,
    persist() {
      persistChain = persistChain.then(async () => {
        await persistBytes(db.export())
      })
      return persistChain
    },
  }
}

export async function createSqlJsSession(
  bytes: Uint8Array | undefined,
  persistBytes: (bytes: Uint8Array) => Promise<void>,
): Promise<SqliteSession> {
  const SQL = await loadSqlJs()
  const db = bytes && bytes.byteLength > 0 ? new SQL.Database(bytes) : new SQL.Database()
  return wrapSqlJsDatabase(db, persistBytes)
}
