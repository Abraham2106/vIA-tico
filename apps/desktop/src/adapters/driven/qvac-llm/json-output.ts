import { QvacLlmError } from './errors.ts'

export function parseModelJson(raw: string): unknown {
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    throw new QvacLlmError('INVALID_OUTPUT', 'El modelo devolvió texto vacío.')
  }
  let text = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced?.[1]) text = fenced[1].trim()
  const attempts = [text]
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start >= 0 && end > start) attempts.push(text.slice(start, end + 1))
  for (const attempt of attempts) {
    try {
      return JSON.parse(attempt) as unknown
    } catch {
      /* next */
    }
  }
  throw new QvacLlmError('INVALID_OUTPUT', 'El modelo no devolvió JSON válido.')
}
