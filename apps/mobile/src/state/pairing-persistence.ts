export const DEFAULT_INBOX_URL = 'http://127.0.0.1:47821'

/** Campos que el celular persiste. El transporte de producto es DTO, no QVAC delegate. */
export type StoredPairing = {
  pairingCode: string
  inboxUrl: string
  transport: 'dto'
}

export function defaultStoredPairing(): StoredPairing {
  return {
    pairingCode: '',
    inboxUrl: DEFAULT_INBOX_URL,
    transport: 'dto',
  }
}

export function toStoredPairing(input: {
  pairingCode?: string
  inboxUrl?: string
  transport?: string
}): StoredPairing {
  const inbox = input.inboxUrl?.trim() ?? ''
  return {
    pairingCode: input.pairingCode?.trim() ?? '',
    inboxUrl: inbox || DEFAULT_INBOX_URL,
    transport: 'dto',
  }
}

export function serializePairing(input: {
  pairingCode?: string
  inboxUrl?: string
  transport?: string
}): string {
  return JSON.stringify(toStoredPairing(input))
}

export function parseStoredPairing(raw: string): StoredPairing {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return defaultStoredPairing()
    }
    const record = parsed as Record<string, unknown>
    return toStoredPairing({
      pairingCode: typeof record.pairingCode === 'string' ? record.pairingCode : '',
      inboxUrl: typeof record.inboxUrl === 'string' ? record.inboxUrl : undefined,
    })
  } catch {
    return defaultStoredPairing()
  }
}
