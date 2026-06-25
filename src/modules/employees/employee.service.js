import { prisma } from "../../lib/prisma.js";
import fs from "node:fs";
import path from "node:path";
import { validateNumberId, validateRequired } from "../../lib/validators.js";

const EMPLOYEE_UPLOAD_DIR = path.join(process.cwd(), "uploads", "employees");

function parseMoney(value, fieldName) {
  const numberValue = Number(value);
  if (Number.isNaN(numberValue) || numberValue < 0) {
    throw new Error(`${fieldName} must be a valid positive number`);
  }
  return numberValue;
}

function parseAbsences(value) {
  const numberValue = Number(value);
  if (!Number.isInteger(numberValue) || numberValue < 0) {
    throw new Error("Absences must be a non-negative integer");
  }
  return numberValue;
}

function parsePositiveInt(value, fieldName) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) {
    throw new Error(`${fieldName} must be a non-negative integer`);
  }
  return n;
}

function parsePositiveFloat(value, fieldName) {
  const n = Number(value);
  if (Number.isNaN(n) || n < 0) {
    throw new Error(`${fieldName} must be a non-negative number`);
  }
  return n;
}

function calculatePayrollValues(salary, fullDayAbsences, partialDayAbsences, deductedHours, schedule) {
  const { fullDaysPerWeek, fullDayHours, partialDaysPerWeek, partialDayHours } =
    schedule;

  const weeklyHours =
    fullDaysPerWeek * fullDayHours + partialDaysPerWeek * partialDayHours;
  const monthlyHours = weeklyHours * 4.33;

  const hourlyValue = monthlyHours > 0 ? salary / monthlyHours : 0;
  const fullDayValue = hourlyValue * fullDayHours;
  const partialDayValue = hourlyValue * partialDayHours;
  const updatedValue = Math.max(
    0,
    salary
      - fullDayAbsences * fullDayValue
      - partialDayAbsences * partialDayValue
      - deductedHours * hourlyValue,
  );

  return {
    hourly_value: Number(hourlyValue.toFixed(2)),
    daily_value: Number(fullDayValue.toFixed(2)),
    partial_day_value: Number(partialDayValue.toFixed(2)),
    updated_value: Number(updatedValue.toFixed(2)),
  };
}

export async function createEmployee(data) {
  validateRequired(data.name, "Name");
  validateRequired(data.specialty, "Specialty");
  validateRequired(data.salary, "Salary");

  const salary = parseMoney(data.salary, "Salary");
  const fullDayAbsences = parseAbsences(data.full_day_absences ?? 0);
  const partialDayAbsences = parseAbsences(data.partial_day_absences ?? 0);
  const deductedHours = parsePositiveFloat(data.deducted_hours ?? 0, "Deducted hours");
  const schedule = {
    fullDaysPerWeek: parsePositiveInt(data.full_days_per_week ?? 0, "Full days per week"),
    fullDayHours: parsePositiveFloat(data.full_day_hours ?? 10, "Full day hours"),
    partialDaysPerWeek: parsePositiveInt(data.partial_days_per_week ?? 0, "Partial days per week"),
    partialDayHours: parsePositiveFloat(data.partial_day_hours ?? 4, "Partial day hours"),
  };
  const payroll = calculatePayrollValues(salary, fullDayAbsences, partialDayAbsences, deductedHours, schedule);

  return await prisma.employee.create({
    data: {
      name: data.name.trim(),
      specialty: data.specialty.trim(),
      salary,
      full_day_absences: fullDayAbsences,
      partial_day_absences: partialDayAbsences,
      deducted_hours: deductedHours,
      full_days_per_week: schedule.fullDaysPerWeek,
      full_day_hours: schedule.fullDayHours,
      partial_days_per_week: schedule.partialDaysPerWeek,
      partial_day_hours: schedule.partialDayHours,
      ...payroll,
    },
  });
}

export async function getEmployeeNames() {
  return await prisma.employee.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, specialty: true },
  });
}

