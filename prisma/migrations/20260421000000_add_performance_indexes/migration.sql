-- Add indexes for frequently queried columns

-- Session: patient_id + specialty composite index (used by getByPatientAndSpecialty)
CREATE INDEX IF NOT EXISTS "Session_patient_id_specialty_idx" ON "Session" (patient_id, specialty);

-- Revenue: date index (used by date range filters in dashboard)
CREATE INDEX IF NOT EXISTS "Revenue_date_idx" ON "Revenue" (date);

-- Revenue: health_plan_id index (used by groupBy health plan)
CREATE INDEX IF NOT EXISTS "Revenue_health_plan_id_idx" ON "Revenue" (health_plan_id);

-- Expense: date index (used by date range filters in dashboard)
CREATE INDEX IF NOT EXISTS "Expense_date_idx" ON "Expense" (date);

-- Expense: category index (used by groupBy category)
CREATE INDEX IF NOT EXISTS "Expense_category_idx" ON "Expense" (category);
