import { Tag } from '@carbon/react'
import type { ReceiptCategory } from '@viaticocero/contracts'
import { CATEGORY_LABELS } from '@viaticocero/ui-tokens'

const TYPE: Record<ReceiptCategory, 'blue' | 'cyan' | 'teal' | 'purple' | 'magenta' | 'outline' | 'gray'> = {
  combustible: 'blue',
  peaje: 'cyan',
  alimentacion: 'teal',
  hospedaje: 'purple',
  estacionamiento: 'magenta',
  representacion: 'outline',
  otro: 'gray',
}

export function CategoryChip({
  category,
  source,
}: {
  category: ReceiptCategory | undefined
  source?: 'ai' | 'manual'
}) {
  const key = category ?? 'otro'
  const label = source === 'ai' ? `${CATEGORY_LABELS[key]} · IA` : CATEGORY_LABELS[key]
  return (
    <Tag type={TYPE[key]} size="sm">
      {label}
    </Tag>
  )
}
