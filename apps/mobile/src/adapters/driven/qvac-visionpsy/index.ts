import {
  completion,
  loadModel,
  unloadModel,
  MMPROJ_VISIONPSY_NANO_460M_MULTIMODAL_Q8_0,
  MMPROJ_VISIONPSY_NANO_460M_MULTIMODAL_Q8_0_1,
  VISIONPSY_NANO_460M_MULTIMODAL_Q4_K_M,
  VISIONPSY_NANO_460M_MULTIMODAL_Q4_K_M_1,
} from '@qvac/sdk'
import type { IVisionInference, VisionPortStatus, VisionRequest, VisionResult } from '@viaticocero/core'
import { parseVisionpsyCompletion, VISIONPSY_EXTRACT_PROMPT, VISION_RESULT_JSON_SCHEMA } from './parse.ts'
import { imageNoUpscaleFor, type VisionpsyProfile } from './profile.ts'

type LoadedSession = {
  modelId: string
  profile: VisionpsyProfile
}

export class QvacVisionPsyAdapter implements IVisionInference {
  private session: LoadedSession | undefined
  private loading: Promise<string> | undefined
  private portStatus: VisionPortStatus = 'not-wired'

  status(): VisionPortStatus {
    return this.portStatus
  }

  async analyze(request: VisionRequest): Promise<VisionResult> {
    if (!request.imagePath) {
      throw new Error('VisionPsy: falta imagePath en disco')
    }
    const profile: VisionpsyProfile = request.profile ?? 'flash'
    const modelId = await this.ensureLoaded(profile)
    const run = completion({
      modelId,
      history: [
        {
          role: 'user',
          content: VISIONPSY_EXTRACT_PROMPT,
          attachments: [{ path: request.imagePath }],
        },
      ],
      stream: false,
      responseFormat: {
        type: 'json_schema',
        json_schema: {
          name: 'vision_result',
          schema: VISION_RESULT_JSON_SCHEMA,
        },
      },
    })
    const final = await run.final
    return parseVisionpsyCompletion(final.contentText || final.raw.fullText)
  }

  async release(): Promise<void> {
    const modelId = this.session?.modelId
    this.session = undefined
    this.loading = undefined
    this.portStatus = 'not-wired'
    if (!modelId) return
    await unloadModel({ modelId, clearStorage: false })
  }

  private async ensureLoaded(profile: VisionpsyProfile): Promise<string> {
    if (this.session?.profile === profile) return this.session.modelId
    if (this.session) {
      await unloadModel({ modelId: this.session.modelId, clearStorage: false })
      this.session = undefined
    }
    if (!this.loading) {
      this.loading = this.loadProfile(profile)
    }
    try {
      const modelId = await this.loading
      this.session = { modelId, profile }
      this.portStatus = 'ready'
      return modelId
    } catch (error) {
      this.portStatus = 'unavailable'
      throw error
    } finally {
      this.loading = undefined
    }
  }

  private async loadProfile(profile: VisionpsyProfile): Promise<string> {
    const pair = profile === 'base'
      ? {
          modelSrc: VISIONPSY_NANO_460M_MULTIMODAL_Q4_K_M_1,
          projectionModelSrc: MMPROJ_VISIONPSY_NANO_460M_MULTIMODAL_Q8_0_1,
        }
      : {
          modelSrc: VISIONPSY_NANO_460M_MULTIMODAL_Q4_K_M,
          projectionModelSrc: MMPROJ_VISIONPSY_NANO_460M_MULTIMODAL_Q8_0,
        }
    const imageNoUpscale = imageNoUpscaleFor(profile)
    return loadModel({
      modelSrc: pair.modelSrc,
      modelType: 'llm',
      modelConfig: {
        ctx_size: 2048,
        projectionModelSrc: pair.projectionModelSrc,
        ...(imageNoUpscale ? { image_no_upscale: imageNoUpscale } : {}),
      },
    })
  }
}

export class ManualDtoVision implements IVisionInference {
  constructor(private readonly dto: VisionResult) {}
  status() {
    return 'ready' as const
  }
  async analyze(): Promise<VisionResult> {
    return this.dto
  }
}
