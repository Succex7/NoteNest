// utils/generateToken.js — JWT token generator

import jwt from "jsonwebtoken";

/**
 * Generates a signed JWT for a given user ID.
 * @param {string} userId - MongoDB user _id
 * @returns {string} signed JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

export default generateToken;