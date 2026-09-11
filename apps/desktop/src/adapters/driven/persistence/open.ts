import type { StorageInfo, SqliteSession } from './session.ts'

export type OpenedSqlite = {
  session: SqliteSession
  info: StorageInfo
}
