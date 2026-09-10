/**
 * Puerto opcional de delegated inference (Hyperswarm).
 * No es el camino de producto (ADR 0008). El expediente viaja por IJobTransport.
 */
export type QvacProviderStatus = 'stopped' | 'starting' | 'ready' | 'not-wired'

export interface IQvacProvider {
  status(): QvacProviderStatus
  start(): Promise<void>
  stop(): Promise<void>
  publicKey(): string | undefined
}
