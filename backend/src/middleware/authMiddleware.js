// middleware/authMiddleware.js — JWT Authentication Guard
// Protects private routes by verifying the Bearer token

import jwt from "jsonwebtoken";
import User from "../models/user.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Middleware that verifies the JWT token from the Authorization header.
 * Attaches the authenticated user to req.user.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Extract token from "Authorization: Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized — no token provided");
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to the request (excluding password)
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized — user not found");
    }

    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized — invalid or expired token");
  }
});

export { protect };