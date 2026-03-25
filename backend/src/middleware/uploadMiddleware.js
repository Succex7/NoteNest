// ============================================================
// middleware/uploadMiddleware.js — Multer config for file uploads
// Stores files in memory before pushing to Cloudinary
// ============================================================

import multer from "multer";

// Use memory storage — files are held in buffer, not saved to disk
const storage = multer.memoryStorage();

// Filter allowed file types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(new Error("Unsupported file type. Allowed: JPEG, PNG, GIF, WEBP, PDF"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

export default upload;