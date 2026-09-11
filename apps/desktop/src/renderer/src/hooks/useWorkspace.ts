import { useCallback, useEffect, useState } from 'react'
import type { WorkspaceSnapshot } from '@viaticocero/core'
import { getRendererApi } from '../../../composition/renderer-api.ts'
import type { DesktopApi } from '../../../ports/desktop-api.ts'

export function useWorkspace() {
  const [snapshot, setSnapshot] = useState<WorkspaceSnapshot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [api, setApi] = useState<DesktopApi | null>(null)

  const reload = useCallback(async () => {
    const client = await getRendererApi()
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
