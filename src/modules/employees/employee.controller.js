import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  listEmployeeDocuments,
  createEmployeeDocument,
  getEmployeeDocumentForDownload,
  deleteEmployeeDocument,
} from "./employee.service.js";

export async function createEmployeeController(req, res) {
  try {
    const employee = await createEmployee(req.body);
    res.status(201).json(employee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function getEmployeesController(req, res) {
  try {
    const employees = await getEmployees();
    res.json(employees);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function getEmployeeByIdController(req, res) {
  try {
    const employee = await getEmployeeById(req.params.id);

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json(employee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function updateEmployeeController(req, res) {
  try {
    const employee = await updateEmployee(req.params.id, req.body);
    res.json(employee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function deleteEmployeeController(req, res) {
  try {
    await deleteEmployee(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function listEmployeeDocumentsController(req, res) {
  try {
    const documents = await listEmployeeDocuments(req.params.id);
    res.json(documents);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function createEmployeeDocumentController(req, res) {
  try {
    const document = await createEmployeeDocument(
      req.params.id,
      req.file,
      req.body.document_type,
    );
    res.status(201).json(document);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function downloadEmployeeDocumentController(req, res) {
  try {
    const { document, filePath } = await getEmployeeDocumentForDownload(
      req.params.id,
      req.params.documentId,
    );

    res.download(filePath, document.original_name);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function deleteEmployeeDocumentController(req, res) {
  try {
    await deleteEmployeeDocument(req.params.id, req.params.documentId);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
