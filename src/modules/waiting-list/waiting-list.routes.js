import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/role.middleware.js";
import {
  getWaitingListController,
  createWaitingEntryController,
  updateWaitingEntryController,
  deleteWaitingEntryController,
} from "./waiting-list.controller.js";

const router = express.Router();

router.get("/", authMiddleware, authorize(["admin", "user"]), getWaitingListController);
router.post("/", authMiddleware, authorize(["admin", "user"]), createWaitingEntryController);
router.put("/:id", authMiddleware, authorize(["admin", "user"]), updateWaitingEntryController);
router.delete("/:id", authMiddleware, authorize(["admin", "user"]), deleteWaitingEntryController);

export default router;
