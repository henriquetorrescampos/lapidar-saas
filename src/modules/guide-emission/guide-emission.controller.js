import {
  getGuideEmissions,
  toggleGuideEmission,
  getPatientSchedules,
  upsertPatientSchedules,
} from "./guide-emission.service.js";

export async function getGuideEmissionsController(req, res) {
  try {
    const { month, year } = req.query;
    const data = await getGuideEmissions(month, year);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function toggleGuideEmissionController(req, res) {
  try {
    const { patient_id, specialty, month, year } = req.body;
    const data = await toggleGuideEmission(patient_id, specialty, month, year);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function getPatientSchedulesController(req, res) {
  try {
    const { patientId } = req.params;
    const data = await getPatientSchedules(patientId);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function upsertPatientSchedulesController(req, res) {
  try {
    const { patientId } = req.params;
    const { schedules } = req.body;
    if (!Array.isArray(schedules)) {
      return res.status(400).json({ error: "schedules deve ser um array" });
    }
    const data = await upsertPatientSchedules(patientId, schedules);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
