import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/role.middleware.js";
import {
  getGuideEmissionsController,
  toggleGuideEmissionController,
  getPatientSchedulesController,
  upsertPatientSchedulesController,
} from "./guide-emission.controller.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  authorize(["admin", "supervisor", "user"]),
  getGuideEmissionsController
);

router.post(
  "/toggle",
  authMiddleware,
  authorize(["admin", "supervisor", "user"]),
  toggleGuideEmissionController
);

router.get(
  "/schedules/:patientId",
  authMiddleware,
  authorize(["admin", "supervisor", "user"]),
  getPatientSchedulesController
);

router.put(
  "/schedules/:patientId",
  authMiddleware,
  authorize(["admin", "supervisor", "user"]),
  upsertPatientSchedulesController
);

export default router;
