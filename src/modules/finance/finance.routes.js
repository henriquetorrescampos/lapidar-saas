import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/role.middleware.js";

import {
  // Receitas
  createRevenueController,
  getRevenuesController,
  getRevenueByHealthPlanController,
  deleteRevenueController,
  // Despesas
  createExpenseController,
  getExpensesController,
  getExpenseByCategoryController,
  deleteExpenseController,
  // Dashboard
  getDashboardController,
  // Health Plans
  createHealthPlanController,
  getHealthPlansController,
  deleteHealthPlanController,
  // Legacy
  createTransactionController,
  getSummaryController,
  getTransactionsController,
  deleteTransactionController,
} from "./finance.controller.js";

const router = express.Router();

// 🔥 SOMENTE ADMIN

// ============ DASHBOARD ============
router.get(
  "/dashboard",
  authMiddleware,
  authorize(["admin"]),
  getDashboardController,
);

// ============ RECEITAS ============
router.post(
  "/revenue",
  authMiddleware,
  authorize(["admin"]),
  createRevenueController,
);

router.get(
  "/revenue",
  authMiddleware,
  authorize(["admin"]),
  getRevenuesController,
);

router.get(
  "/revenue/by-health-plan",
  authMiddleware,
  authorize(["admin"]),
  getRevenueByHealthPlanController,
);

router.delete(
  "/revenue/:id",
  authMiddleware,
  authorize(["admin"]),
  deleteRevenueController,
);

// ============ DESPESAS ============
router.post(
  "/expense",
  authMiddleware,
  authorize(["admin"]),
  createExpenseController,
);

router.get(
  "/expense",
  authMiddleware,
  authorize(["admin"]),
  getExpensesController,
);

router.get(
  "/expense/by-category",
  authMiddleware,
  authorize(["admin"]),
  getExpenseByCategoryController,
);

router.delete(
  "/expense/:id",
  authMiddleware,
  authorize(["admin"]),
  deleteExpenseController,
);

// ============ HEALTH PLANS ============
router.post(
  "/health-plan",
  authMiddleware,
  authorize(["admin"]),
  createHealthPlanController,
);

router.get(
  "/health-plan",
  authMiddleware,
  authorize(["admin"]),
  getHealthPlansController,
);

router.delete(
  "/health-plan/:id",
  authMiddleware,
  authorize(["admin"]),
  deleteHealthPlanController,
);

// ============ LEGACY (compatibilidade com código antigo) ============
router.post(
  "/",
  authMiddleware,
  authorize(["admin"]),
  createTransactionController,
);

router.get(
  "/summary",
  authMiddleware,
  authorize(["admin"]),
  getSummaryController,
);

router.get(
  "/",
  authMiddleware,
  authorize(["admin"]),
  getTransactionsController,
);

router.delete(
  "/:id",
  authMiddleware,
  authorize(["admin"]),
  deleteTransactionController,
);

export default router;
