import { z } from 'zod'

export const TRANSPORT_MODES = ['dto', 'qvac-delegate'] as const
export type TransportMode = (typeof TRANSPORT_MODES)[number]

export const pairingPayloadSchema = z.object({
  desktopDeviceId: z.string().min(1),
  desktopName: z.string().min(1),
  pairingCode: z.string().min(4),
  inboxUrl: z.string().optional(),
  transport: z.enum(TRANSPORT_MODES),
  createdAt: z.string().min(1),
  /** Reservado para Hyperswarm / startQVACProvider. Vacío hasta el adaptador QVAC. */
  qvacProviderPublicKey: z.string().optional(),
})

export type PairingPayload = z.infer<typeof pairingPayloadSchema>

export function parsePairingPayload(input: unknown): PairingPayload {
  return pairingPayloadSchema.parse(input)
}

export function safeParsePairingPayload(input: unknown) {
  return pairingPayloadSchema.safeParse(input)
}

export const pairedDeviceSchema = z.object({
  deviceId: z.string().min(1),
  name: z.string().min(1),
  role: z.enum(['mobile', 'desktop']),
  pairedAt: z.string().min(1),
  lastSeenAt: z.string().optional(),
})

export type PairedDevice = z.infer<typeof pairedDeviceSchema>
