// ============================================================
// routes/authRoutes.js — Authentication routes
// ============================================================

import express from "express";
import {
  register,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  deleteAccount,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import authLimiter from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/forgot-password", authLimiter, forgotPassword);
router.put("/reset-password/:token", resetPassword);

// Protected routes (require valid JWT)
router.get("/me", protect, getMe);
router.put("/update-profile", protect, updateProfile);
router.delete("/delete-account", protect, deleteAccount);

export default router;