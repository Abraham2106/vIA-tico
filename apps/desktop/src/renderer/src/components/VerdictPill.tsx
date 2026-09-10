import { labelForVerdict, type Verdict } from '@viaticocero/core'

export function VerdictPill({ verdict }: { verdict: Verdict }) {
  const cls = verdict === 'PROCEDE' ? 'ok' : verdict === 'REVISION' ? 'warn' : 'danger'
  const mark = verdict === 'PROCEDE' ? '✓' : verdict === 'REVISION' ? '⚠' : '✕'
  return (
    <span className={`pill ${cls}`}>
      {mark} {labelForVerdict(verdict)}
    </span>
  )
}
