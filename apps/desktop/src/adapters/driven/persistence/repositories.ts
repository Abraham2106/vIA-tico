import type { AnalysisJob, AuditEvent, PairedDevice, PairingPayload } from '@viaticocero/contracts'
import type { MotiveClassification, VisionResult } from '@viaticocero/contracts'
import {
  DEFAULT_POLICY,
  type ExceptionCase,
  type ExceptionResolution,
  type FiredRule,
  type HumanDecision,
  type Policy,
  type Receipt,
  type Traveler,
  type Trip,
  type SerializedMemory,
} from '@viaticocero/core'
import type {
  IAuditLog,
  IExceptionRepository,
  IJobInbox,
  IPairingStore,
  IPolicyRepository,
  IReceiptRepository,
  ITravelerRepository,
  ITripRepository,
} from '@viaticocero/core'
import { readJson, writeJson } from './json.ts'
import { SCHEMA_SQL, SCHEMA_VERSION } from './schema.ts'
import { asSql, type SqliteSession } from './session.ts'

export type SqliteRepositories = {
  travelers: ITravelerRepository
  trips: ITripRepository
  receipts: IReceiptRepository
  policy: IPolicyRepository
  exceptions: IExceptionRepository
  jobs: IJobInbox
  pairing: IPairingStore
  auditLog: IAuditLog
}

type CountRow = { n: number }
type MetaRow = { value_json: string }
type TravelerRow = { id: string; name: string; email: string | null }
type TripRow = {
  id: string
  traveler_id: string
  destination: string
  purpose: string | null
  start_date: string
  end_date: string
  advance_amount: number
  advance_currency: Trip['advance']['currency']
  status: Trip['status']
  created_at: string
}
type ReceiptRow = {
  id: string
  trip_id: string
  captured_at: string
  attachment_path: string | null
  source_job_id: string | null
  extraction_json: string
  linguistic_postprocess_json: string | null
  motive_classification_json: string | null
  used_extraction_json: string
  verdict: Receipt['verdict']
  triggered_rules_json: string
  human_decision_json: string | null
  audit_json: string
}
type ExceptionRow = {
  id: string
  receipt_id: string
  trip_id: string
  verdict: ExceptionCase['verdict']
  rules_json: string
  opened_at: string
  status: ExceptionCase['status']
  resolution_json: string | null
}
type JobRow = { payload_json: string }
type DeviceRow = { payload_json: string }
type AuditRow = {
  id: string
  at: string
  actor: AuditEvent['actor']
  action: string
  detail: string | null
  receipt_id: string | null
  trip_id: string | null
  exception_id: string | null
}

export function defaultPairing(nowIso: string): PairingPayload {
  return {
    desktopDeviceId: 'desktop-local',
    desktopName: 'ViáticoCero Desktop',
    pairingCode: '210614',
    inboxUrl: 'http://127.0.0.1:47821',
    transport: 'dto',
    createdAt: nowIso,
  }
}

export function applySchema(session: SqliteSession, nowIso: string): void {
  session.exec(SCHEMA_SQL)
  const version = session.get<MetaRow>('SELECT value_json FROM meta WHERE key = ?', ['schema_version'])
  if (!version) {
    session.run('INSERT INTO meta (key, value_json) VALUES (?, ?)', ['schema_version', writeJson(SCHEMA_VERSION)])
    session.run('INSERT INTO meta (key, value_json) VALUES (?, ?)', ['policy', writeJson(DEFAULT_POLICY)])
    session.run('INSERT INTO meta (key, value_json) VALUES (?, ?)', ['pairing', writeJson(defaultPairing(nowIso))])
    return
  }
  const stored = Number(JSON.parse(version.value_json))
  if (stored < SCHEMA_VERSION) {
    backfillAuditEvents(session)
    session.run(
      `INSERT INTO meta (key, value_json) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json`,
      ['schema_version', writeJson(SCHEMA_VERSION)],
    )
  }
}

