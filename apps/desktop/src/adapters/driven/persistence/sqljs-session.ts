import type { Database, SqlJsStatic } from 'sql.js'
import type { SqlPrimitive, SqliteSession } from './session.ts'

type InitSqlJs = (config?: { wasmBinary?: Buffer | Uint8Array; locateFile?: (file: string) => string }) => Promise<SqlJsStatic>

async function loadSqlJs(): Promise<SqlJsStatic> {
  const [jsMod, wasmMod] = await Promise.all([
    import('sql.js/dist/sql-wasm.js?url'),
    import('sql.js/dist/sql-wasm.wasm?url'),
  ])
  const w = window as Window & { initSqlJs?: InitSqlJs }
  if (typeof w.initSqlJs !== 'function') {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = jsMod.default
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('No se pudo descargar el motor SQLite (sql-wasm.js)'))
      document.head.appendChild(script)
    })
  }
  if (typeof w.initSqlJs !== 'function') {
    throw new Error('sql.js no dejó initSqlJs en window')
  }
  const wasmBinary = new Uint8Array(await (await fetch(wasmMod.default)).arrayBuffer())
  return w.initSqlJs({ wasmBinary })
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
