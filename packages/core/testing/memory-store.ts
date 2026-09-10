import type { AnalysisJob, PairedDevice, PairingPayload } from '@viaticocero/contracts'
import type { ExceptionCase } from '../domain/exception/index.ts'
import { DEFAULT_POLICY, type Policy } from '../domain/policy/index.ts'
import type { Receipt } from '../domain/receipt/index.ts'
import type { Traveler } from '../domain/traveler/index.ts'
import type { Trip } from '../domain/trip/index.ts'
import type {
  IExceptionRepository,
  IJobInbox,
  IPairingStore,
  IPolicyRepository,
  IReceiptRepository,
  ITravelerRepository,
  ITripRepository,
} from '../application/ports/outbound/stores.ts'

export type MemoryState = {
  travelers: Map<string, Traveler>
  trips: Map<string, Trip>
  receipts: Map<string, Receipt>
  exceptions: Map<string, ExceptionCase>
  jobs: Map<string, AnalysisJob>
  devices: Map<string, PairedDevice>
  policy: Policy
  pairing: PairingPayload
}

export function createEmptyMemoryState(nowIso: string): MemoryState {
  return {
    travelers: new Map(),
    trips: new Map(),
    receipts: new Map(),
    exceptions: new Map(),
    jobs: new Map(),
    devices: new Map(),
    policy: { ...DEFAULT_POLICY },
    pairing: {
      desktopDeviceId: 'desktop-local',
      desktopName: 'ViáticoCero Desktop',
      pairingCode: '210614',
      inboxUrl: 'http://127.0.0.1:47821',
      transport: 'dto',
      createdAt: nowIso,
    },
  }
}

export function createMemoryRepositories(state: MemoryState) {
  const travelers: ITravelerRepository = {
    async get(id) {
      return state.travelers.get(id)
    },
    async list() {
      return [...state.travelers.values()]
    },
    async save(traveler) {
      state.travelers.set(traveler.id, traveler)
    },
  }

  const trips: ITripRepository = {
    async get(id) {
      return state.trips.get(id)
    },
    async list() {
      return [...state.trips.values()]
    },
    async save(trip) {
      state.trips.set(trip.id, trip)
    },
  }

  const receipts: IReceiptRepository = {
    async get(id) {
      return state.receipts.get(id)
    },
    async listByTrip(tripId) {
      return [...state.receipts.values()].filter((item) => item.tripId === tripId)
    },
    async listAll() {
      return [...state.receipts.values()]
    },
    async save(receipt) {
      state.receipts.set(receipt.id, receipt)
    },
  }

  const policy: IPolicyRepository = {
    async getActive() {
      return state.policy
    },
    async save(next) {
      state.policy = next
    },
  }

  const exceptions: IExceptionRepository = {
    async get(id) {
      return state.exceptions.get(id)
    },
    async getByReceipt(receiptId) {
      return [...state.exceptions.values()].find((item) => item.receiptId === receiptId)
    },
    async listOpen() {
      return [...state.exceptions.values()].filter((item) => item.status === 'open')
    },
    async listByTrip(tripId) {
      return [...state.exceptions.values()].filter((item) => item.tripId === tripId)
    },
    async listAll() {
      return [...state.exceptions.values()]
    },
    async save(item) {
      state.exceptions.set(item.id, item)
    },
  }

  const jobs: IJobInbox = {
    async get(id) {
      return state.jobs.get(id)
    },
    async list() {
      return [...state.jobs.values()]
    },
    async save(job) {
      state.jobs.set(job.id, job)
    },
  }

  const pairing: IPairingStore = {
    async getPayload() {
      return state.pairing
    },
    async listDevices() {
      return [...state.devices.values()]
    },
    async saveDevice(device) {
      state.devices.set(device.deviceId, device)
    },
    async rotateCode(payload) {
      state.pairing = payload
    },
  }

  return { travelers, trips, receipts, policy, exceptions, jobs, pairing, state }
}

export type SerializedMemory = {
  travelers: Traveler[]
  trips: Trip[]
  receipts: Receipt[]
  exceptions: ExceptionCase[]
  jobs: AnalysisJob[]
  devices: PairedDevice[]
  policy: Policy
  pairing: PairingPayload
}

export function serializeMemory(state: MemoryState): SerializedMemory {
  return {
    travelers: [...state.travelers.values()],
    trips: [...state.trips.values()],
    receipts: [...state.receipts.values()],
    exceptions: [...state.exceptions.values()],
    jobs: [...state.jobs.values()],
    devices: [...state.devices.values()],
    policy: state.policy,
    pairing: state.pairing,
  }
}

export function hydrateMemory(data: SerializedMemory): MemoryState {
  return {
    travelers: new Map(data.travelers.map((item) => [item.id, item])),
    trips: new Map(data.trips.map((item) => [item.id, item])),
    receipts: new Map(data.receipts.map((item) => [item.id, item])),
    exceptions: new Map(data.exceptions.map((item) => [item.id, item])),
    jobs: new Map(data.jobs.map((item) => [item.id, item])),
    devices: new Map(data.devices.map((item) => [item.deviceId, item])),
    policy: data.policy,
    pairing: data.pairing,
  }
}
