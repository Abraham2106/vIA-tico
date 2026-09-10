import type { IDetectDuplicates } from '../../ports/inbound/index.ts'
import { findDuplicate } from '../../../domain/services/duplicates.ts'

export const detectDuplicates: IDetectDuplicates = {
  execute({ candidate, siblings, excludeId }) {
    return findDuplicate(candidate, siblings, excludeId)
  },
}
