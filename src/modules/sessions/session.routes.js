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
  authorize(["admin", "supervisor", "user"]),
  getSessionsByPatientAndSpecialtyController,
);

router.get(
  "/history",
  authMiddleware,
  authorize(["admin", "supervisor", "user"]),
  getSessionHistoryController,
);

// Criar uma sessão individual
router.post(
  "/",
  authMiddleware,
  authorize(["admin", "supervisor", "user"]),
  createSingleSessionController,
);

router.post(
  "/history",
  authMiddleware,
  authorize(["admin", "supervisor", "user"]),
  archiveSessionsToHistoryController,
);

// admin e recepção podem marcar sessões (múltiplas)
router.post(
  "/bulk",
  authMiddleware,
  authorize(["admin", "supervisor", "user"]),
  createManySessionsController,
);

// Deletar uma sessão
router.delete(
  "/history/:id",
  authMiddleware,
  authorize(["admin", "supervisor", "user"]),
  deleteSessionHistoryController,
);

// Atualizar data de uma sessão
router.put(
  "/:id",
  authMiddleware,
  authorize(["admin", "supervisor", "user"]),
  updateSessionDateController,
);

// Deletar uma sessão
router.delete(
  "/:id",
  authMiddleware,
  authorize(["admin", "supervisor", "user"]),
  deleteSessionController,
);

export default router;
