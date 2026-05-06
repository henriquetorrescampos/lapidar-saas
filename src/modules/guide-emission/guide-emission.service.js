import { prisma } from "../../lib/prisma.js";
import { validateNumberId } from "../../lib/validators.js";

const GUIDE_SPECIALTIES = [
  "Psicologia",
  "Fonoaudiologia",
  "Terapia Ocupacional",
  "Psicopedagogia",
];

// Pré-computa quantas vezes cada dia da semana (0-6) ocorre no mês — chamado uma vez por request
function buildDayCountMap(month, year) {
  const counts = new Array(7).fill(0);
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    counts[new Date(year, month - 1, d).getDay()]++;
  }
  return counts;
}

function calculateSessions(days, dayCountMap) {
  if (!days) return null;
  const dayList = days.split(",").map(Number).filter((d) => !isNaN(d));
  if (dayList.length === 0) return null;
  const totalOccurrences = dayList.reduce((sum, d) => sum + (dayCountMap[d] ?? 0), 0);
  const multiplier = dayList.length === 1 ? 2 : 1;
  return totalOccurrences * multiplier;
}

export async function getGuideEmissions(month, year) {
  const m = parseInt(month);
  const y = parseInt(year);

  if (!m || !y || m < 1 || m > 12) {
    throw new Error("Mês e ano inválidos");
  }

  const dayCountMap = buildDayCountMap(m, y);

  const patients = await prisma.patient.findMany({
    where: {
      patient_type: { contains: "ABA" },
      health_plan: { not: "PARTICULAR" },
    },
    include: {
      patient_schedules: true,
      guide_emissions: { where: { month: m, year: y } },
    },
    orderBy: { name: "asc" },
  });

  const result = [];

  for (const patient of patients) {
    const patientSpecialties = patient.specialties
      .split(",")
      .map((s) => s.trim())
      .filter((s) => GUIDE_SPECIALTIES.includes(s));

    for (const specialty of patientSpecialties) {
      const schedule = patient.patient_schedules.find(
        (s) => s.specialty === specialty
      );
      const emission = patient.guide_emissions.find(
        (e) => e.specialty === specialty
      );

      const quantity = calculateSessions(schedule?.days, dayCountMap);

      result.push({
        emission_id: emission?.id || null,
        patient_id: patient.id,
        patient_name: patient.name,
        specialty,
        schedule_days: schedule?.days || null,
        quantity,
        emitted: emission?.emitted || false,
        emitted_at: emission?.emitted_at || null,
      });
    }
  }

  return result;
}

export async function toggleGuideEmission(patient_id, specialty, month, year) {
  const patientId = validateNumberId(patient_id);
  const m = parseInt(month);
  const y = parseInt(year);

  if (!specialty || !GUIDE_SPECIALTIES.includes(specialty)) {
    throw new Error("Especialidade inválida");
  }
  if (!m || !y || m < 1 || m > 12) {
    throw new Error("Mês e ano inválidos");
  }

  // Único round-trip: insere como emitida ou inverte o estado se já existir
  const [row] = await prisma.$queryRaw`
    INSERT INTO "GuideEmission" (patient_id, specialty, month, year, emitted, emitted_at)
    VALUES (${patientId}, ${specialty}, ${m}, ${y}, true, NOW())
    ON CONFLICT (patient_id, specialty, month, year)
    DO UPDATE SET
      emitted    = NOT "GuideEmission".emitted,
      emitted_at = CASE WHEN NOT "GuideEmission".emitted THEN NOW() ELSE NULL END
    RETURNING *
  `;

  return row;
}

export async function getPatientSchedules(patient_id) {
  const patientId = validateNumberId(patient_id);
  return await prisma.patientSchedule.findMany({
    where: { patient_id: patientId },
  });
}

export async function upsertPatientSchedules(patient_id, schedules) {
  const patientId = validateNumberId(patient_id);

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
  });
  if (!patient) throw new Error("Paciente não encontrado");

  const results = await Promise.all(
    schedules.map((s) =>
      prisma.patientSchedule.upsert({
        where: {
          patient_id_specialty: {
            patient_id: patientId,
            specialty: s.specialty,
          },
        },
        update: { days: s.days },
        create: { patient_id: patientId, specialty: s.specialty, days: s.days },
      })
    )
  );

  return results;
}
