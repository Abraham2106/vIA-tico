import { z } from 'zod'

export const AUDIT_ACTORS = ['system', 'human', 'vision', 'llm'] as const
export type AuditActor = (typeof AUDIT_ACTORS)[number]

export const auditEventSchema = z.object({
  id: z.string().min(1),
  at: z.string().min(1),
  actor: z.enum(AUDIT_ACTORS),
  action: z.string().min(1),
  detail: z.string().optional(),
  receiptId: z.string().min(1).optional(),
  tripId: z.string().min(1).optional(),
  exceptionId: z.string().min(1).optional(),
})

export type AuditEvent = z.infer<typeof auditEventSchema>

export function parseAuditEvent(input: unknown): AuditEvent {
  return auditEventSchema.parse(input)
}

export function safeParseAuditEvent(input: unknown) {
  return auditEventSchema.safeParse(input)
}
