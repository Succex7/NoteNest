// models/Note.js — Mongoose schema for Note

import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null, // null = "Uncategorized"
    },

    title: {
      type: String,
      required: [true, "Note title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },

    content: {
      type: String,
      default: "",
    },

    // Cloudinary file attachment (image, PDF, etc.)
    fileUrl: {
      type: String,
      default: null,
    },

    // Cloudinary public ID — needed to delete the file from Cloudinary
    filePublicId: {
      type: String,
      default: null,
    },

    fileType: {
      type: String,
      enum: ["image", "pdf", "other", null],
      default: null,
    },

    // For future drag-and-drop ordering within a folder
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast search by user
noteSchema.index({ user: 1 });

// Text index for full-text search on title and content
noteSchema.index({ title: "text", content: "text" });

const Note = mongoose.model("Note", noteSchema);

export default Note;