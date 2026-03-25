// ============================================================
// models/Folder.js — Mongoose schema for Folder
// ============================================================

import mongoose from "mongoose";

const folderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: [true, "Folder name is required"],
      trim: true,
      maxlength: [50, "Folder name cannot exceed 50 characters"],
    },

    // For future drag-and-drop ordering
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate folder names per user
folderSchema.index({ user: 1, name: 1 }, { unique: true });

const Folder = mongoose.model("Folder", folderSchema);

export default Folder;