import type { IQvacProvider } from '@viaticocero/core'

/**
 * Stub de startQVACProvider / Hyperswarm.
 * El camino de producto es IJobTransport (DTO), no delegated inference.
 */
export class QvacProviderStub implements IQvacProvider {
  status() {
    return 'not-wired' as const
  }
  async start(): Promise<void> {
    throw new Error('IQvacProvider no cableado: delegated inference queda para el adaptador QVAC')
  }
  async stop(): Promise<void> {}
  publicKey(): undefined {
    return undefined
  }
}
