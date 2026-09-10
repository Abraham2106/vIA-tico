import {
  createEmptyMemoryState,
  hydrateMemory,
  serializeMemory,
  type MemoryState,
  type SerializedMemory,
} from '@viaticocero/core'

const STORAGE_KEY = 'viaticocero.desktop.v1'

export function loadPersistedState(nowIso: string): MemoryState {
  if (typeof localStorage === 'undefined') {
    return createEmptyMemoryState(nowIso)
  }
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return createEmptyMemoryState(nowIso)
  try {
    const parsed = JSON.parse(raw) as SerializedMemory
    return hydrateMemory(parsed)
  } catch {
    return createEmptyMemoryState(nowIso)
  }
}

export function persistState(state: MemoryState): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeMemory(state)))
}

export function clearPersistedState(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