export async function getEmployees({ page, limit } = {}) {
  if (page && limit) {
    const skip = (page - 1) * limit;

    const [data, total, payrollAgg] = await Promise.all([
      prisma.employee.findMany({
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      prisma.employee.count(),
      prisma.employee.aggregate({
        _sum: { updated_value: true },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        consolidatedPayroll: payrollAgg._sum.updated_value || 0,
      },
    };
  }

  return await prisma.employee.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getEmployeeById(id) {
  const employeeId = validateNumberId(id);

  return await prisma.employee.findUnique({
    where: { id: employeeId },
  });
}

export async function updateEmployee(id, data) {
  const employeeId = validateNumberId(id);

  const existingEmployee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });

  if (!existingEmployee) {
    throw new Error("Employee not found");
  }

  const salary =
    data.salary !== undefined
      ? parseMoney(data.salary, "Salary")
      : existingEmployee.salary;

  const fullDayAbsences =
    data.full_day_absences !== undefined
      ? parseAbsences(data.full_day_absences)
      : existingEmployee.full_day_absences;

  const partialDayAbsences =
    data.partial_day_absences !== undefined
      ? parseAbsences(data.partial_day_absences)
      : existingEmployee.partial_day_absences;

  const deductedHours =
    data.deducted_hours !== undefined
      ? parsePositiveFloat(data.deducted_hours, "Deducted hours")
      : existingEmployee.deducted_hours;

  const schedule = {
    fullDaysPerWeek:
      data.full_days_per_week !== undefined
        ? parsePositiveInt(data.full_days_per_week, "Full days per week")
        : existingEmployee.full_days_per_week,
    fullDayHours:
      data.full_day_hours !== undefined
        ? parsePositiveFloat(data.full_day_hours, "Full day hours")
        : existingEmployee.full_day_hours,
    partialDaysPerWeek:
      data.partial_days_per_week !== undefined
        ? parsePositiveInt(data.partial_days_per_week, "Partial days per week")
        : existingEmployee.partial_days_per_week,
    partialDayHours:
      data.partial_day_hours !== undefined
        ? parsePositiveFloat(data.partial_day_hours, "Partial day hours")
        : existingEmployee.partial_day_hours,
  };

  const payroll = calculatePayrollValues(salary, fullDayAbsences, partialDayAbsences, deductedHours, schedule);

  return await prisma.employee.update({
    where: { id: employeeId },
    data: {
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.specialty !== undefined && { specialty: data.specialty.trim() }),
      salary,
      full_day_absences: fullDayAbsences,
      partial_day_absences: partialDayAbsences,
      deducted_hours: deductedHours,
      full_days_per_week: schedule.fullDaysPerWeek,
      full_day_hours: schedule.fullDayHours,
      partial_days_per_week: schedule.partialDaysPerWeek,
      partial_day_hours: schedule.partialDayHours,
      ...payroll,
    },
  });
}

export async function deleteEmployee(id) {
  const employeeId = validateNumberId(id);

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  return await prisma.employee.delete({
    where: { id: employeeId },
  });
}

export async function listEmployeeDocuments(employeeId) {
  const parsedEmployeeId = validateNumberId(employeeId);

  return await prisma.employeeDocument.findMany({
    where: { employee_id: parsedEmployeeId },
    orderBy: { created_at: "desc" },
  });
}

export async function createEmployeeDocument(employeeId, file, documentType) {
  const parsedEmployeeId = validateNumberId(employeeId);

  if (!file) {
    throw new Error("Document file is required");
  }

  const employee = await prisma.employee.findUnique({
    where: { id: parsedEmployeeId },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  return await prisma.employeeDocument.create({
    data: {
      employee_id: parsedEmployeeId,
      document_type: documentType?.trim() || null,
      original_name: file.originalname,
      stored_name: file.filename,
      mime_type: file.mimetype,
      size_bytes: file.size,
    },
  });
}

export async function getEmployeeDocumentForDownload(employeeId, documentId) {
  const parsedEmployeeId = validateNumberId(employeeId);
  const parsedDocumentId = validateNumberId(documentId);

  const document = await prisma.employeeDocument.findFirst({
    where: {
      id: parsedDocumentId,
      employee_id: parsedEmployeeId,
    },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  const filePath = path.join(EMPLOYEE_UPLOAD_DIR, document.stored_name);
  const resolvedPath = path.resolve(filePath);

  // Proteção contra Path Traversal
  if (!resolvedPath.startsWith(path.resolve(EMPLOYEE_UPLOAD_DIR))) {
    throw new Error("Invalid file path");
  }

  if (!fs.existsSync(resolvedPath)) {
    throw new Error("Stored file not found");
  }

  return {
    document,
    filePath: resolvedPath,
  };
}

export async function deleteEmployeeDocument(employeeId, documentId) {
  const parsedEmployeeId = validateNumberId(employeeId);
  const parsedDocumentId = validateNumberId(documentId);

  const document = await prisma.employeeDocument.findFirst({
    where: {
      id: parsedDocumentId,
      employee_id: parsedEmployeeId,
    },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  const filePath = path.join(EMPLOYEE_UPLOAD_DIR, document.stored_name);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  return await prisma.employeeDocument.delete({
    where: { id: parsedDocumentId },
  });
}
