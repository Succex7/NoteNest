// services/aiService.js — Google Gemini AI integration
// Handles all AI-related operations for notes

import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini client using the API key from .env
const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);

// Using Gemini 2.0 Flash — fast and capable
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });


/**
 * Summarizes a note's content.
 * @param {string} content
 * @returns {string} summary
 */
const summarizeNote = async (content) => {
  const result = await model.generateContent(
    `Summarize the following note clearly and concisely in 3-5 sentences:\n\n${content}`
  );

  return result.response.text();
};


/**
 * Explains or simplifies a note's content.
 * @param {string} content
 * @returns {string} explanation
 */
const explainNote = async (content) => {
  const result = await model.generateContent(
    `Explain the following note in simple, easy-to-understand language:\n\n${content}`
  );

  return result.response.text();
};


/**
 * Answers a user question based on the context of a note.
 * @param {string} content - The note content (context)
 * @param {string} question - The user's question
 * @returns {string} AI answer
 */
const askAboutNote = async (content, question) => {
  const result = await model.generateContent(
    `Using only the following note as context, answer the question below.\n\nNote:\n${content}\n\nQuestion: ${question}`
  );

  return result.response.text();
};


/**
 * General AI chat — no note context required.
 * @param {string} userMessage
 * @returns {string} AI response
 */
const generalChat = async (userMessage) => {
  const result = await model.generateContent(userMessage);

  return result.response.text();
};


export { summarizeNote, explainNote, askAboutNote, generalChat };