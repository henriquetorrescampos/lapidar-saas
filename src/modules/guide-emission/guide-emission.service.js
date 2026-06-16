import { prisma } from "../../lib/prisma.js";
import { validateNumberId } from "../../lib/validators.js";
import Holidays from "date-holidays";

const GUIDE_SPECIALTIES = [
  "Psicologia",
  "Fonoaudiologia",
  "Terapia Ocupacional",
  "Psicopedagogia",
  "Psicomotricidade",
  "Fisioterapia",
];

const hd = new Holidays("BR");

// Retorna Set com os dias-do-mês que são feriados nacionais (inclui Carnaval)
function getNationalHolidayDays(month, year) {
  const holidayDays = new Set();
  for (const h of hd.getHolidays(year)) {
    if (h.type !== "public" && h.type !== "optional") continue;
    // Parseia a string da data sem usar Date() para evitar problemas de fuso
    const [dateStr] = h.date.split(" ");
    const [, hMonth, hDay] = dateStr.split("-").map(Number);
    if (hMonth === month) holidayDays.add(hDay);
  }
  return holidayDays;
}

// Pré-computa quantas vezes cada dia da semana (0-6) ocorre no mês, descontando feriados
function buildDayCountMap(month, year, holidayDays) {
  const counts = new Array(7).fill(0);
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    if (!holidayDays.has(d)) {
      counts[new Date(year, month - 1, d).getDay()]++;
    }
  }
  return counts;
}

// IAMESC: cada ocorrência do dia = 1 sessão, sem multiplicador
function calculateSessionsIamesc(days, dayCountMap) {
  if (!days) return null;
  const entries = days.split(",").filter(Boolean);
  if (entries.length === 0) return null;

  if (days.includes(":")) {
    const parsed = entries
      .map((entry) => {
        const [d, q] = entry.split(":").map(Number);
        return { day: d, qty: isNaN(q) || q <= 0 ? 1 : q };
      })
      .filter(({ day }) => !isNaN(day) && day > 0);

    if (parsed.length === 0) return null;

    return parsed.reduce(
      (sum, { day, qty }) => sum + (dayCountMap[day] ?? 0) * qty,
      0,
    );
  }

  const dayList = entries.map(Number).filter((d) => !isNaN(d));
  return dayList.reduce((sum, d) => sum + (dayCountMap[d] ?? 0), 0);
}

function calculateSessions(days, dayCountMap) {
  if (!days) return null;
  const entries = days.split(",").filter(Boolean);
  if (entries.length === 0) return null;

  // Formato novo: "3:1,4:2" (dia:sessões_por_ocorrência)
  if (days.includes(":")) {
    const parsed = entries
      .map((entry) => {
        const [d, q] = entry.split(":").map(Number);
        return { day: d, qty: isNaN(q) || q <= 0 ? 1 : q };
      })
      .filter(({ day }) => !isNaN(day) && day > 0);

    if (parsed.length === 0) return null;

    // Regra: total semanal = 1 → multiplica por 2; 2+ → razão 1:1
    const totalPerWeek = parsed.reduce((sum, { qty }) => sum + qty, 0);
    const rawOccurrences = parsed.reduce(
      (sum, { day, qty }) => sum + (dayCountMap[day] ?? 0) * qty,
      0,
    );
    return rawOccurrences * (totalPerWeek === 1 ? 2 : 1);
  }

  // Formato legado: "3,4" — mantém comportamento anterior
  const dayList = entries.map(Number).filter((d) => !isNaN(d));
  const totalOccurrences = dayList.reduce((sum, d) => sum + (dayCountMap[d] ?? 0), 0);
  return totalOccurrences * (dayList.length === 1 ? 2 : 1);
}

export async function getGuideEmissions(month, year) {
  const m = parseInt(month);
  const y = parseInt(year);

  if (!m || !y || m < 1 || m > 12) {
    throw new Error("Mês e ano inválidos");
  }

  const holidayDays = getNationalHolidayDays(m, y);
  const dayCountMap = buildDayCountMap(m, y, holidayDays);

  const [abaPatients, iamescPatients] = await Promise.all([
    prisma.patient.findMany({
      where: {
        patient_type: { contains: "ABA" },
        health_plan: { notIn: ["PARTICULAR", "IAMESC"] },
      },
      include: {
        patient_schedules: true,
        guide_emissions: { where: { month: m, year: y } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.patient.findMany({
      where: { health_plan: { contains: "IAMESC", mode: "insensitive" } },
      include: {
        patient_schedules: true,
        guide_emissions: { where: { month: m, year: y } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const result = [];

  for (const patient of abaPatients) {
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

      result.push({
        emission_id: emission?.id || null,
        patient_id: patient.id,
        patient_name: patient.name,
        health_plan: patient.health_plan,
        specialty,
        schedule_days: schedule?.days || null,
        quantity: calculateSessions(schedule?.days, dayCountMap),
        emitted: emission?.emitted || false,
        emitted_at: emission?.emitted_at || null,
      });
    }
  }

  for (const patient of iamescPatients) {
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

      result.push({
        emission_id: emission?.id || null,
        patient_id: patient.id,
        patient_name: patient.name,
        health_plan: patient.health_plan,
        specialty,
        schedule_days: schedule?.days || null,
        quantity: calculateSessionsIamesc(schedule?.days, dayCountMap),
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
