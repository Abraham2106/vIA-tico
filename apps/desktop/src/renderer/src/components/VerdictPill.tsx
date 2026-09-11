import { Tag } from '@carbon/react'
import { labelForVerdict, type Verdict } from '@viaticocero/core'
import { feedbackForVerdict } from '@viaticocero/ui-tokens'
import { uiVerdictLabel } from '../lib/verdictLabel'

const TYPE: Record<ReturnType<typeof feedbackForVerdict>, 'green' | 'outline' | 'red'> = {
  success: 'green',
  warning: 'outline',
  error: 'red',
  info: 'outline',
}

export function VerdictPill({ verdict }: { verdict: Verdict }) {
  const tone = feedbackForVerdict(verdict)
  return (
    <Tag
      type={TYPE[tone]}
      size="sm"
      title={labelForVerdict(verdict)}
      className={tone === 'warning' ? 'vz-verdict--revision' : undefined}
    >
      {uiVerdictLabel(verdict)}
    </Tag>
  )
}
