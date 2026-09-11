import { createSqlJsSession } from './sqljs-session.ts'
import { loadSqliteBytesFromIndexedDb, saveSqliteBytesToIndexedDb } from './indexeddb-store.ts'
import type { OpenedSqlite } from './open.ts'

/** Browser / Vite preview: SQLite 3 (sql.js) persisted as a binary in IndexedDB. */
export async function openWebSqlite(): Promise<OpenedSqlite> {
  if (typeof indexedDB === 'undefined') {
    return {
      session: await createSqlJsSession(undefined, async () => {}),
      info: { engine: 'sqlite3', location: 'memory', driver: 'sql.js' },
    }
  }
  const bytes = await loadSqliteBytesFromIndexedDb()
  return {
    session: await createSqlJsSession(bytes, saveSqliteBytesToIndexedDb),
    info: { engine: 'sqlite3', location: 'indexeddb', driver: 'sql.js' },
  }
}
