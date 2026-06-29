import { prisma } from "../../lib/prisma.js";

export async function getWaitingList() {
  return prisma.waitingList.findMany({
    orderBy: { created_at: "asc" },
  });
}

export async function createWaitingEntry(data) {
  return prisma.waitingList.create({
    data: {
      name: data.name,
      phone: data.phone,
      specialty: data.specialty || "",
      professional_id: data.professional_id ? Number(data.professional_id) : null,
      day_of_week: data.day_of_week,
      desired_time: data.desired_time,
      notes: data.notes || "",
    },
  });
}

export async function updateWaitingEntry(id, data) {
  return prisma.waitingList.update({
    where: { id: Number(id) },
    data: {
      name: data.name,
      phone: data.phone,
      specialty: data.specialty || "",
      professional_id: data.professional_id ? Number(data.professional_id) : null,
      day_of_week: data.day_of_week,
      desired_time: data.desired_time,
      notes: data.notes ?? "",
    },
  });
}

export async function deleteWaitingEntry(id) {
  return prisma.waitingList.delete({
    where: { id: Number(id) },
  });
}
