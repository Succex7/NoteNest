// controllers/authController.js — Auth logic
// Register, Login, Get Profile, Update, Reset Password, Delete

import crypto from "crypto";
import User from "../models/user.js";
import Note from "../models/note.js";
import Folder from "../models/folder.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import asyncHandler from "../utils/asyncHandler.js";


// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public

const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Validate required fields
  if (!username || !email || !password) {
    res.status(400);
    throw new Error("Please provide username, email, and password");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("An account with this email already exists");
  }

  // Create the new user (password hashed in the model pre-save hook)
  const user = await User.create({ username, email, password });

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      token: generateToken(user._id),
    },
  });
});


// @desc    Login a user
// @route   POST /api/auth/login
// @access  Public

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }

  // Retrieve user with password field (it's excluded by default)
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  // Compare entered password with hashed password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      token: generateToken(user._id),
    },
  });
});


// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private

const getMe = asyncHandler(async (req, res) => {
  // req.user is attached by the protect middleware
  const user = req.user;

  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
    },
  });
});


// @desc    Update username or email
// @route   PUT /api/auth/update-profile
// @access  Private

const updateProfile = asyncHandler(async (req, res) => {
  const { username, email } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Update fields if provided
  if (username) user.username = username;
  if (email) user.email = email;

  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: {
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      profilePicture: updatedUser.profilePicture,
    },
  });
});


// @desc    Request a password reset email
// @route   POST /api/auth/forgot-password
// @access  Public

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Please provide your email");
  }

  const user = await User.findOne({ email });

  // Always respond with success to prevent email enumeration attacks
  if (!user) {
    return res.status(200).json({
      success: true,
      message: "If an account exists, a reset link has been sent",
    });
  }

  // Generate a secure random reset token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash and store it in the DB (never store raw tokens)
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Token expires in 15 minutes
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  // Build the reset URL (points to frontend — insert your actual URL)
  const resetUrl = `${process.env.CLIENT_ORIGIN}/reset-password/${resetToken}`;

  const html = `
    <h2>NoteNest Password Reset</h2>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetUrl}" target="_blank">Reset My Password</a>
    <p>This link expires in 15 minutes.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  try {
    await sendEmail({ to: user.email, subject: "NoteNest — Password Reset", html });

    res.status(200).json({
      success: true,
      message: "If an account exists, a reset link has been sent",
    });
  } catch (error) {
    // Clear reset fields if email fails
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(500);
    throw new Error("Email could not be sent. Please try again later.");
  }
});


// @desc    Reset password using the token from email
// @route   PUT /api/auth/reset-password/:token
// @access  Public

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    res.status(400);
    throw new Error("Please provide a new password");
  }

  // Hash the incoming token to compare with stored hash
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }, // Token must still be valid
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired reset token");
  }

  // Set new password and clear reset fields
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successful. Please log in.",
  });
});


// @desc    Delete account and all associated data
// @route   DELETE /api/auth/delete-account
// @access  Private

const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Delete all notes and folders belonging to this user
  await Note.deleteMany({ user: userId });
  await Folder.deleteMany({ user: userId });
  await User.findByIdAndDelete(userId);

  res.status(200).json({
    success: true,
    message: "Account and all associated data deleted successfully",
  });
});


export {
  register,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  deleteAccount,
};