const DB_NAME = 'viaticocero'
const STORE = 'sqlite'
const KEY = 'expediente'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed'))
  })
}

export async function loadSqliteBytesFromIndexedDb(): Promise<Uint8Array | undefined> {
  const db = await openDb()
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly')
      const request = tx.objectStore(STORE).get(KEY)
      request.onsuccess = () => {
        const value = request.result as ArrayBuffer | Uint8Array | undefined
        if (!value) {
          resolve(undefined)
          return
        }
        resolve(value instanceof Uint8Array ? value : new Uint8Array(value))
      }
      request.onerror = () => reject(request.error ?? new Error('IndexedDB read failed'))
    })
  } finally {
    db.close()
  }
}

export async function saveSqliteBytesToIndexedDb(bytes: Uint8Array): Promise<void> {
  const db = await openDb()
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error ?? new Error('IndexedDB write failed'))
      tx.objectStore(STORE).put(bytes, KEY)
    })
  } finally {
    db.close()
  }
}
