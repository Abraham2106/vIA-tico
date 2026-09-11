import { File, Paths } from 'expo-file-system'
import type { PairingPayload } from '@viaticocero/contracts'
import {
  DEFAULT_INBOX_URL,
  parseStoredPairing,
  serializePairing,
  toStoredPairing,
} from '../../src/state/pairing-persistence.ts'

export { DEFAULT_INBOX_URL }

export const PAIRING_FILE_NAME = 'viaticocero-pairing.json'

let pairing: PairingPayload = {
  desktopDeviceId: 'desktop-local',
  desktopName: 'ViáticoCero Desktop',
  pairingCode: '',
  inboxUrl: DEFAULT_INBOX_URL,
  transport: 'dto',
  createdAt: new Date().toISOString(),
}

let hydratePromise: Promise<void> | undefined

function pairingFile(): File {
  return new File(Paths.document, PAIRING_FILE_NAME)
}

async function hydrateFromDisk(): Promise<void> {
  try {
    const file = pairingFile()
    if (!file.exists) return
    const raw = await file.text()
    const stored = parseStoredPairing(raw)
    pairing = {
      ...pairing,
      pairingCode: stored.pairingCode,
      inboxUrl: stored.inboxUrl,
      transport: 'dto',
    }
  } catch {
    // Conserva el default en memoria si el archivo está corrupto o no hay disco.
  }
}

export function getPairing(): PairingPayload {
  return pairing
}

export function setPairing(next: Partial<PairingPayload>) {
  pairing = { ...pairing, ...next, transport: 'dto' }
}

/** Carga el pairing persistido. Idempotente; preview y emparejar lo esperan al arrancar. */
export async function loadPairing(): Promise<PairingPayload> {
  if (!hydratePromise) {
    hydratePromise = hydrateFromDisk()
  }
  await hydratePromise
  return pairing
}

export async function savePairing(next: Partial<PairingPayload>): Promise<PairingPayload> {
  await loadPairing()
  const stored = toStoredPairing({ ...pairing, ...next })
  setPairing({
    pairingCode: stored.pairingCode,
    inboxUrl: stored.inboxUrl,
    transport: 'dto',
  })
  const file = pairingFile()
  if (file.exists) file.delete()
  file.create()
  file.write(serializePairing(stored))
  return pairing
}
