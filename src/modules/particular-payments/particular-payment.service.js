import { prisma } from "../../lib/prisma.js";
import { validateNumberId } from "../../lib/validators.js";

async function ensureTable() {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "particular_payments" (
      id SERIAL PRIMARY KEY,
      patient_id INTEGER NOT NULL UNIQUE REFERENCES "Patient"(id) ON DELETE CASCADE,
      paid BOOLEAN NOT NULL DEFAULT FALSE,
      paid_at TIMESTAMPTZ,
      cycle INTEGER NOT NULL DEFAULT 1,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function getPaymentStatus(patientId) {
  const id = validateNumberId(patientId);
  await ensureTable();

  const rows = await prisma.$queryRaw`
    SELECT id, patient_id, paid, paid_at, cycle, updated_at
    FROM "particular_payments"
    WHERE patient_id = ${id}
  `;

  if (rows.length === 0) {
    return { patient_id: id, paid: false, paid_at: null, cycle: 1 };
  }

  return rows[0];
}

export async function markAsPaid(patientId) {
  const id = validateNumberId(patientId);
  await ensureTable();

  const [row] = await prisma.$queryRaw`
    INSERT INTO "particular_payments" (patient_id, paid, paid_at, cycle, updated_at)
    VALUES (${id}, TRUE, NOW(), 1, NOW())
    ON CONFLICT (patient_id)
    DO UPDATE SET
      paid = TRUE,
      paid_at = NOW(),
      updated_at = NOW()
    RETURNING *
  `;

  return row;
}

export async function resetForNewCycle(patientId) {
  const id = validateNumberId(patientId);
  await ensureTable();

  const [row] = await prisma.$queryRaw`
    INSERT INTO "particular_payments" (patient_id, paid, paid_at, cycle, updated_at)
    VALUES (${id}, FALSE, NULL, 1, NOW())
    ON CONFLICT (patient_id)
    DO UPDATE SET
      paid = FALSE,
      paid_at = NULL,
      cycle = "particular_payments".cycle + 1,
      updated_at = NOW()
    RETURNING *
  `;

  return row;
}
