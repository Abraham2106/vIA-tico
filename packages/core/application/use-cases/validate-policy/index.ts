import type { IValidatePolicy } from '../../ports/inbound/index.ts'
import { evaluateReceipt } from '../../../domain/services/verdict-engine.ts'
import { DEFAULT_POLICY } from '../../../domain/policy/index.ts'

export function createValidatePolicy(): IValidatePolicy {
  return {
    execute({ trip, extraction, siblings }) {
      return evaluateReceipt({
        trip,
        extraction,
        siblings,
        policy: DEFAULT_POLICY,
      }).rules
    },
  }
}
