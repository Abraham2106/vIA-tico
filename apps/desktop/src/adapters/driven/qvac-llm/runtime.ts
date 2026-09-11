export type CompletionRole = 'system' | 'user' | 'assistant'

export type CompletionMessage = {
  role: CompletionRole
  content: string
}

export type LoadProgress = {
  percentage: number
  downloaded?: number
  total?: number
}

export type RuntimeLoadRequest = {
  catalogId: string
  modelType: 'llamacpp-completion'
  localSrc?: string
  modelConfig: Record<string, unknown>
  onProgress?: (progress: LoadProgress) => void
}

export type RuntimeCompleteRequest = {
  modelId: string
  history: readonly CompletionMessage[]
  schemaName: string
  jsonSchema: Record<string, unknown>
  generation: { temp: number; predict: number; seed: number }
}

export type RuntimeCompleteResult = {
  requestId: string
  contentText: string
}

export type RuntimeCancelRequest = {
  requestId: string
}

/**
 * Puerto del runtime QVAC. El hexágono no lo ve.
 * Permite tests con un doble; el SDK queda aislado en sdk-runtime.ts.
 */
export interface QvacCompletionRuntime {
  load(request: RuntimeLoadRequest): Promise<string>
  complete(request: RuntimeCompleteRequest): Promise<RuntimeCompleteResult>
  cancel(request: RuntimeCancelRequest): Promise<void>
  unload(modelId: string): Promise<void>
  close(): Promise<void>
}
