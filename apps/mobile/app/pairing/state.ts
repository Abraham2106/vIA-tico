import type { PairingPayload } from '@viaticocero/contracts'

let pairing: PairingPayload = {
  desktopDeviceId: 'desktop-local',
  desktopName: 'ViáticoCero Desktop',
  pairingCode: '',
  inboxUrl: 'http://127.0.0.1:47821',
  transport: 'dto',
  createdAt: new Date().toISOString(),
}

export function getPairing(): PairingPayload {
  return pairing
}

export function setPairing(next: Partial<PairingPayload>) {
  pairing = { ...pairing, ...next }
}
