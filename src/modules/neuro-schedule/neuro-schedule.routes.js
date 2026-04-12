import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/role.middleware.js";
import {
  getNeuroSchedulesController,
  createNeuroScheduleController,
  updateNeuroScheduleStatusController,
  deleteNeuroScheduleController,
} from "./neuro-schedule.controller.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  authorize(["admin", "user"]),
  getNeuroSchedulesController,
);
router.post(
  "/",
  authMiddleware,
  authorize(["admin", "user"]),
  createNeuroScheduleController,
);
router.patch(
  "/:id/status",
  authMiddleware,
  authorize(["admin", "user"]),
  updateNeuroScheduleStatusController,
);
router.delete(
  "/:id",
  authMiddleware,
  authorize(["admin"]),
  deleteNeuroScheduleController,
);

export default router;
