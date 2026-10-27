import { prisma } from "../../lib/prisma.js";
import { validateNumberId } from "../../lib/validators.js";

async function ensureTable() {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "particular_payments" (
      id SERIAL PRIMARY KEY,
      patient_id INTEGER NOT NULL UNIQUE REFERENCES "Patient"(id) ON DELETE CASCADE,
      paid BOOLEAN NOT NULL DEFAULT FALSE,
      paid_cycles INTEGER NOT NULL DEFAULT 0,
      paid_at TIMESTAMPTZ,
      cycle INTEGER NOT NULL DEFAULT 1,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  // Migração: adiciona coluna paid_cycles se a tabela já existia sem ela
  await prisma.$executeRaw`
    ALTER TABLE "particular_payments"
    ADD COLUMN IF NOT EXISTS paid_cycles INTEGER NOT NULL DEFAULT 0
  `;
}

export async function getPaymentStatus(patientId) {
  const id = validateNumberId(patientId);
  await ensureTable();

  const rows = await prisma.$queryRaw`
    SELECT id, patient_id, paid, paid_cycles, paid_at, cycle, updated_at
    FROM "particular_payments"
    WHERE patient_id = ${id}
  `;

  if (rows.length === 0) {
    return { patient_id: id, paid: false, paid_cycles: 0, paid_at: null, cycle: 1 };
  }

  const row = rows[0];
  return { ...row, paid: row.paid_cycles > 0 };
}

export async function markAsPaid(patientId, cycles = 1) {
  const id = validateNumberId(patientId);
  const validCycles = Math.max(1, parseInt(cycles) || 1);
  await ensureTable();

  const [row] = await prisma.$queryRaw`
    INSERT INTO "particular_payments" (patient_id, paid, paid_cycles, paid_at, cycle, updated_at)
    VALUES (${id}, TRUE, ${validCycles}, NOW(), 1, NOW())
    ON CONFLICT (patient_id)
    DO UPDATE SET
      paid = TRUE,
      paid_cycles = ${validCycles},
      paid_at = NOW(),
      updated_at = NOW()
    RETURNING *
  `;

  return { ...row, paid: row.paid_cycles > 0 };
}

export async function resetForNewCycle(patientId) {
  const id = validateNumberId(patientId);
  await ensureTable();

  const [row] = await prisma.$queryRaw`
    INSERT INTO "particular_payments" (patient_id, paid, paid_cycles, paid_at, cycle, updated_at)
    VALUES (${id}, FALSE, 0, NULL, 1, NOW())
    ON CONFLICT (patient_id)
    DO UPDATE SET
      paid_cycles = GREATEST("particular_payments".paid_cycles - 1, 0),
      paid = GREATEST("particular_payments".paid_cycles - 1, 0) > 0,
      paid_at = CASE WHEN GREATEST("particular_payments".paid_cycles - 1, 0) > 0 THEN "particular_payments".paid_at ELSE NULL END,
      cycle = "particular_payments".cycle + 1,
      updated_at = NOW()
    RETURNING *
  `;

  return { ...row, paid: row.paid_cycles > 0 };
}
