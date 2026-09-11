import type { SerializedMemory } from '@viaticocero/core'
import { importSerialized, tripCount, type SqliteRepositories } from './repositories.ts'
import type { SqliteSession } from './session.ts'

export const LEGACY_STORAGE_KEY = 'viaticocero.desktop.v1'

function readLegacyBlob(): SerializedMemory | undefined {
  if (typeof localStorage === 'undefined') return undefined
  const raw = localStorage.getItem(LEGACY_STORAGE_KEY)
  if (!raw) return undefined
  try {
    return JSON.parse(raw) as SerializedMemory
  } catch {
    return undefined
  }
}

/** Moves the previous JSON blob into SQLite once, then drops the old key. */
export async function migrateLegacyLocalStorage(
  session: SqliteSession,
  repos: SqliteRepositories,
): Promise<boolean> {
  if (tripCount(session) > 0) return false
  const parsed = readLegacyBlob()
  if (!parsed?.trips?.length) return false
  try {
    await importSerialized(repos, parsed)
    localStorage.removeItem(LEGACY_STORAGE_KEY)
    return true
  } catch {
    return false
  }
}
