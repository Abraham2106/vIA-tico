import type { AnalysisJob, AuditEvent, PairingPayload, PairedDevice } from '@viaticocero/contracts'
import type { ExceptionCase } from '../../../domain/exception/index.ts'
import type { Policy } from '../../../domain/policy/index.ts'
import type { Receipt } from '../../../domain/receipt/index.ts'
import type { Traveler } from '../../../domain/traveler/index.ts'
import type { Trip } from '../../../domain/trip/index.ts'

export interface ITravelerRepository {
  get(id: string): Promise<Traveler | undefined>
  list(): Promise<Traveler[]>
  save(traveler: Traveler): Promise<void>
}

export interface ITripRepository {
  get(id: string): Promise<Trip | undefined>
  list(): Promise<Trip[]>
  save(trip: Trip): Promise<void>
}

export interface IReceiptRepository {
  get(id: string): Promise<Receipt | undefined>
  listByTrip(tripId: string): Promise<Receipt[]>
  listAll(): Promise<Receipt[]>
  save(receipt: Receipt): Promise<void>
}

export interface IPolicyRepository {
  getActive(): Promise<Policy>
  save(policy: Policy): Promise<void>
}

export interface IExceptionRepository {
  get(id: string): Promise<ExceptionCase | undefined>
  getByReceipt(receiptId: string): Promise<ExceptionCase | undefined>
  listOpen(): Promise<ExceptionCase[]>
  listByTrip(tripId: string): Promise<ExceptionCase[]>
  listAll(): Promise<ExceptionCase[]>
  save(item: ExceptionCase): Promise<void>
}

export interface IJobInbox {
  get(id: string): Promise<AnalysisJob | undefined>
  list(): Promise<AnalysisJob[]>
  save(job: AnalysisJob): Promise<void>
}

export interface IPairingStore {
  getPayload(): Promise<PairingPayload>
  listDevices(): Promise<PairedDevice[]>
  saveDevice(device: PairedDevice): Promise<void>
  rotateCode(payload: PairingPayload): Promise<void>
}

export type AuditListFilter = {
  receiptId?: string
  tripId?: string
}

export interface IAuditLog {
  append(event: AuditEvent): Promise<void>
  list(filter?: AuditListFilter): Promise<AuditEvent[]>
}
