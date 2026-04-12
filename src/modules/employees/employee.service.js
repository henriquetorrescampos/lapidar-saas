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

function calculatePayrollValues(salary, absences) {
  const dailyValue = salary / 30;
  const updatedValue = salary - dailyValue * absences;

  return {
    daily_value: Number(dailyValue.toFixed(2)),
    updated_value: Number(updatedValue.toFixed(2)),
  };
}

export async function createEmployee(data) {
  validateRequired(data.name, "Name");
  validateRequired(data.specialty, "Specialty");
  validateRequired(data.salary, "Salary");

  const salary = parseMoney(data.salary, "Salary");
  const absences = parseAbsences(data.absences ?? 0);
  const payroll = calculatePayrollValues(salary, absences);

  return await prisma.employee.create({
    data: {
      name: data.name.trim(),
      specialty: data.specialty.trim(),
      salary,
      absences,
      ...payroll,
    },
  });
}

export async function getEmployees() {
  return await prisma.employee.findMany({
    orderBy: {
      name: "asc",
    },
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

  const absences =
    data.absences !== undefined
      ? parseAbsences(data.absences)
      : existingEmployee.absences;

  const payroll = calculatePayrollValues(salary, absences);

  return await prisma.employee.update({
    where: { id: employeeId },
    data: {
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.specialty !== undefined && { specialty: data.specialty.trim() }),
      salary,
      absences,
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
