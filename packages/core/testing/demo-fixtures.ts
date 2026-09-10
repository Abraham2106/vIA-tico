import type { VisionResult } from '@viaticocero/contracts'
import { createTraveler, type Traveler } from '../domain/traveler/index.ts'
import { createTrip, type Trip } from '../domain/trip/index.ts'
import { money } from '../domain/shared/money.ts'
import type { AttachReceiptInput } from '../application/ports/inbound/index.ts'

export const DEMO_TRAVELER: Traveler = createTraveler({
  id: 'traveler-maria',
  name: 'María Soto',
  email: 'maria.soto@example.com',
})

export const DEMO_TRIP: Trip = createTrip({
  id: 'trip-liberia-sep',
  travelerId: DEMO_TRAVELER.id,
  destination: 'Liberia, Guanacaste',
  purpose: 'Visita a cliente regional',
  startDate: '2026-09-10',
  endDate: '2026-09-14',
  advance: money(200_000, 'CRC'),
  createdAt: '2026-09-09T14:00:00.000Z',
})

function receipt(
  proveedor: string,
  fecha: string,
  monto: number,
  categoria: VisionResult['categoria'],
  extras: Partial<VisionResult> = {},
): VisionResult {
  return {
    proveedor,
    fecha,
    monto,
    moneda: 'CRC',
    tipo_documento: 'recibo',
    confianza_lectura: 'alta',
    raw_text: `${proveedor} ${fecha} ${monto} CRC`,
    categoria,
    ...extras,
  }
}

/** Ocho comprobantes del demo: seis PROCEDE, dos REVISIÓN (fecha + duplicado). */
export const DEMO_EXTRACTIONS: VisionResult[] = [
  receipt('Estación Delta La Sabana', '2026-09-10', 25_000, 'combustible'),
  receipt('Hotel El Roble', '2026-09-11', 65_000, 'hospedaje'),
  receipt('Peaje San Ramón', '2026-09-11', 1_200, 'peaje'),
  receipt('Soda La Casita', '2026-09-12', 8_500, 'alimentacion'),
  receipt('Parqueo Mercado', '2026-09-12', 2_000, 'estacionamiento'),
  receipt('Restaurante El Farol', '2026-09-25', 9_200, 'alimentacion'),
  receipt('Soda La Casita', '2026-09-12', 8_500, 'alimentacion'),
  receipt('Estación Uno Liberia', '2026-09-13', 18_000, 'combustible'),
]

export function demoAttachInputs(tripId = DEMO_TRIP.id): AttachReceiptInput[] {
  return DEMO_EXTRACTIONS.map((extraction) => ({ tripId, extraction }))
}
