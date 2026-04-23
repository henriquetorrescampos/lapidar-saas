import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/role.middleware.js";
import {
  archiveSessionsToHistoryController,
  getSessionsByPatientAndSpecialtyController,
  getSessionHistoryController,
  createManySessionsController,
  createSingleSessionController,
  deleteSessionController,
  deleteSessionHistoryController,
  updateSessionDateController,
} from "./session.controller.js";

const router = express.Router();

// Buscar sessões por paciente e especialidade
router.get(
  "/",
  authMiddleware,
  authorize(["admin", "user"]),
  getSessionsByPatientAndSpecialtyController,
);

router.get(
  "/history",
  authMiddleware,
  authorize(["admin", "user"]),
  getSessionHistoryController,
);

// Criar uma sessão individual
router.post(
  "/",
  authMiddleware,
  authorize(["admin", "user"]),
  createSingleSessionController,
);

router.post(
  "/history",
  authMiddleware,
  authorize(["admin", "user"]),
  archiveSessionsToHistoryController,
);

// admin e recepção podem marcar sessões (múltiplas)
router.post(
  "/bulk",
  authMiddleware,
  authorize(["admin", "user"]),
  createManySessionsController,
);

// Deletar uma sessão
router.delete(
  "/history/:id",
  authMiddleware,
  authorize(["admin", "user"]),
  deleteSessionHistoryController,
);

// Atualizar data de uma sessão
router.put(
  "/:id",
  authMiddleware,
  authorize(["admin", "user"]),
  updateSessionDateController,
);

// Deletar uma sessão
router.delete(
  "/:id",
  authMiddleware,
  authorize(["admin", "user"]),
  deleteSessionController,
);

export default router;
