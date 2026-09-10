export type AuditActor = 'system' | 'human' | 'vision' | 'llm'

export type AuditEntry = {
  at: string
  actor: AuditActor
  action: string
  detail?: string
}

export function audit(at: string, actor: AuditActor, action: string, detail?: string): AuditEntry {
  return { at, actor, action, detail }
}
