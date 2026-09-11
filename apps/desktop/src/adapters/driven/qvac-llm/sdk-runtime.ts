import { QvacLlmError } from './errors.ts'
import type {
  QvacCompletionRuntime,
  RuntimeCancelRequest,
  RuntimeCompleteRequest,
  RuntimeCompleteResult,
  RuntimeLoadRequest,
} from './runtime.ts'

type QvacSdk = typeof import('@qvac/sdk')

export type SdkModuleLoader = () => Promise<QvacSdk>

function catalogDescriptor(sdk: QvacSdk, catalogId: string): unknown {
  const value = (sdk as unknown as Record<string, unknown>)[catalogId]
  if (value === undefined) {
    throw new QvacLlmError(
      'INVALID_INPUT',
      `El catálogo QVAC no expone ${catalogId}. Usa QWEN3_4B_INST_Q4_K_M.`,
    )
  }
  return value
}

export function createSdkCompletionRuntime(
  loadSdk: SdkModuleLoader = () => import('@qvac/sdk'),
): QvacCompletionRuntime {
  let sdkPromise: Promise<QvacSdk> | undefined
  const sdk = () => {
    sdkPromise ??= loadSdk()
    return sdkPromise
  }

  return {
    async load(request: RuntimeLoadRequest): Promise<string> {
      const client = await sdk()
      if (request.localSrc) {
        return client.loadModel({
          modelSrc: request.localSrc,
          modelType: 'llamacpp-completion',
          modelConfig: request.modelConfig,
          onProgress: request.onProgress,
        } as never)
      }
      return client.loadModel({
        modelSrc: catalogDescriptor(client, request.catalogId) as never,
        modelConfig: request.modelConfig,
        onProgress: request.onProgress,
      } as never)
    },

    async complete(request: RuntimeCompleteRequest): Promise<RuntimeCompleteResult> {
      const client = await sdk()
      const run = client.completion({
        modelId: request.modelId,
        history: request.history.map((message) => ({ role: message.role, content: message.content })),
        stream: false,
        kvCache: false,
        captureThinking: true,
        generationParams: {
          temp: request.generation.temp,
          predict: request.generation.predict,
          seed: request.generation.seed,
        },
        responseFormat: {
          type: 'json_schema',
          json_schema: { name: request.schemaName, schema: request.jsonSchema },
        },
      })
      const final = await run.final
      return { requestId: run.requestId, contentText: final.contentText }
    },

    async cancel(request: RuntimeCancelRequest): Promise<void> {
      const client = await sdk()
      await client.cancel(request)
    },

    async unload(modelId: string): Promise<void> {
      const client = await sdk()
      await client.unloadModel({ modelId, clearStorage: false, autoClose: false })
    },

    async close(): Promise<void> {
      if (!sdkPromise) return
      const client = await sdkPromise
      await client.close()
    },
  }
}
