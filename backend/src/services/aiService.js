import OpenAI from "openai";
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pdfParseModule = require('pdf-parse/lib/pdf-parse.js')
const pdfParse = pdfParseModule.default || pdfParseModule

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
})

const summarizeNote = async (content) => {
  const result = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: `Summarize this:\n\n${content}` }],
  });
  return result.choices[0].message.content;
};

const explainNote = async (content) => {
  const result = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: `Explain this in simple terms:\n\n${content}` }],
  });
  return result.choices[0].message.content;
};

const askAboutNote = async (content, question) => {
  const result = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: `Note:\n${content}\n\nQuestion: ${question}` }],
  });
  return result.choices[0].message.content;
};

const generalChat = async (userMessage) => {
  const result = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: userMessage }],
  });
  return result.choices[0].message.content;
};

// Summarize from file content (PDF text)
const summarizeFile = async (extractedText) => {
  const result = await client.chat.completions.create({
    model: MODEL,
    messages: [{ 
      role: "user", 
      content: `Summarize the following document clearly and concisely:\n\n${extractedText}` 
    }],
  });
  return result.choices[0].message.content;
};

export { summarizeNote, explainNote, askAboutNote, generalChat, summarizeFile };