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

// admin e user podem mexer em pacientes
router.post(
  "/",
  authMiddleware,
  authorize(["admin", "user"]),
  createPatientController,
);
router.get(
  "/",
  authMiddleware,
  authorize(["admin", "user"]),
  getPatientsController,
);
router.get(
  "/:id",
  authMiddleware,
  authorize(["admin", "user"]),
  getPatientByIdController,
);

router.put(
  "/:id",
  authMiddleware,
  authorize(["admin", "user"]),
  updatePatientController,
);
router.delete(
  "/:id",
  authMiddleware,
  authorize(["admin", "user"]),
  deletePatientController,
);

export default router;
