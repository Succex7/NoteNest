// server.js — Entry point for the NoteNest backend
// Boots up the Express app and connects to MongoDB

import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start the server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`NoteNest server running on port ${PORT}`);
  });
});