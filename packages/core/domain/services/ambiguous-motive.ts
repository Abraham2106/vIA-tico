const AMBIGUOUS = [
  'compre unas cosas',
  'compré unas cosas',
  'varias cosas',
  'gastos',
  'varios',
  'cosas',
  'otros',
  'no se',
  'no sé',
  'misc',
]

export function isAmbiguousMotive(motivo: string | undefined): boolean {
  if (motivo === undefined) return false
  const normalized = motivo
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9ñ\s]/g, '')
    .trim()
  if (!normalized) return true
  if (normalized.length < 4) return true
  return AMBIGUOUS.some((phrase) => normalized === phrase || normalized.includes(phrase))
}
