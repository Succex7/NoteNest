// routes/noteRoutes.js — Notes management routes

import express from "express";
import {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  bulkDeleteNotes,
  searchNotes,
} from "../controllers/noteController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All note routes require authentication
router.use(protect);

router.post("/", createNote);
router.get("/", getNotes);
router.get("/search", searchNotes); // must be before :id route to avoid conflict   
router.delete("/bulk-delete", bulkDeleteNotes);
router.get("/:id", getNoteById);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

export default router;