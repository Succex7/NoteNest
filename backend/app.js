// ============================================================
// app.js — Express app configuration
// Registers middleware, routes, and error handlers
// ============================================================

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import dotenv from "dotenv";

dotenv.config();

// Route imports
import uploadRoutes from "./routes/uploadRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import folderRoutes from "./routes/folderRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";


// Error middleware
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

// ─────────────────────────────────────────
// Security Middleware
// ─────────────────────────────────────────

// Set secure HTTP headers
app.use(helmet());

// Sanitize user input to prevent NoSQL injection attacks
app.use(mongoSanitize());

// Enable CORS — restrict origins in production
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/api/upload", uploadRoutes);

// General rate limiter — applies to all routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // max 100 requests per window
  message: {
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

// ─────────────────────────────────────────
// General Middleware
// ─────────────────────────────────────────

// Parse incoming JSON requests
app.use(express.json({ limit: "10mb" }));

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// HTTP request logger (only in development)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ─────────────────────────────────────────
// Health Check Route
// ─────────────────────────────────────────

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "NoteNest API is running 🚀" });
});

// ─────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/ai", aiRoutes);

// ─────────────────────────────────────────
// Error Handling Middleware (must be last)
// ─────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);

export default app;