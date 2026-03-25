// ============================================================
// routes/folderRoutes.js — Folder management routes
// ============================================================

import express from "express";
import {
  createFolder,
  getFolders,
  renameFolder,
  deleteFolder,
} from "../controllers/folderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All folder routes require authentication
router.use(protect);

router.post("/", createFolder);
router.get("/", getFolders);
router.put("/:id", renameFolder);
router.delete("/:id", deleteFolder);

export default router;