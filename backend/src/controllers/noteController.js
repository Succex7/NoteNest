// controllers/noteController.js — Notes CRUD logic

import Note from "../models/note.js";
import asyncHandler from "../utils/asyncHandler.js";


// @desc    Create a new note
// @route   POST /api/notes
// @access  Private

const createNote = asyncHandler(async (req, res) => {
  const { title, content, folderId, fileUrl, filePublicId, fileType } = req.body;

  if (!title) {
    res.status(400);
    throw new Error("Note title is required");
  }

  const note = await Note.create({
    user: req.user._id,
    title: title.trim(),
    content: content || "",
    folder: folderId || null,
    fileUrl: fileUrl || null,
    filePublicId: filePublicId || null,
    fileType: fileType || null,
  });

  res.status(201).json({
    success: true,
    message: "Note created successfully",
    data: note,
  });
});


// @desc    Get all notes for the logged-in user
// @route   GET /api/notes
// @access  Private
// Query params: folderId, sort, search

const getNotes = asyncHandler(async (req, res) => {
  const { folderId, sort = "createdAt", search } = req.query;

  // Build query
  const query = { user: req.user._id };

  // Filter by folder if provided
  if (folderId) {
    query.folder = folderId;
  }

  // Full-text search on title + content
  if (search) {
    query.$text = { $search: search };
  }

  // Allowed sort fields
  const allowedSorts = ["createdAt", "updatedAt", "title", "order"];
  const sortField = allowedSorts.includes(sort) ? sort : "createdAt";

  const notes = await Note.find(query)
    .sort({ [sortField]: -1 })
    .populate("folder", "name"); // Include folder name in response

  res.status(200).json({
    success: true,
    count: notes.length,
    data: notes,
  });
});

// @desc    Get a single note by ID
// @route   GET /api/notes/:id
// @access  Private

const getNoteById = asyncHandler(async (req, res) => {
  const note = await Note.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).populate("folder", "name");

  if (!note) {
    res.status(404);
    throw new Error("Note not found");
  }

  res.status(200).json({
    success: true,
    data: note,
  });
});


// @desc    Update a note (content, title, folder)
// @route   PUT /api/notes/:id
// @access  Private

const updateNote = asyncHandler(async (req, res) => {
  const { title, content, folderId } = req.body;

  const note = await Note.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!note) {
    res.status(404);
    throw new Error("Note not found");
  }

  // Only update fields that were actually sent
  if (title !== undefined) note.title = title.trim();
  if (content !== undefined) note.content = content;
  if (folderId !== undefined) note.folder = folderId || null;

  const updatedNote = await note.save();

  res.status(200).json({
    success: true,
    message: "Note updated successfully",
    data: updatedNote,
  });
});


// @desc    Delete a single note
// @route   DELETE /api/notes/:id
// @access  Private

const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!note) {
    res.status(404);
    throw new Error("Note not found");
  }

  // TODO: If note has a Cloudinary file, delete it here using filePublicId
  // (Handled in uploadController.js when Cloudinary is integrated)

  await note.deleteOne();

  res.status(200).json({
    success: true,
    message: "Note deleted successfully",
  });
});


// @desc    Bulk delete multiple notes
// @route   DELETE /api/notes/bulk-delete
// @access  Private

const bulkDeleteNotes = asyncHandler(async (req, res) => {
  const { noteIds } = req.body;

  if (!noteIds || !Array.isArray(noteIds) || noteIds.length === 0) {
    res.status(400);
    throw new Error("Please provide an array of note IDs to delete");
  }

  // Only delete notes that belong to the logged-in user
  const result = await Note.deleteMany({
    _id: { $in: noteIds },
    user: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: `${result.deletedCount} note(s) deleted`,
  });
});


// @desc    Search notes by keyword
// @route   GET /api/notes/search?q=keyword
// @access  Private

const searchNotes = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q) {
    res.status(400);
    throw new Error("Please provide a search query");
  }

  // Uses the text index defined in the Note model
  const notes = await Note.find({
    user: req.user._id,
    $text: { $search: q },
  }).populate("folder", "name");

  res.status(200).json({
    success: true,
    count: notes.length,
    data: notes,
  });
});


export {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  bulkDeleteNotes,
  searchNotes,
};