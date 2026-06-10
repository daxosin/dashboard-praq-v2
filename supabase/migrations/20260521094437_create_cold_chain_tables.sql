CREATE TABLE cold_chain_monthly_sync (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year_month        TEXT NOT NULL UNIQUE,
  executed_at       TIMESTAMPTZ NOT NULL,
  executed_by       TEXT NOT NULL,
  enceintes_synced  INTEGER NOT NULL,
  alarms_total      INTEGER NOT NULL,
  anomalies_created INTEGER NOT NULL,
  csv_path          TEXT NOT NULL,
  status            TEXT NOT NULL,
  notes             TEXT
);

CREATE TABLE cold_chain_anomalies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enceinte_code   TEXT NOT NULL,
  alarm_type      TEXT NOT NULL,
  detected_at     TIMESTAMPTZ NOT NULL,
  resolved_at     TIMESTAMPTZ,
  duration_min    INTEGER,
  temp_at_start   NUMERIC(4,2),
  temp_max        NUMERIC(4,2),
  status          TEXT NOT NULL DEFAULT 'pending',
  decision        TEXT,
  pharmaco_eval   TEXT,
  acknowledged_by TEXT,
  acknowledged_at TIMESTAMPTZ,
  decided_by      TEXT,
  decided_at      TIMESTAMPTZ,
  notes           TEXT,
  source_sync_id  UUID REFERENCES cold_chain_monthly_sync(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cca_enceinte ON cold_chain_anomalies(enceinte_code);
CREATE INDEX idx_cca_detected ON cold_chain_anomalies(detected_at DESC);
CREATE INDEX idx_cca_status ON cold_chain_anomalies(status);

ALTER TABLE cold_chain_monthly_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE cold_chain_anomalies ENABLE ROW LEVEL SECURITY;
