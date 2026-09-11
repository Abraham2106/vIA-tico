import type { Database, SqlJsStatic } from 'sql.js'
import type { SqlPrimitive, SqliteSession } from './session.ts'

type InitSqlJs = (config?: { wasmBinary?: Buffer | Uint8Array; locateFile?: (file: string) => string }) => Promise<SqlJsStatic>

function unwrapInitSqlJs(mod: unknown): InitSqlJs {
  const seen = new Set<unknown>()
  let current: unknown = mod
  while (current && !seen.has(current)) {
    seen.add(current)
    if (typeof current === 'function') return current as InitSqlJs
    if (typeof current === 'object') {
      const rec = current as Record<string, unknown>
      if (typeof rec.default === 'function') return rec.default as InitSqlJs
      if (typeof rec.initSqlJs === 'function') return rec.initSqlJs as InitSqlJs
      if (typeof rec.Module === 'function') return rec.Module as InitSqlJs
      current = rec.default ?? rec.Module
      continue
    }
    break
  }
  throw new Error('sql.js no exportó initSqlJs como función')
}

async function loadSqlJs(): Promise<SqlJsStatic> {
  const [mod, wasmUrl] = await Promise.all([
    import('sql.js/dist/sql-wasm-browser.js'),
    import('sql.js/dist/sql-wasm-browser.wasm?url'),
  ])
  const initSqlJs = unwrapInitSqlJs(mod)
  return initSqlJs({ locateFile: () => wasmUrl.default })
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
