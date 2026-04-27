import { prisma } from "../../lib/prisma.js";
import {
  validateRequired,
  validateDate,
  validateNumberId,
} from "../../lib/validators.js";

const PATIENT_TYPES = ["ABA", "TERAPIA_ADULTO", "AVALIACAO_NEUROPSICOLOGICA"];

function validatePatientType(patientType) {
  const types = patientType.split(",");
  for (const t of types) {
    if (!PATIENT_TYPES.includes(t)) {
      throw new Error(`Invalid patient type: ${t}`);
    }
  }
  if (types.includes("ABA") && types.includes("TERAPIA_ADULTO")) {
    throw new Error("ABA and TERAPIA_ADULTO cannot be selected together");
  }
}

// CREATE
export async function createPatient(data) {
  validateRequired(data.name, "Name");
  validateRequired(data.patient_type, "Patient type");
  validateRequired(data.health_plan, "Health plan");
  validateRequired(data.birth_date, "Birth date");

  validatePatientType(data.patient_type);
  const birthDate = validateDate(data.birth_date);

  const patient = await prisma.patient.create({
    data: {
      name: data.name.trim(),
      patient_type: data.patient_type,
      specialties: data.specialties || "",
      health_plan: data.health_plan.trim(),
      birth_date: birthDate,
    },
  });

  // Auto-create NeuroSchedule if patient has AVALIACAO_NEUROPSICOLOGICA
  if (data.patient_type.includes("AVALIACAO_NEUROPSICOLOGICA")) {
    const now = new Date();
    const deadline = new Date(now.getFullYear(), now.getMonth() + 2, 0); // último dia do mês seguinte
    await prisma.neuroSchedule.create({
      data: {
        patient_id: patient.id,
        date: now,
        deadline: deadline,
        status: "pendente",
      },
    });
  }

  return patient;
}

// READ ALL
export async function getPatients() {
  return await prisma.patient.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

// READ BY ID
export async function getPatientById(id) {
  const patientId = validateNumberId(id);

  const patient = await prisma.patient.findUnique({
    where: {
      id: patientId,
    },
    include: {
      sessions: true,
    },
  });

  return patient;
}

// UPDATE
export async function updatePatient(id, data) {
  const patientId = validateNumberId(id);

  if (data.patient_type) {
    validatePatientType(data.patient_type);
  }

  return await prisma.patient.update({
    where: {
      id: patientId,
    },
    data: {
      ...(data.name && { name: data.name.trim() }),
      ...(data.patient_type && { patient_type: data.patient_type }),
      ...(data.specialties !== undefined && { specialties: data.specialties }),
      ...(data.health_plan && { health_plan: data.health_plan.trim() }),
      ...(data.birth_date && { birth_date: validateDate(data.birth_date) }),
    },
  });
}

// DELETE
export async function deletePatient(id) {
  const patientId = validateNumberId(id);

  // 1. Tenta buscar primeiro
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
  });

  // 2. Se não existir, lança um erro específico
  if (!patient) {
    throw new Error("PNT_NOT_FOUND");
  }

  // 3. Se existir, deleta sessões relacionadas e depois o paciente
  return await prisma.$transaction(async (tx) => {
    await tx.session.deleteMany({
      where: { patient_id: patientId },
    });

    return await tx.patient.delete({
      where: { id: patientId },
    });
  });
}
