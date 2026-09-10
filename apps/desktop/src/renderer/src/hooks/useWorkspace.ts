import { useCallback, useEffect, useState } from 'react'
import type { WorkspaceSnapshot } from '@viaticocero/core'
import { workspaceToApi, type DesktopApi } from '../../../adapters/driving/renderer-bridge/index.ts'
import { createWebWorkspace } from '../../../composition/web.ts'

let apiPromise: Promise<DesktopApi> | undefined

async function getApi(): Promise<DesktopApi> {
  if (window.viatico) return window.viatico
  if (!apiPromise) {
    apiPromise = createWebWorkspace().then(workspaceToApi)
  }
  return apiPromise
}

export function useWorkspace() {
  const [snapshot, setSnapshot] = useState<WorkspaceSnapshot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [api, setApi] = useState<DesktopApi | null>(null)

  const reload = useCallback(async () => {
    const client = await getApi()
    setApi(client)
    setSnapshot(await client.snapshot())
  }, [])

  useEffect(() => {
    void reload().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : String(err))
    })
  }, [reload])

  return { snapshot, error, api, reload }
}
