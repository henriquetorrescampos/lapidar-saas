import {
  getNeuroSchedules,
  createNeuroSchedule,
  updateNeuroScheduleStatus,
  deleteNeuroSchedule,
} from "./neuro-schedule.service.js";

export async function getNeuroSchedulesController(req, res) {
  try {
    const schedules = await getNeuroSchedules(req.query);
    res.json(schedules);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function createNeuroScheduleController(req, res) {
  try {
    const schedule = await createNeuroSchedule(req.body);
    res.status(201).json(schedule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function updateNeuroScheduleStatusController(req, res) {
  try {
    const schedule = await updateNeuroScheduleStatus(
      req.params.id,
      req.body.status,
    );
    res.json(schedule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function deleteNeuroScheduleController(req, res) {
  try {
    await deleteNeuroSchedule(req.params.id);
    res.json({ message: "Agendamento deletado com sucesso" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
