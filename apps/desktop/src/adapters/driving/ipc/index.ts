/**
 * IPC driving adapter.
 * En Electron, el main registra estos canales hacia createWorkspace.
 * El renderer nunca importa @qvac/sdk.
 */
export const IPC_CHANNELS = {
  snapshot: 'viatico:snapshot',
  registerTrip: 'viatico:register-trip',
  attachReceipt: 'viatico:attach-receipt',
  ingestJob: 'viatico:ingest-job',
  resolveException: 'viatico:resolve-exception',
  settleTrip: 'viatico:settle-trip',
  closeTrip: 'viatico:close-trip',
  exportReport: 'viatico:export-report',
  updatePolicy: 'viatico:update-policy',
  pairing: 'viatico:pairing',
  rotatePairing: 'viatico:rotate-pairing',
  storageInfo: 'viatico:storage-info',
  inboxStatus: 'viatico:inbox-status',
  inboxJob: 'viatico:inbox-job',
  qvacStatus: 'viatico:qvac-status',
  qvacLoad: 'viatico:qvac-load',
  qvacUnload: 'viatico:qvac-unload',
  qvacProgress: 'viatico:qvac-progress',
} as const
