import { ProgressBar } from '@carbon/react'
import type { ConfidenceLevel } from '@viaticocero/contracts'
import { confidenceFill } from '@viaticocero/ui-tokens'

const LABELS: Record<ConfidenceLevel, string> = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
}

export function ConfidenceBar({
  level,
  label = 'Confianza de lectura',
}: {
  level: ConfidenceLevel
  label?: string
}) {
  const status = level === 'baja' ? 'error' : level === 'media' ? 'active' : 'finished'
  return (
    <ProgressBar
      label={label}
      helperText={LABELS[level]}
      value={confidenceFill(level)}
      max={100}
      status={status}
    />
  )
}
