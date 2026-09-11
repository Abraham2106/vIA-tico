import type { VisionRequest } from '@viaticocero/core'

export type VisionpsyProfile = NonNullable<VisionRequest['profile']>

/** Flash requiere el flag; Base lo deja unset (no mezclar). */
export function imageNoUpscaleFor(profile: VisionpsyProfile = 'flash'): 'on' | undefined {
  return profile === 'flash' ? 'on' : undefined
}
