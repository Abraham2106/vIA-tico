import { app, BrowserWindow, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import { createInboxHttpServer, type InboxHttpServer } from '../adapters/driven/inbox-http/server.ts'
import { IPC_CHANNELS } from '../adapters/driving/ipc/index.ts'
import { qvacControllerOf, workspaceToApi } from '../adapters/driving/renderer-bridge/index.ts'
import { createElectronWorkspace } from '../composition/electron/index.ts'
import { resolveQvacConfigPath } from '../composition/qvac-config-path.ts'

if (process.platform === 'linux') {
  app.commandLine.appendSwitch('no-sandbox')
}

let closing = false
let inbox: InboxHttpServer | undefined
let mainWindow: BrowserWindow | undefined

async function createWindow() {
  process.env.QVAC_CONFIG_PATH = resolveQvacConfigPath({
    packaged: app.isPackaged,
    resourcesPath: process.resourcesPath,
    unpackagedPath: fileURLToPath(new URL('../../config/qvac/qvac.config.json', import.meta.url)),
    override: process.env.QVAC_CONFIG_PATH,
  })
  const { workspace, storageInfo } = await createElectronWorkspace()
  inbox = createInboxHttpServer({
    getPairingCode: async () => (await workspace.pairDevices.getPayload()).pairingCode,
    onJob: async (job) => {
      await workspace.ingestVisionResult(job)
      if (!mainWindow?.isDestroyed()) {
        mainWindow.webContents.send(IPC_CHANNELS.inboxJob, job)
      }
    },
  })
  const inboxStatus = await inbox.start()
  if (inboxStatus.listening && inboxStatus.url) {
    const pairing = await workspace.pairDevices.getPayload()
    await workspace.deps.pairing.rotateCode({ ...pairing, inboxUrl: inboxStatus.url })
  }

  const api = workspaceToApi(workspace, storageInfo, {
    inboxStatus: async () => inbox?.status() ?? { listening: false, lastError: 'Inbox no inicializado' },
  })
  const controller = qvacControllerOf(workspace)

  ipcMain.handle(IPC_CHANNELS.snapshot, () => api.snapshot())
  ipcMain.handle(IPC_CHANNELS.registerTrip, (_e, input) => api.registerTrip(input))
  ipcMain.handle(IPC_CHANNELS.attachReceipt, (_e, input) => api.attachReceipt(input))
  ipcMain.handle(IPC_CHANNELS.ingestJob, (_e, job) => api.ingestJob(job))
  ipcMain.handle(IPC_CHANNELS.resolveException, (_e, input) => api.resolveException(input))
  ipcMain.handle(IPC_CHANNELS.settleTrip, (_e, tripId) => api.settleTrip(tripId))
  ipcMain.handle(IPC_CHANNELS.closeTrip, (_e, tripId) => api.closeTrip(tripId))
  ipcMain.handle(IPC_CHANNELS.exportReport, (_e, input) => api.exportReport(input))
  ipcMain.handle(IPC_CHANNELS.updatePolicy, (_e, patch) => api.updatePolicy(patch))
  ipcMain.handle(IPC_CHANNELS.pairing, () => api.pairing())
  ipcMain.handle(IPC_CHANNELS.rotatePairing, () => api.rotatePairing())
  ipcMain.handle(IPC_CHANNELS.storageInfo, () => api.storageInfo())
  ipcMain.handle(IPC_CHANNELS.inboxStatus, () => api.inboxStatus())
  ipcMain.handle(IPC_CHANNELS.qvacStatus, () => api.qvacStatus())
  ipcMain.handle(IPC_CHANNELS.qvacLoad, () => api.loadQwen())
  ipcMain.handle(IPC_CHANNELS.qvacUnload, () => api.unloadQwen())

  const window = new BrowserWindow({
    width: 1280,
    height: 840,
    webPreferences: {
      preload: fileURLToPath(new URL('../preload/index.js', import.meta.url)),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })
  mainWindow = window

  controller?.setProgressListener?.((snapshot) => {
    if (!window.isDestroyed()) {
      window.webContents.send(IPC_CHANNELS.qvacProgress, snapshot)
    }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    await window.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    await window.loadFile(fileURLToPath(new URL('../renderer/index.html', import.meta.url)))
  }

  app.on('before-quit', (event) => {
    if (closing) return
    event.preventDefault()
    closing = true
    void Promise.all([
      inbox?.stop().catch(() => undefined),
      controller?.close().catch(() => undefined),
    ]).finally(() => {
      app.quit()
    })
  })
}

app.whenReady().then(() => {
  void createWindow()
})
