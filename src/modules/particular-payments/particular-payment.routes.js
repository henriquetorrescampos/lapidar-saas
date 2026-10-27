import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/role.middleware.js";
import {
  getPaymentStatusController,
  markAsPaidController,
  clearPaymentController,
} from "./particular-payment.controller.js";

const router = express.Router();

router.get(
  "/:patientId",
  authMiddleware,
  authorize(["admin", "supervisor", "user"]),
  getPaymentStatusController,
);

router.put(
  "/:patientId/pay",
  authMiddleware,
  authorize(["admin", "supervisor", "user"]),
  markAsPaidController,
);

router.delete(
  "/:patientId/pay",
  authMiddleware,
  authorize(["admin", "supervisor", "user"]),
  clearPaymentController,
);

export default router;
