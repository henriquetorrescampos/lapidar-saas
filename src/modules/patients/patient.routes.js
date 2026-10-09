import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/role.middleware.js";

import {
  createPatientController,
  getPatientsController,
  getPatientByIdController,
  updatePatientController,
  deletePatientController,
} from "./patient.controller.js";

const router = express.Router();

// admin, supervisor e user podem mexer em pacientes
router.post(
  "/",
  authMiddleware,
  authorize(["admin", "supervisor", "user"]),
  createPatientController,
);
router.get(
  "/",
  authMiddleware,
  authorize(["admin", "supervisor", "user"]),
  getPatientsController,
);
router.get(
  "/:id",
  authMiddleware,
  authorize(["admin", "supervisor", "user"]),
  getPatientByIdController,
);

router.put(
  "/:id",
  authMiddleware,
  authorize(["admin", "supervisor", "user"]),
  updatePatientController,
);
// admin e supervisor podem deletar pacientes
router.delete(
  "/:id",
  authMiddleware,
  authorize(["admin", "supervisor"]),
  deletePatientController,
);

export default router;
