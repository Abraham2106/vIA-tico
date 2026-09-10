import type { CurrencyCode, ReceiptCategory } from '@viaticocero/contracts'
import type { EntityId } from '../shared/ids.ts'

export type Policy = {
  id: EntityId
  name: string
  currency: CurrencyCode
  dailyMealCap?: number
  lodgingCapPerNight?: number
  maxReceiptAmount?: number
  representationRequiresNote: boolean
  categoryCaps?: Partial<Record<ReceiptCategory, number>>
}

export const DEFAULT_POLICY: Policy = {
  id: 'policy-default-cr',
  name: 'Política de viáticos CR (demo)',
  currency: 'CRC',
  dailyMealCap: 15_000,
  lodgingCapPerNight: 80_000,
  maxReceiptAmount: 500_000,
  representationRequiresNote: true,
  categoryCaps: {
    estacionamiento: 8_000,
    peaje: 10_000,
    representacion: 40_000,
  },
}
