import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../adapters/driving/ipc/index.ts'
import type { QvacLlmProgress } from '../ports/desktop-api.ts'

const api = {
  snapshot: () => ipcRenderer.invoke(IPC_CHANNELS.snapshot),
  registerTrip: (input: unknown) => ipcRenderer.invoke(IPC_CHANNELS.registerTrip, input),
  attachReceipt: (input: unknown) => ipcRenderer.invoke(IPC_CHANNELS.attachReceipt, input),
  ingestJob: (job: unknown) => ipcRenderer.invoke(IPC_CHANNELS.ingestJob, job),
  resolveException: (input: unknown) => ipcRenderer.invoke(IPC_CHANNELS.resolveException, input),
  settleTrip: (tripId: string) => ipcRenderer.invoke(IPC_CHANNELS.settleTrip, tripId),
  closeTrip: (tripId: string) => ipcRenderer.invoke(IPC_CHANNELS.closeTrip, tripId),
  exportReport: (input: unknown) => ipcRenderer.invoke(IPC_CHANNELS.exportReport, input),
  updatePolicy: (patch: unknown) => ipcRenderer.invoke(IPC_CHANNELS.updatePolicy, patch),
  pairing: () => ipcRenderer.invoke(IPC_CHANNELS.pairing),
  rotatePairing: () => ipcRenderer.invoke(IPC_CHANNELS.rotatePairing),
  qvacStatus: () => ipcRenderer.invoke(IPC_CHANNELS.qvacStatus),
  loadQwen: () => ipcRenderer.invoke(IPC_CHANNELS.qvacLoad),
  unloadQwen: () => ipcRenderer.invoke(IPC_CHANNELS.qvacUnload),
  onQvacProgress: (listener: (progress: QvacLlmProgress) => void) => {
    const wrapped = (_event: unknown, progress: QvacLlmProgress) => listener(progress)
    ipcRenderer.on(IPC_CHANNELS.qvacProgress, wrapped)
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.qvacProgress, wrapped)
    }
  },
}

contextBridge.exposeInMainWorld('viatico', api)
