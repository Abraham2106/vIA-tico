import { z } from 'zod'
import { visionResultSchema } from '../vision-result/index.ts'

export const JOB_STATUSES = ['pending', 'ingested', 'failed'] as const
export type AnalysisJobStatus = (typeof JOB_STATUSES)[number]

export const analysisJobSchema = z.object({
  id: z.string().min(1),
  tripId: z.string().min(1).optional(),
  createdAt: z.string().min(1),
  sourceDeviceId: z.string().min(1),
  attachmentPath: z.string().optional(),
  visionResult: visionResultSchema,
  status: z.enum(JOB_STATUSES),
  error: z.string().optional(),
})

export type AnalysisJob = z.infer<typeof analysisJobSchema>

export function parseAnalysisJob(input: unknown): AnalysisJob {
  return analysisJobSchema.parse(input)
}

export function safeParseAnalysisJob(input: unknown) {
  return analysisJobSchema.safeParse(input)
}
