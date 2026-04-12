import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/role.middleware.js";
import { employeeUpload } from "../../middleware/employee-upload.middleware.js";
import {
  createEmployeeController,
  getEmployeesController,
  getEmployeeByIdController,
  updateEmployeeController,
  deleteEmployeeController,
  listEmployeeDocumentsController,
  createEmployeeDocumentController,
  downloadEmployeeDocumentController,
  deleteEmployeeDocumentController,
} from "./employee.controller.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  authorize(["admin"]),
  createEmployeeController,
);

router.get("/", authMiddleware, authorize(["admin"]), getEmployeesController);

router.get(
  "/:id",
  authMiddleware,
  authorize(["admin"]),
  getEmployeeByIdController,
);

router.put(
  "/:id",
  authMiddleware,
  authorize(["admin"]),
  updateEmployeeController,
);

router.delete(
  "/:id",
  authMiddleware,
  authorize(["admin"]),
  deleteEmployeeController,
);

router.get(
  "/:id/documents",
  authMiddleware,
  authorize(["admin"]),
  listEmployeeDocumentsController,
);

router.post(
  "/:id/documents",
  authMiddleware,
  authorize(["admin"]),
  employeeUpload.single("file"),
  createEmployeeDocumentController,
);

router.get(
  "/:id/documents/:documentId/download",
  authMiddleware,
  authorize(["admin"]),
  downloadEmployeeDocumentController,
);

router.delete(
  "/:id/documents/:documentId",
  authMiddleware,
  authorize(["admin"]),
  deleteEmployeeDocumentController,
);

export default router;
