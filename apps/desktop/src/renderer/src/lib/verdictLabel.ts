import { type Verdict } from '@viaticocero/core'

/** Etiqueta de UI. El dominio sigue siendo PROCEDE / REVISIÓN / NO PROCEDE. */
export function uiVerdictLabel(verdict: Verdict): string {
  switch (verdict) {
    case 'PROCEDE':
      return 'Aprobado'
    case 'REVISION':
      return 'Por revisar'
    case 'NO_PROCEDE':
      return 'No procede'
  }
}
