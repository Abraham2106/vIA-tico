export const PAIRING_CODE_HEADER = 'X-Pairing-Code'

/** Headers del POST /jobs. El escritorio responde 401 si el código no coincide. */
export function inboxJobHeaders(pairingCode?: string): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const code = pairingCode?.trim()
  if (code) headers[PAIRING_CODE_HEADER] = code
  return headers
}
