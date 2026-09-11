import { workspaceToApi } from '../adapters/driving/renderer-bridge/index.ts'
import { createWebWorkspace } from './web.ts'
import type { DesktopApi, InboxStatus } from '../ports/desktop-api.ts'

let apiPromise: Promise<DesktopApi> | undefined

/** Composition boundary for the web preview; renderer consumes only DesktopApi. */
export async function getRendererApi(): Promise<DesktopApi> {
  if (window.viatico) return window.viatico
  if (!apiPromise) {
    apiPromise = createWebWorkspace().then(async ({ workspace, storageInfo }) => {
      const inboxStatus = async () => {
        const status = await readWebInboxStatus()
        if (status.listening && status.url) {
          const pairing = await workspace.pairDevices.getPayload()
          if (pairing.inboxUrl !== status.url) {
            await workspace.deps.pairing.rotateCode({ ...pairing, inboxUrl: status.url })
          }
        }
        return status
      }
      await inboxStatus()
      return workspaceToApi(workspace, storageInfo, { inboxStatus })
    })
  }
  return apiPromise
}

async function readWebInboxStatus(): Promise<InboxStatus> {
  const port = window.__VIATICOCERO_INBOX_PORT__ ?? 47_821
  try {
    const response = await fetch(`http://127.0.0.1:${port}/health`)
    if (!response.ok) {
      return { listening: false, port, lastError: `Inbox HTTP respondió ${response.status}` }
    }
    return {
      listening: true,
      url: response.headers.get('X-Inbox-Url') ?? `http://127.0.0.1:${port}`,
      port: Number(response.headers.get('X-Inbox-Port') ?? port),
    }
  } catch (error) {
    return {
      listening: false,
      port,
      lastError: error instanceof Error ? error.message : String(error),
    }
  }
}
