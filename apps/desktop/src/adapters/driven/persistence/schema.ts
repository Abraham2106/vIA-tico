export const SCHEMA_VERSION = 2

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS travelers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT
);

CREATE TABLE IF NOT EXISTS trips (
  id TEXT PRIMARY KEY,
  traveler_id TEXT NOT NULL,
  destination TEXT NOT NULL,
  purpose TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  advance_amount REAL NOT NULL,
  advance_currency TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (traveler_id) REFERENCES travelers(id)
);

CREATE TABLE IF NOT EXISTS receipts (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL,
  captured_at TEXT NOT NULL,
  attachment_path TEXT,
  source_job_id TEXT,
  extraction_json TEXT NOT NULL,
  linguistic_postprocess_json TEXT,
  motive_classification_json TEXT,
  used_extraction_json TEXT NOT NULL,
  verdict TEXT NOT NULL,
  triggered_rules_json TEXT NOT NULL,
  human_decision_json TEXT,
  audit_json TEXT NOT NULL,
  FOREIGN KEY (trip_id) REFERENCES trips(id)
);

CREATE TABLE IF NOT EXISTS exceptions (
  id TEXT PRIMARY KEY,
  receipt_id TEXT NOT NULL,
  trip_id TEXT NOT NULL,
  verdict TEXT NOT NULL,
  rules_json TEXT NOT NULL,
  opened_at TEXT NOT NULL,
  status TEXT NOT NULL,
  resolution_json TEXT,
  FOREIGN KEY (receipt_id) REFERENCES receipts(id),
  FOREIGN KEY (trip_id) REFERENCES trips(id)
);

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  trip_id TEXT,
  created_at TEXT NOT NULL,
  status TEXT NOT NULL,
  payload_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS devices (
  device_id TEXT PRIMARY KEY,
  payload_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  at TEXT NOT NULL,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  detail TEXT,
  receipt_id TEXT,
  trip_id TEXT,
  exception_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_trips_traveler ON trips(traveler_id);
CREATE INDEX IF NOT EXISTS idx_receipts_trip ON receipts(trip_id);
CREATE INDEX IF NOT EXISTS idx_exceptions_trip ON exceptions(trip_id);
CREATE INDEX IF NOT EXISTS idx_exceptions_receipt ON exceptions(receipt_id);
CREATE INDEX IF NOT EXISTS idx_exceptions_status ON exceptions(status);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_audit_receipt ON audit_events(receipt_id);
CREATE INDEX IF NOT EXISTS idx_audit_trip ON audit_events(trip_id);
CREATE INDEX IF NOT EXISTS idx_audit_at ON audit_events(at);
`
