import { Tag } from '@carbon/react'
import { labelForVerdict, type Verdict } from '@viaticocero/core'

const TYPE: Record<Verdict, 'green' | 'warm-gray' | 'red'> = {
  PROCEDE: 'green',
  REVISION: 'warm-gray',
  NO_PROCEDE: 'red',
}

export function VerdictPill({ verdict }: { verdict: Verdict }) {
  return (
    <Tag type={TYPE[verdict]} size="sm" title={labelForVerdict(verdict)}>
      {labelForVerdict(verdict)}
    </Tag>
  )
}
