import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import studentRoutes from './routes/studentRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🎬 FIX: Update CORS to match Vite's default port (5173)
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Allow both just in case
  credentials: true
}));

app.use(express.json()); 

// Database Connection
const dbUri = process.env.MONGODB_URI;
if (dbUri) {
  mongoose.connect(dbUri)
    .then(() => console.log("✅ THE VAULT IS OPEN! MongoDB Connected."))
    .catch(err => console.error("❌ DB Error:", err.message));
}

app.use('/student', studentRoutes);
app.use('/teacher', teacherRoutes);
app.use('/notifications', notificationRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});