import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose'; // <--- New Import
import path from 'path';
import { fileURLToPath } from 'url';
import studentRoutes from './routes/studentRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js'; // <--- New Import

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Middleware
app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true
}));
app.use(express.json()); 

// --- 🔌 DATABASE CONNECTION ---
// Make sure you add MONGODB_URI to your .env file!


// 2. Debug: Print the URI (excluding the password) to verify it's loading
const dbUri = process.env.MONGODB_URI;
if (dbUri) {
  console.log("🔌 Attempting to connect to:", dbUri.split('@')[1]); 
} else {
  console.error("❌ MONGODB_URI is missing from .env!");
}

// 3. Connect
mongoose.connect(dbUri)
  .then(() => console.log("✅ THE VAULT IS OPEN! MongoDB Connected Successfully."))
  .catch(err => console.error("❌ MongoDB Connection Error:", err.message));

app.use('/student', studentRoutes);
app.use('/teacher', teacherRoutes); // <--- Wiring up the Boss Fight

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});