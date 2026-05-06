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
  authorize(["admin", "user"]),
  getGuideEmissionsController
);

router.post(
  "/toggle",
  authMiddleware,
  authorize(["admin", "user"]),
  toggleGuideEmissionController
);

router.get(
  "/schedules/:patientId",
  authMiddleware,
  authorize(["admin", "user"]),
  getPatientSchedulesController
);

router.put(
  "/schedules/:patientId",
  authMiddleware,
  authorize(["admin", "user"]),
  upsertPatientSchedulesController
);

export default router;
