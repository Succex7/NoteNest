// ============================================================
// controllers/uploadController.js — Cloudinary file upload
// ============================================================

import cloudinary from "../config/cloudinary.js";
import Note from "../models/note.js";
import asyncHandler from "../utils/asyncHandler.js";


// ─────────────────────────────────────────
// @desc    Upload a file (image/PDF) to Cloudinary and link to a note
// @route   POST /api/upload/:noteId
// @access  Private
// ─────────────────────────────────────────
const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No file provided");
  }

  const note = await Note.findOne({
    _id: req.params.noteId,
    user: req.user._id,
  });

  if (!note) {
    res.status(404);
    throw new Error("Note not found");
  }

  // Determine resource type
  const isImage = req.file.mimetype.startsWith("image/");
  const resourceType = isImage ? "image" : "raw";

  // Upload to Cloudinary from buffer (using multer's memoryStorage)
  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `notenest/${req.user._id}`,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(req.file.buffer);
  });

  // Attach Cloudinary URL and public ID to the note
  note.fileUrl = uploadResult.secure_url;
  note.filePublicId = uploadResult.public_id;
  note.fileType = isImage ? "image" : req.file.mimetype === "application/pdf" ? "pdf" : "other";

  await note.save();

  res.status(200).json({
    success: true,
    message: "File uploaded successfully",
    data: {
      fileUrl: note.fileUrl,
      fileType: note.fileType,
    },
  });
});


// ─────────────────────────────────────────
// @desc    Delete a file from Cloudinary and unlink from note
// @route   DELETE /api/upload/:noteId
// @access  Private
// ─────────────────────────────────────────
const deleteFile = asyncHandler(async (req, res) => {
  const note = await Note.findOne({
    _id: req.params.noteId,
    user: req.user._id,
  });

  if (!note) {
    res.status(404);
    throw new Error("Note not found");
  }

  if (!note.filePublicId) {
    res.status(400);
    throw new Error("This note has no attached file");
  }

  // Delete from Cloudinary
  await cloudinary.uploader.destroy(note.filePublicId, {
    resource_type: note.fileType === "image" ? "image" : "raw",
  });

  // Clear file fields on the note
  note.fileUrl = null;
  note.filePublicId = null;
  note.fileType = null;

  await note.save();

  res.status(200).json({
    success: true,
    message: "File deleted successfully",
  });
});


export { uploadFile, deleteFile };