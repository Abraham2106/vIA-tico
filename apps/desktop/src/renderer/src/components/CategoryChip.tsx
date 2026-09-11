import { Tag } from '@carbon/react'
import type { ReceiptCategory } from '@viaticocero/contracts'
import { CATEGORY_LABELS, categoryColor } from '@viaticocero/ui-tokens'
import { useTheme } from '../theme/ThemeProvider'

export function CategoryChip({
  category,
  source,
}: {
  category: ReceiptCategory | undefined
  source?: 'ai' | 'manual'
}) {
  const { carbonTheme } = useTheme()
  const key = category ?? 'otro'
  const mode = carbonTheme === 'g90' ? 'dark' : 'light'
  const color = categoryColor(key, mode)
  const label = source === 'ai' ? `${CATEGORY_LABELS[key]} · IA` : CATEGORY_LABELS[key]
  return (
    <Tag type="outline" size="sm" className="vz-category-chip" style={{ borderColor: color, color }}>
      <span className="vz-category-chip__dot" style={{ backgroundColor: color }} />
      {label}
    </Tag>
  )
}
