export const VERDICTS = ['PROCEDE', 'REVISION', 'NO_PROCEDE'] as const
export type Verdict = (typeof VERDICTS)[number]

export function isBlockingVerdict(verdict: Verdict): boolean {
  return verdict === 'REVISION' || verdict === 'NO_PROCEDE'
}

export function labelForVerdict(verdict: Verdict): string {
  switch (verdict) {
    case 'PROCEDE':
      return 'PROCEDE'
    case 'REVISION':
      return 'REVISIÓN'
    case 'NO_PROCEDE':
      return 'NO PROCEDE'
  }
}
