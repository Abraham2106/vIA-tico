import { workspaceToApi } from '../adapters/driving/renderer-bridge/index.ts'
import { createWebWorkspace } from './web.ts'
import type { DesktopApi } from '../ports/desktop-api.ts'

let apiPromise: Promise<DesktopApi> | undefined

/** Composition boundary for the web preview; renderer consumes only DesktopApi. */
export async function getRendererApi(): Promise<DesktopApi> {
  if (window.viatico) return window.viatico
  if (!apiPromise) {
    apiPromise = createWebWorkspace().then(({ workspace, storageInfo }) => workspaceToApi(workspace, storageInfo))
  }
  return apiPromise
}
