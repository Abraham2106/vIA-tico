import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import type { SqlPrimitive, SqliteSession } from './session.ts'

/** SQLite 3 via Node's built-in `node:sqlite` (Electron main + tests). */
export function createNodeSqliteSession(path: string): SqliteSession {
  if (path !== ':memory:') {
    mkdirSync(dirname(path), { recursive: true })
  }
  const db = new DatabaseSync(path)
  db.exec('PRAGMA foreign_keys = ON')
  if (path !== ':memory:') {
    db.exec('PRAGMA journal_mode = WAL')
  }

  return {
    exec(sql) {
      db.exec(sql)
    },
    run(sql, params = []) {
      db.prepare(sql).run(...params)
    },
    get<T extends Record<string, unknown>>(sql: string, params: SqlPrimitive[] = []) {
      return db.prepare(sql).get(...params) as T | undefined
    },
    all<T extends Record<string, unknown>>(sql: string, params: SqlPrimitive[] = []) {
      return db.prepare(sql).all(...params) as T[]
    },
    async persist() {
      // DatabaseSync with a file path already writes on each statement.
    },
  }
}
