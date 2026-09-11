import type { Workspace } from '@viaticocero/core'
import { DEFAULT_INSTRUCT_CATALOG_ID } from '../../driven/qvac-llm/config.ts'
import type {
  DesktopApi,
  InboxStatus,
  QvacDesktopStatus,
  QvacLlmProgress,
  StorageInfo,
} from '../../../ports/desktop-api.ts'
export type { DesktopApi, InboxStatus, QvacDesktopStatus, QvacLlmProgress, StorageInfo } from '../../../ports/desktop-api.ts'

type QvacController = {
  snapshot(): QvacLlmProgress
  load(): Promise<unknown>
  unload(): Promise<unknown>
  close?: () => Promise<void>
  setProgressListener?: (listener?: (progress: QvacLlmProgress) => void) => void
}

function qvacControllerOfModel(model: Workspace['deps']['languageModel']): QvacController | undefined {
  const candidate = model as Workspace['deps']['languageModel'] & Partial<QvacController>
  return typeof candidate.snapshot === 'function' &&
    typeof candidate.load === 'function' &&
    typeof candidate.unload === 'function'
    ? candidate as QvacController
    : undefined
}

function fallbackProgress(workspace: Workspace): QvacLlmProgress {
  return {
    phase: 'idle',
    catalogId: DEFAULT_INSTRUCT_CATALOG_ID,
    message: 'Sin controlador Qwen',
    status: workspace.deps.languageModel.status(),
  }
}

function statusOf(workspace: Workspace): QvacDesktopStatus {
  const controller = qvacControllerOfModel(workspace.deps.languageModel)
  return {
    llm: workspace.deps.languageModel.status(),
    provider: workspace.deps.qvacProvider.status(),
    vision: workspace.deps.vision.status(),
    progress: controller?.snapshot() ?? fallbackProgress(workspace),
  }
}

export function workspaceToApi(
  workspace: Workspace,
  storageInfo: StorageInfo,
  options: { inboxStatus?: () => Promise<InboxStatus> } = {},
): DesktopApi {
  return {
    snapshot: () => workspace.snapshot(),
    registerTrip: (input) => workspace.registerTrip(input),
    attachReceipt: (input) => workspace.attachReceipt(input),
    ingestJob: (job) => workspace.ingestVisionResult(job),
    resolveException: (input) => workspace.resolveException(input),
    settleTrip: (tripId) => workspace.settleTrip(tripId),
    closeTrip: (tripId) => workspace.closeTrip(tripId),
    exportReport: (input) => workspace.exportReport(input),
    updatePolicy: (patch) => workspace.updatePolicy(patch),
    pairing: () => workspace.pairDevices.getPayload(),
    rotatePairing: () => workspace.pairDevices.rotate(),
    storageInfo: async () => storageInfo,
    inboxStatus: async () =>
      options.inboxStatus?.() ?? { listening: false, lastError: 'Inbox HTTP no configurado' },
    qvacStatus: async () => statusOf(workspace),
    async loadQwen() {
      const model = workspace.deps.languageModel
      const controller = qvacControllerOfModel(model)
      if (!controller) throw new Error('Qwen Instruct no está cableado en este entorno. Usa Electron.')
      await controller.load()
      return statusOf(workspace)
    },
    async unloadQwen() {
      const model = workspace.deps.languageModel
      const controller = qvacControllerOfModel(model)
      if (!controller) throw new Error('Qwen Instruct no está cableado en este entorno.')
      await controller.unload()
      return statusOf(workspace)
    },
  }
}

export function qvacControllerOf(workspace: Workspace) {
  return qvacControllerOfModel(workspace.deps.languageModel)
}

declare global {
  interface Window {
    viatico?: DesktopApi
  }
}
