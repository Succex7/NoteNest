// routes/aiRoutes.js — AI feature routes

import express from "express";
import { summarize, explain, ask, chat } from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";
import aiLimiter from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

// All AI routes require authentication
router.use(protect);

// Per-route AI rate limiting (prevent API abuse)
router.post("/summarize/:noteId", aiLimiter, summarize);
router.post("/explain/:noteId", aiLimiter, explain);
router.post("/ask/:noteId", aiLimiter, ask);
router.post("/chat", aiLimiter, chat);

export default router;