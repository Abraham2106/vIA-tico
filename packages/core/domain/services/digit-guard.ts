import {
  IMMUTABLE_VISION_FIELDS,
  type ImmutableVisionField,
  type VisionResult,
} from '@viaticocero/contracts'

export type DigitGuardResult =
  | { ok: true }
  | { ok: false; fields: ImmutableVisionField[] }

export function compareImmutableFields(raw: VisionResult, refined: VisionResult): DigitGuardResult {
  const fields: ImmutableVisionField[] = []
  for (const field of IMMUTABLE_VISION_FIELDS) {
    if (raw[field] !== refined[field]) {
      fields.push(field)
    }
  }
  return fields.length === 0 ? { ok: true } : { ok: false, fields }
}

export function applyDigitGuard(
  raw: VisionResult,
  refined: VisionResult | undefined,
): { used: VisionResult; discarded: boolean; alteredFields: ImmutableVisionField[] } {
  if (!refined) {
    return { used: raw, discarded: false, alteredFields: [] }
  }
  const comparison = compareImmutableFields(raw, refined)
  if (comparison.ok) {
    return { used: refined, discarded: false, alteredFields: [] }
  }
  return { used: raw, discarded: true, alteredFields: comparison.fields }
}
