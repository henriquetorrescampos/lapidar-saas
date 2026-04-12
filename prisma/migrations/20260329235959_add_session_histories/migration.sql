CREATE TABLE IF NOT EXISTS "session_histories" (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES "Patient"(id) ON DELETE CASCADE,
  specialty TEXT NOT NULL,
  completed INTEGER NOT NULL,
  total INTEGER NOT NULL,
  session_dates JSONB NOT NULL,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  registered_by_user_id INTEGER REFERENCES "User"(id) ON DELETE SET NULL,
  registered_by_name TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS "session_histories_patient_specialty_registered_idx"
ON "session_histories" (patient_id, specialty, registered_at DESC);