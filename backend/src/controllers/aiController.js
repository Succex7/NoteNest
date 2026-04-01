// controllers/aiController.js — AI endpoint handlers

import Note from "../models/note.js";
import asyncHandler from "../utils/asyncHandler.js";
import axios from "axios";
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse');
import {
  summarizeNote,
  explainNote,
  askAboutNote,
  generalChat,
  summarizeFile,
} from "../services/aiService.js";

// @desc    Summarize a note
// @route   POST /api/ai/summarize/:noteId
// @access  Private

const summarize = asyncHandler(async (req, res) => {
  const note = await Note.findOne({
    _id: req.params.noteId,
    user: req.user._id,
  });

  if (!note) {
    res.status(404);
    throw new Error("Note not found");
  }

  if (!note.content || note.content.trim() === "") {
    res.status(400);
    throw new Error("Note has no content to summarize");
  }

  const summary = await summarizeNote(note.content);

  res.status(200).json({
    success: true,
    data: { summary },
  });
});


// @desc    Explain a note in simple terms
// @route   POST /api/ai/explain/:noteId
// @access  Private

const explain = asyncHandler(async (req, res) => {
  const note = await Note.findOne({
    _id: req.params.noteId,
    user: req.user._id,
  });

  if (!note) {
    res.status(404);
    throw new Error("Note not found");
  }

  if (!note.content || note.content.trim() === "") {
    res.status(400);
    throw new Error("Note has no content to explain");
  }

  const explanation = await explainNote(note.content);

  res.status(200).json({
    success: true,
    data: { explanation },
  });
});


// @desc    Ask a question based on a note
// @route   POST /api/ai/ask/:noteId
// @access  Private

const ask = asyncHandler(async (req, res) => {
  const { question } = req.body;

  if (!question) {
    res.status(400);
    throw new Error("Please provide a question");
  }

  const note = await Note.findOne({
    _id: req.params.noteId,
    user: req.user._id,
  });

  if (!note) {
    res.status(404);
    throw new Error("Note not found");
  }

  if (!note.content || note.content.trim() === "") {
    res.status(400);
    throw new Error("Note has no content to reference");
  }

  const answer = await askAboutNote(note.content, question);

  res.status(200).json({
    success: true,
    data: { answer },
  });
});


// @desc    General AI chat (no note context)
// @route   POST /api/ai/chat
// @access  Private

const chat = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message) {
    res.status(400);
    throw new Error("Please provide a message");
  }

  const response = await generalChat(message);

  res.status(200).json({
    success: true,
    data: { response },
  });
});


// @desc    Summarize a PDF file attached to a note
// @route   POST /api/ai/summarize-file/:noteId
// @access  Private

const summarizeFileContent = asyncHandler(async (req, res) => {
  const note = await Note.findOne({
    _id: req.params.noteId,
    user: req.user._id,
  });

  if (!note) {
    res.status(404);
    throw new Error("Note not found");
  }

  if (!note.fileUrl) {
    res.status(400);
    throw new Error("This note has no attached file");
  }

  if (note.fileType !== "pdf") {
    res.status(400);
    throw new Error("Only PDF files can be summarized. For images, extract text on the frontend first.");
  }

  // Download PDF from Cloudinary
  const response = await axios.get(note.fileUrl, {
    responseType: "arraybuffer",
  });

  // Extract text from PDF
  const pdfData = await pdfParse(response.data);
  const extractedText = pdfData.text;

  if (!extractedText || extractedText.trim() === "") {
    res.status(400);
    throw new Error("Could not extract text from this PDF");
  }

  const summary = await summarizeFile(extractedText);

  res.status(200).json({
    success: true,
    data: { summary },
  });
});


export { summarize, explain, ask, chat, summarizeFileContent };