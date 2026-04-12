import { prisma } from "../../lib/prisma.js";
import { validateRequired, validateNumberId } from "../../lib/validators.js";

export async function getNeuroSchedules(filters = {}) {
  const where = {};

  // Filtrar só pacientes com AVALIACAO_NEUROPSICOLOGICA
  where.patient = { patient_type: { contains: "AVALIACAO_NEUROPSICOLOGICA" } };

  // Filtro por aba: pendentes (status != em_dia) ou concluidos (status = em_dia)
  if (filters.tab === "concluidos") {
    where.status = "em_dia";
  } else {
    where.status = { not: "em_dia" };
  }

  if (filters.year) {
    const year = parseInt(filters.year);
    where.date = {
      gte: new Date(`${year}-01-01`),
      lt: new Date(`${year + 1}-01-01`),
    };
  }

  if (filters.month && filters.year) {
    const year = parseInt(filters.year);
    const month = parseInt(filters.month);
    where.date = {
      gte: new Date(year, month - 1, 1),
      lt: new Date(year, month, 1),
    };
  }

  // Filtro por status de display (atrasado, proximo_mes, pendente)
  if (filters.displayStatus && filters.tab !== "concluidos") {
    const now = new Date();
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);

    if (filters.displayStatus === "atrasado") {
      where.deadline = { lt: now };
    } else if (filters.displayStatus === "proximo_mes") {
      where.deadline = { gte: nextMonthStart, lte: nextMonthEnd };
    } else if (filters.displayStatus === "pendente") {
      where.deadline = { gt: nextMonthEnd };
    }
  }

  // Busca por nome do paciente
  if (filters.search) {
    where.patient = {
      ...where.patient,
      name: { contains: filters.search, mode: "insensitive" },
    };
  }

  // Paginação
  const page = Math.max(1, parseInt(filters.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(filters.limit) || 10));
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.neuroSchedule.findMany({
      where,
      include: {
        patient: {
          select: { id: true, name: true, patient_type: true },
        },
      },
      orderBy: { date: "desc" },
      skip,
      take: limit,
    }),
    prisma.neuroSchedule.count({ where }),
  ]);

  // Stats: contagem geral (independente de paginação e filtros de status/search)
  const baseWhere = {
    patient: { patient_type: { contains: "AVALIACAO_NEUROPSICOLOGICA" } },
  };

  const now = new Date();
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);

  const [totalPendentes, totalConcluidos, totalAtrasados, totalProximoMes] =
    await Promise.all([
      prisma.neuroSchedule.count({
        where: { ...baseWhere, status: { not: "em_dia" } },
      }),
      prisma.neuroSchedule.count({
        where: { ...baseWhere, status: "em_dia" },
      }),
      prisma.neuroSchedule.count({
        where: {
          ...baseWhere,
          status: { not: "em_dia" },
          deadline: { lt: now },
        },
      }),
      prisma.neuroSchedule.count({
        where: {
          ...baseWhere,
          status: { not: "em_dia" },
          deadline: { gte: nextMonthStart, lte: nextMonthEnd },
        },
      }),
    ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    stats: {
      totalPendentes,
      totalConcluidos,
      totalAtrasados,
      totalProximoMes,
    },
  };
}

export async function createNeuroSchedule(data) {
  validateRequired(data.patient_id, "Patient ID");
  validateRequired(data.date, "Date");
  validateRequired(data.deadline, "Deadline");

  const patientId = parseInt(data.patient_id);

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
  });

  if (!patient) {
    throw new Error("Paciente não encontrado");
  }

  if (!patient.patient_type.includes("AVALIACAO_NEUROPSICOLOGICA")) {
    throw new Error(
      "Paciente não está marcado como Avaliação Neuropsicológica",
    );
  }

  return await prisma.neuroSchedule.create({
    data: {
      patient_id: patientId,
      date: new Date(data.date),
      deadline: new Date(data.deadline),
      status: data.status || "pendente",
    },
    include: {
      patient: {
        select: { id: true, name: true, patient_type: true },
      },
    },
  });
}

export async function updateNeuroScheduleStatus(id, status) {
  const scheduleId = validateNumberId(id);

  const schedule = await prisma.neuroSchedule.findUnique({
    where: { id: scheduleId },
  });

  if (!schedule) {
    throw new Error("Agendamento não encontrado");
  }

  // Só permite mudar para "em_dia" a partir do 1º dia do mês seguinte ao cadastro
  if (status === "em_dia") {
    const now = new Date();
    const scheduleDate = new Date(schedule.date);
    const nextMonthStart = new Date(
      scheduleDate.getFullYear(),
      scheduleDate.getMonth() + 1,
      1,
    );

    if (now < nextMonthStart) {
      throw new Error(
        `Só é possível marcar como "Em dia" a partir de ${nextMonthStart.toLocaleDateString("pt-BR")}`,
      );
    }
  }

  return await prisma.neuroSchedule.update({
    where: { id: scheduleId },
    data: { status },
    include: {
      patient: {
        select: { id: true, name: true, patient_type: true },
      },
    },
  });
}

export async function deleteNeuroSchedule(id) {
  const scheduleId = validateNumberId(id);

  const schedule = await prisma.neuroSchedule.findUnique({
    where: { id: scheduleId },
  });

  if (!schedule) {
    throw new Error("Agendamento não encontrado");
  }

  return await prisma.neuroSchedule.delete({
    where: { id: scheduleId },
  });
}
