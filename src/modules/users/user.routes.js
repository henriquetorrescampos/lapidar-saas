import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/role.middleware.js";

import {
  createUserController,
  getUsersController,
  deleteUserController,
} from "./user.controller.js";

const router = express.Router();

// 🔥 só admin cria usuário
router.post("/", authMiddleware, authorize(["admin"]), createUserController);

// 🔥 só admin lista usuários
router.get("/", authMiddleware, authorize(["admin"]), getUsersController);

// 🔥 só admin deleta usuário
router.delete(
  "/:id",
  authMiddleware,
  authorize(["admin"]),
  deleteUserController,
);

export default router;
