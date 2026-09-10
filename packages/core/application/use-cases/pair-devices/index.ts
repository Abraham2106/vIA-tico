import type { PairedDevice, PairingPayload } from '@viaticocero/contracts'
import type { IPairDevices } from '../../ports/inbound/index.ts'
import type { CoreDeps } from '../../ports/outbound/workspace.ts'

export function createPairDevices(deps: Pick<CoreDeps, 'pairing' | 'clock' | 'ids'>): IPairDevices {
  return {
    getPayload() {
      return deps.pairing.getPayload()
    },
    list() {
      return deps.pairing.listDevices()
    },
    register(device: PairedDevice) {
      return deps.pairing.saveDevice(device)
    },
    async rotate() {
      const current = await deps.pairing.getPayload()
      const next: PairingPayload = {
        ...current,
        pairingCode: randomPairingCode(),
        createdAt: deps.clock.nowIso(),
      }
      await deps.pairing.rotateCode(next)
      return next
    },
  }
}

export function randomPairingCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}
