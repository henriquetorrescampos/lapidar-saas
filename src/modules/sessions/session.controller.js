import {
  archiveSessionsToHistory,
  createManySessions,
  createSingleSession,
  deleteSessionHistory,
  getSessionHistoryByPatient,
} from "./session.service.js";
import { prisma } from "../../lib/prisma.js";

export async function getSessionsByPatientAndSpecialtyController(req, res) {
  try {
    const { patient_id, specialty } = req.query;

    if (!patient_id || !specialty) {
      return res
        .status(400)
        .json({ error: "patient_id and specialty are required" });
    }

    const patientId = parseInt(patient_id);

    const sessions = await prisma.session.findMany({
      where: {
        patient_id: patientId,
        specialty: specialty,
      },
      orderBy: {
        date: "asc",
      },
    });

    res.json(sessions);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function createManySessionsController(req, res) {
  try {
    const result = await createManySessions(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function createSingleSessionController(req, res) {
  try {
    const result = await createSingleSession(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function getSessionHistoryController(req, res) {
  try {
    const { patient_id } = req.query;

    if (!patient_id) {
      return res.status(400).json({ error: "patient_id is required" });
    }

    const history = await getSessionHistoryByPatient(patient_id);
    res.json(history);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function archiveSessionsToHistoryController(req, res) {
  try {
    const result = await archiveSessionsToHistory(req.body, req.user);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function deleteSessionController(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    const sessionId = parseInt(id);

    // Verificar se sessão existe
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Deletar sessão
    await prisma.session.delete({
      where: { id: sessionId },
    });

    res.json({ message: "Session deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function deleteSessionHistoryController(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "History ID is required" });
    }

    await deleteSessionHistory(id);
    res.json({ message: "Session history deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