function backfillAuditEvents(session: SqliteSession): void {
  const existing = session.get<CountRow>('SELECT COUNT(*) AS n FROM audit_events')
  if (Number(existing?.n ?? 0) > 0) return
  const receipts = session.all<ReceiptRow>('SELECT * FROM receipts')
  let n = 0
  for (const row of receipts) {
    const entries = JSON.parse(row.audit_json) as Receipt['audit']
    for (const entry of entries) {
      n += 1
      session.run(
        `INSERT INTO audit_events (id, at, actor, action, detail, receipt_id, trip_id, exception_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `backfill-${row.id}-${n}`,
          entry.at,
          entry.actor,
          entry.action,
          asSql(entry.detail),
          row.id,
          row.trip_id,
          null,
        ],
      )
    }
  }
}

export function tripCount(session: SqliteSession): number {
  const row = session.get<CountRow>('SELECT COUNT(*) AS n FROM trips')
  return Number(row?.n ?? 0)
}

function travelerFromRow(row: TravelerRow): Traveler {
  return { id: row.id, name: row.name, email: row.email ?? undefined }
}

function tripFromRow(row: TripRow): Trip {
  return {
    id: row.id,
    travelerId: row.traveler_id,
    destination: row.destination,
    purpose: row.purpose ?? undefined,
    startDate: row.start_date,
    endDate: row.end_date,
    advance: { amount: row.advance_amount, currency: row.advance_currency },
    status: row.status,
    createdAt: row.created_at,
  }
}

function receiptFromRow(row: ReceiptRow): Receipt {
  return {
    id: row.id,
    tripId: row.trip_id,
    capturedAt: row.captured_at,
    attachmentPath: row.attachment_path ?? undefined,
    sourceJobId: row.source_job_id ?? undefined,
    extraction: JSON.parse(row.extraction_json) as VisionResult,
    linguisticPostprocess: readJson<VisionResult>(row.linguistic_postprocess_json),
    motiveClassification: readJson<MotiveClassification>(row.motive_classification_json),
    usedExtraction: JSON.parse(row.used_extraction_json) as VisionResult,
    verdict: row.verdict,
    triggeredRules: JSON.parse(row.triggered_rules_json) as FiredRule[],
    humanDecision: readJson<HumanDecision>(row.human_decision_json),
    audit: JSON.parse(row.audit_json) as Receipt['audit'],
  }
}

function exceptionFromRow(row: ExceptionRow): ExceptionCase {
  return {
    id: row.id,
    receiptId: row.receipt_id,
    tripId: row.trip_id,
    verdict: row.verdict,
    rules: JSON.parse(row.rules_json) as FiredRule[],
    openedAt: row.opened_at,
    status: row.status,
    resolution: readJson<ExceptionResolution>(row.resolution_json),
  }
}

export function createSqliteRepositories(session: SqliteSession): SqliteRepositories {
  const travelers: ITravelerRepository = {
    async get(id) {
      const row = session.get<TravelerRow>('SELECT id, name, email FROM travelers WHERE id = ?', [id])
      return row ? travelerFromRow(row) : undefined
    },
    async list() {
      return session.all<TravelerRow>('SELECT id, name, email FROM travelers ORDER BY name').map(travelerFromRow)
    },
    async save(traveler) {
      session.run(
        `INSERT INTO travelers (id, name, email) VALUES (?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET name = excluded.name, email = excluded.email`,
        [traveler.id, traveler.name, asSql(traveler.email)],
      )
      await session.persist()
    },
  }

  const trips: ITripRepository = {
    async get(id) {
      const row = session.get<TripRow>('SELECT * FROM trips WHERE id = ?', [id])
      return row ? tripFromRow(row) : undefined
    },
    async list() {
      return session.all<TripRow>('SELECT * FROM trips ORDER BY created_at DESC').map(tripFromRow)
    },
    async save(trip) {
      session.run(
        `INSERT INTO trips (
          id, traveler_id, destination, purpose, start_date, end_date,
          advance_amount, advance_currency, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          traveler_id = excluded.traveler_id,
          destination = excluded.destination,
          purpose = excluded.purpose,
          start_date = excluded.start_date,
          end_date = excluded.end_date,
          advance_amount = excluded.advance_amount,
          advance_currency = excluded.advance_currency,
          status = excluded.status,
          created_at = excluded.created_at`,
        [
          trip.id,
          trip.travelerId,
          trip.destination,
          asSql(trip.purpose),
          trip.startDate,
          trip.endDate,
          trip.advance.amount,
          trip.advance.currency,
          trip.status,
          trip.createdAt,
        ],
      )
      await session.persist()
    },
  }

  const receipts: IReceiptRepository = {
    async get(id) {
      const row = session.get<ReceiptRow>('SELECT * FROM receipts WHERE id = ?', [id])
      return row ? receiptFromRow(row) : undefined
    },
    async listByTrip(tripId) {
      return session
        .all<ReceiptRow>('SELECT * FROM receipts WHERE trip_id = ? ORDER BY captured_at', [tripId])
        .map(receiptFromRow)
    },
    async listAll() {
      return session.all<ReceiptRow>('SELECT * FROM receipts ORDER BY captured_at').map(receiptFromRow)
    },
    async save(receipt) {
      session.run(
        `INSERT INTO receipts (
          id, trip_id, captured_at, attachment_path, source_job_id,
          extraction_json, linguistic_postprocess_json, motive_classification_json,
          used_extraction_json, verdict, triggered_rules_json, human_decision_json, audit_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          trip_id = excluded.trip_id,
          captured_at = excluded.captured_at,
          attachment_path = excluded.attachment_path,
          source_job_id = excluded.source_job_id,
          extraction_json = excluded.extraction_json,
          linguistic_postprocess_json = excluded.linguistic_postprocess_json,
          motive_classification_json = excluded.motive_classification_json,
          used_extraction_json = excluded.used_extraction_json,
          verdict = excluded.verdict,
          triggered_rules_json = excluded.triggered_rules_json,
          human_decision_json = excluded.human_decision_json,
          audit_json = excluded.audit_json`,
        [
          receipt.id,
          receipt.tripId,
          receipt.capturedAt,
          asSql(receipt.attachmentPath),
          asSql(receipt.sourceJobId),
          writeJson(receipt.extraction),
          receipt.linguisticPostprocess ? writeJson(receipt.linguisticPostprocess) : null,
          receipt.motiveClassification ? writeJson(receipt.motiveClassification) : null,
          writeJson(receipt.usedExtraction),
          receipt.verdict,
          writeJson(receipt.triggeredRules),
          receipt.humanDecision ? writeJson(receipt.humanDecision) : null,
          writeJson(receipt.audit),
        ],
      )
      await session.persist()
    },
  }

  const policy: IPolicyRepository = {
    async getActive() {
      const row = session.get<MetaRow>('SELECT value_json FROM meta WHERE key = ?', ['policy'])
      return row ? (JSON.parse(row.value_json) as Policy) : DEFAULT_POLICY
    },
    async save(next) {
      session.run(
        `INSERT INTO meta (key, value_json) VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json`,
        ['policy', writeJson(next)],
      )
      await session.persist()
    },
  }

  const exceptions: IExceptionRepository = {
    async get(id) {
      const row = session.get<ExceptionRow>('SELECT * FROM exceptions WHERE id = ?', [id])
      return row ? exceptionFromRow(row) : undefined
    },
    async getByReceipt(receiptId) {
      const row = session.get<ExceptionRow>('SELECT * FROM exceptions WHERE receipt_id = ?', [receiptId])
      return row ? exceptionFromRow(row) : undefined
    },
    async listOpen() {
      return session
        .all<ExceptionRow>(`SELECT * FROM exceptions WHERE status = 'open' ORDER BY opened_at`)
        .map(exceptionFromRow)
    },
    async listByTrip(tripId) {
      return session
        .all<ExceptionRow>('SELECT * FROM exceptions WHERE trip_id = ? ORDER BY opened_at', [tripId])
        .map(exceptionFromRow)
    },
    async listAll() {
      return session.all<ExceptionRow>('SELECT * FROM exceptions ORDER BY opened_at').map(exceptionFromRow)
    },
    async save(item) {
      session.run(
        `INSERT INTO exceptions (
          id, receipt_id, trip_id, verdict, rules_json, opened_at, status, resolution_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          receipt_id = excluded.receipt_id,
          trip_id = excluded.trip_id,
          verdict = excluded.verdict,
          rules_json = excluded.rules_json,
          opened_at = excluded.opened_at,
          status = excluded.status,
          resolution_json = excluded.resolution_json`,
        [
          item.id,
          item.receiptId,
          item.tripId,
          item.verdict,
          writeJson(item.rules),
          item.openedAt,
          item.status,
          item.resolution ? writeJson(item.resolution) : null,
        ],
      )
      await session.persist()
    },
  }

  const jobs: IJobInbox = {
    async get(id) {
      const row = session.get<JobRow>('SELECT payload_json FROM jobs WHERE id = ?', [id])
      return row ? (JSON.parse(row.payload_json) as AnalysisJob) : undefined
    },
    async list() {
      return session
        .all<JobRow>('SELECT payload_json FROM jobs ORDER BY created_at')
        .map((row) => JSON.parse(row.payload_json) as AnalysisJob)
    },
    async save(job) {
      session.run(
        `INSERT INTO jobs (id, trip_id, created_at, status, payload_json) VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           trip_id = excluded.trip_id,
           created_at = excluded.created_at,
           status = excluded.status,
           payload_json = excluded.payload_json`,
        [job.id, asSql(job.tripId), job.createdAt, job.status, writeJson(job)],
      )
      await session.persist()
    },
  }

  const pairing: IPairingStore = {
    async getPayload() {
      const row = session.get<MetaRow>('SELECT value_json FROM meta WHERE key = ?', ['pairing'])
      return row ? (JSON.parse(row.value_json) as PairingPayload) : defaultPairing(new Date().toISOString())
    },
    async listDevices() {
      return session.all<DeviceRow>('SELECT payload_json FROM devices').map((row) => JSON.parse(row.payload_json) as PairedDevice)
    },
    async saveDevice(device) {
      session.run(
        `INSERT INTO devices (device_id, payload_json) VALUES (?, ?)
         ON CONFLICT(device_id) DO UPDATE SET payload_json = excluded.payload_json`,
        [device.deviceId, writeJson(device)],
      )
      await session.persist()
    },
    async rotateCode(payload) {
      session.run(
        `INSERT INTO meta (key, value_json) VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json`,
        ['pairing', writeJson(payload)],
      )
      await session.persist()
    },
  }

  const auditLog: IAuditLog = {
    async append(event) {
      session.run(
        `INSERT INTO audit_events (id, at, actor, action, detail, receipt_id, trip_id, exception_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           at = excluded.at,
           actor = excluded.actor,
           action = excluded.action,
           detail = excluded.detail,
           receipt_id = excluded.receipt_id,
           trip_id = excluded.trip_id,
           exception_id = excluded.exception_id`,
        [
          event.id,
          event.at,
          event.actor,
          event.action,
          asSql(event.detail),
          asSql(event.receiptId),
          asSql(event.tripId),
          asSql(event.exceptionId),
        ],
      )
      await session.persist()
    },
    async list(filter) {
      const rows = filter?.receiptId
        ? session.all<AuditRow>('SELECT * FROM audit_events WHERE receipt_id = ? ORDER BY at', [filter.receiptId])
        : filter?.tripId
          ? session.all<AuditRow>('SELECT * FROM audit_events WHERE trip_id = ? ORDER BY at', [filter.tripId])
          : session.all<AuditRow>('SELECT * FROM audit_events ORDER BY at')
      return rows.map((row) => ({
        id: row.id,
        at: row.at,
        actor: row.actor,
        action: row.action,
        detail: row.detail ?? undefined,
        receiptId: row.receipt_id ?? undefined,
        tripId: row.trip_id ?? undefined,
        exceptionId: row.exception_id ?? undefined,
      }))
    },
  }

  return { travelers, trips, receipts, policy, exceptions, jobs, pairing, auditLog }
}

export async function importSerialized(repos: SqliteRepositories, data: SerializedMemory): Promise<void> {
  for (const traveler of data.travelers) await repos.travelers.save(traveler)
  for (const trip of data.trips) await repos.trips.save(trip)
  for (const receipt of data.receipts) await repos.receipts.save(receipt)
  for (const item of data.exceptions) await repos.exceptions.save(item)
  for (const job of data.jobs) await repos.jobs.save(job)
  for (const device of data.devices) await repos.pairing.saveDevice(device)
  await repos.policy.save(data.policy)
  await repos.pairing.rotateCode(data.pairing)
  for (const event of data.auditEvents ?? []) await repos.auditLog.append(event)
}
