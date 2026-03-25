// ============================================================
// routes/uploadRoutes.js — File upload routes (Cloudinary)
// ============================================================

import express from "express";
import { uploadFile, deleteFile } from "../controllers/uploadController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// All upload routes require authentication
router.use(protect);

// "file" is the expected field name in the form-data
router.post("/:noteId", upload.single("file"), uploadFile);
router.delete("/:noteId", deleteFile);

export default router;