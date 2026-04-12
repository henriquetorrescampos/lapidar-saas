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
    const page = req.query.page ? Number.parseInt(req.query.page, 10) : null;
    const limit = req.query.limit ? Number.parseInt(req.query.limit, 10) : null;

    if (page && (Number.isNaN(page) || page < 1)) {
      return res.status(400).json({ error: "Invalid page parameter" });
    }
    if (limit && (Number.isNaN(limit) || limit < 1 || limit > 100)) {
      return res.status(400).json({ error: "Invalid limit parameter (1-100)" });
    }

    const result = await getEmployees({ page, limit });
    res.json(result);
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
