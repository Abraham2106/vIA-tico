import { z } from 'zod'

export const EXPORT_FORMATS = ['pdf', 'csv', 'xlsx', 'json'] as const
export type ExportFormat = (typeof EXPORT_FORMATS)[number]

export const exportRequestSchema = z.object({
  tripId: z.string().min(1),
  format: z.enum(EXPORT_FORMATS),
  includeRaw: z.boolean().optional(),
})

export type ExportRequest = z.infer<typeof exportRequestSchema>

export type ExportArtifact = {
  format: ExportFormat
  filename: string
  mimeType: string
  body: Uint8Array | string
}
