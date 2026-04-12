import {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} from "./patient.service.js";

// CREATE
export async function createPatientController(req, res) {
  try {
    const patient = await createPatient(req.body);
    res.status(201).json(patient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// GET ALL
export async function getPatientsController(req, res) {
  try {
    const patients = await getPatients();
    res.status(200).json(patients);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// GET BY ID
export async function getPatientByIdController(req, res) {
  try {
    const patient = await getPatientById(req.params.id);

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.status(200).json(patient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// UPDATE
export async function updatePatientController(req, res) {
  try {
    const patient = await updatePatient(req.params.id, req.body);
    res.status(200).json(patient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// DELETE
export async function deletePatientController(req, res) {
  try {
    await deletePatient(req.params.id);
    res.status(204).send(); // ✔️ sem body
  } catch (err) {
    console.error("Delete error:", err.message);
    if (err.message === "PNT_NOT_FOUND") {
      return res.status(404).json({ error: "Patient not found" });
    }
    res.status(400).json({ error: err.message });
  }
}
