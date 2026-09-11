import { app, BrowserWindow, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import { IPC_CHANNELS } from '../adapters/driving/ipc/index.ts'
import { qvacControllerOf, workspaceToApi } from '../adapters/driving/renderer-bridge/index.ts'
import { createElectronWorkspace } from '../composition/electron/index.ts'
import { resolveQvacConfigPath } from '../composition/qvac-config-path.ts'

if (process.platform === 'linux') {
  app.commandLine.appendSwitch('no-sandbox')
}

let closing = false

async function createWindow() {
  process.env.QVAC_CONFIG_PATH = resolveQvacConfigPath({
    packaged: app.isPackaged,
    resourcesPath: process.resourcesPath,
    unpackagedPath: fileURLToPath(new URL('../../config/qvac/qvac.config.json', import.meta.url)),
    override: process.env.QVAC_CONFIG_PATH,
  })
  const { workspace, storageInfo } = await createElectronWorkspace()
  const api = workspaceToApi(workspace, storageInfo)
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
    if (closing || !controller?.close) return
    event.preventDefault()
    closing = true
    void controller.close().finally(() => {
      app.quit()
    })
  })
}

app.whenReady().then(() => {
  void createWindow()
})
