// ============================================================
// controllers/folderController.js — Folder CRUD logic
// ============================================================

import Folder from "../models/folder.js";
import Note from "../models/note.js";
import asyncHandler from "../utils/asyncHandler.js";


// ─────────────────────────────────────────
// @desc    Create a new folder
// @route   POST /api/folders
// @access  Private
// ─────────────────────────────────────────
const createFolder = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Folder name is required");
  }

  const folder = await Folder.create({
    user: req.user._id,
    name: name.trim(),
  });

  res.status(201).json({
    success: true,
    message: "Folder created successfully",
    data: folder,
  });
});


// ─────────────────────────────────────────
// @desc    Get all folders for the logged-in user
// @route   GET /api/folders
// @access  Private
// ─────────────────────────────────────────
const getFolders = asyncHandler(async (req, res) => {
  const { sort = "createdAt" } = req.query;

  // Allowed sort fields to prevent injection
  const allowedSorts = ["name", "createdAt", "order"];
  const sortField = allowedSorts.includes(sort) ? sort : "createdAt";

  const folders = await Folder.find({ user: req.user._id }).sort({
    [sortField]: 1,
  });

  res.status(200).json({
    success: true,
    count: folders.length,
    data: folders,
  });
});


// ─────────────────────────────────────────
// @desc    Rename a folder
// @route   PUT /api/folders/:id
// @access  Private
// ─────────────────────────────────────────
const renameFolder = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("New folder name is required");
  }

  const folder = await Folder.findOne({
    _id: req.params.id,
    user: req.user._id, // Ensure ownership
  });

  if (!folder) {
    res.status(404);
    throw new Error("Folder not found");
  }

  folder.name = name.trim();
  const updatedFolder = await folder.save();

  res.status(200).json({
    success: true,
    message: "Folder renamed successfully",
    data: updatedFolder,
  });
});


// ─────────────────────────────────────────
// @desc    Delete a folder (and optionally its notes)
// @route   DELETE /api/folders/:id
// @access  Private
// ─────────────────────────────────────────
const deleteFolder = asyncHandler(async (req, res) => {
  // deleteNotes=true will delete all notes inside the folder
  const { deleteNotes } = req.query;

  const folder = await Folder.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!folder) {
    res.status(404);
    throw new Error("Folder not found");
  }

  if (deleteNotes === "true") {
    // Delete all notes inside this folder
    await Note.deleteMany({ folder: folder._id, user: req.user._id });
  } else {
    // Move all notes to "Uncategorized" (set folder to null)
    await Note.updateMany(
      { folder: folder._id, user: req.user._id },
      { $set: { folder: null } }
    );
  }

  await folder.deleteOne();

  res.status(200).json({
    success: true,
    message: deleteNotes === "true"
      ? "Folder and all its notes deleted"
      : "Folder deleted — notes moved to Uncategorized",
  });
});


export { createFolder, getFolders, renameFolder, deleteFolder };