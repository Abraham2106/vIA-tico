import { createNodeSqliteSession } from './node-session.ts'
import type { OpenedSqlite } from './open.ts'

export async function openNodeSqlite(filePath?: string): Promise<OpenedSqlite> {
  const path = filePath ?? ':memory:'
  return {
    session: createNodeSqliteSession(path),
    info: {
      engine: 'sqlite3',
      location: path === ':memory:' ? 'memory' : 'file',
      driver: 'node:sqlite',
      path: path === ':memory:' ? undefined : path,
    },
  }
}
