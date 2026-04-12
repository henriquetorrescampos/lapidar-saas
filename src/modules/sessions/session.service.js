import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import {
  validateNumberId,
  validateDate,
  validateRequired,
} from "../../lib/validators.js";
import {
  MAX_SESSIONS_PER_SPECIALTY,
  SESSION_STATUS,
  getMaxSessionsForPatientType,
} from "../../lib/constants.js";

async function ensureSessionHistoryTable(db = prisma) {
  await db.$executeRaw`
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
    )
  `;

  await db.$executeRaw`
    CREATE INDEX IF NOT EXISTS "session_histories_patient_specialty_registered_idx"
    ON "session_histories" (patient_id, specialty, registered_at DESC)
  `;
}

export async function getSessionHistoryByPatient(patientId) {
  const validatedPatientId = validateNumberId(patientId);

  await ensureSessionHistoryTable();

  return prisma.$queryRaw`
    SELECT
      id,
      patient_id,
      specialty,
      completed,
      total,
      session_dates,
      registered_at,
      registered_by_user_id,
      registered_by_name
    FROM "session_histories"
    WHERE patient_id = ${validatedPatientId}
    ORDER BY specialty ASC, registered_at DESC
  `;
}

export async function createManySessions(data) {
  const { patient_id, specialty, sessions } = data;

  validateRequired(patient_id, "Patient ID");
  validateRequired(specialty, "Specialty");
  validateRequired(sessions, "Sessions");

  const patientId = validateNumberId(patient_id);

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
  });

  if (!patient) {
    throw new Error("Patient not found");
  }

  const maxSessions = getMaxSessionsForPatientType(patient.patient_type);

  const existingSessions = await prisma.session.count({
    where: {
      patient_id: patientId,
      specialty,
    },
  });

  if (existingSessions + sessions.length > maxSessions) {
    throw new Error(`Maximum ${maxSessions} sessions per specialty reached`);
  }

  return prisma.session.createMany({
    data: sessions.map((session) => ({
      patient_id: patientId,
      specialty,
      date: validateDate(session.date),
      status: SESSION_STATUS.SCHEDULED,
    })),
  });
}

export async function createSingleSession(data) {
  const { patient_id, specialty, date } = data;

  validateRequired(patient_id, "Patient ID");
  validateRequired(specialty, "Specialty");
  validateRequired(date, "Date");

  const patientId = validateNumberId(patient_id);

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
  });

  if (!patient) {
    throw new Error("Patient not found");
  }

  const maxSessions = getMaxSessionsForPatientType(patient.patient_type);

  const existingSessions = await prisma.session.count({
    where: {
      patient_id: patientId,
      specialty,
    },
  });

  if (existingSessions >= maxSessions) {
    throw new Error(`Maximum ${maxSessions} sessions per specialty reached`);
  }

  return prisma.session.create({
    data: {
      patient_id: patientId,
      specialty,
      date: validateDate(date),
      status: SESSION_STATUS.SCHEDULED,
    },
  });
}

export async function archiveSessionsToHistory(data, currentUser) {
  const { patient_id, specialty, session_ids, dates, total } = data;

  validateRequired(patient_id, "Patient ID");
  validateRequired(specialty, "Specialty");
  validateRequired(session_ids, "Session IDs");
  validateRequired(dates, "Dates");
  validateRequired(total, "Total");

  if (!Array.isArray(session_ids) || session_ids.length === 0) {
    throw new Error("Session IDs are required");
  }

  if (!Array.isArray(dates) || dates.length !== session_ids.length) {
    throw new Error("Dates must match the selected sessions");
  }

  const patientId = validateNumberId(patient_id);
  const validatedTotal = Number(total);

  if (Number.isNaN(validatedTotal) || validatedTotal <= 0) {
    throw new Error("Invalid total sessions value");
  }

  const normalizedSessionIds = session_ids.map((sessionId) =>
    validateNumberId(sessionId),
  );
  const normalizedDates = dates.map((date) => validateDate(date));

  return prisma.$transaction(async (tx) => {
    await ensureSessionHistoryTable(tx);

    const patient = await tx.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new Error("Patient not found");
    }

    const existingSessions = await tx.$queryRaw(
      Prisma.sql`
        SELECT id
        FROM "Session"
        WHERE id IN (${Prisma.join(normalizedSessionIds)})
          AND patient_id = ${patientId}
          AND specialty = ${specialty}
      `,
    );

    if (existingSessions.length !== normalizedSessionIds.length) {
      throw new Error("Some selected sessions were not found");
    }

    const insertedHistory = await tx.$queryRaw`
      INSERT INTO "session_histories" (
        patient_id,
        specialty,
        completed,
        total,
        session_dates,
        registered_by_user_id,
        registered_by_name
      )
      VALUES (
        ${patientId},
        ${specialty},
        ${normalizedSessionIds.length},
        ${validatedTotal},
        CAST(${JSON.stringify(normalizedDates)} AS JSONB),
        ${currentUser?.id || null},
        ${currentUser?.name || currentUser?.email || "Usuário"}
      )
      RETURNING
        id,
        patient_id,
        specialty,
        completed,
        total,
        session_dates,
        registered_at,
        registered_by_user_id,
        registered_by_name
    `;

    await tx.session.deleteMany({
      where: {
        id: { in: normalizedSessionIds },
      },
    });

    return insertedHistory[0];
  });
}

export async function deleteSessionHistory(historyId) {
  const validatedHistoryId = validateNumberId(historyId);

  await ensureSessionHistoryTable();

  const existingHistory = await prisma.$queryRaw`
    SELECT id
    FROM "session_histories"
    WHERE id = ${validatedHistoryId}
  `;

  if (existingHistory.length === 0) {
    throw new Error("Session history not found");
  }

  await prisma.$executeRaw`
    DELETE FROM "session_histories"
    WHERE id = ${validatedHistoryId}
  `;
}
