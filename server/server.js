import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import studentRoutes from './routes/studentRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
// server/server.js
app.use(cors({
  origin: 'http://localhost:3000', // Changed from 5173 to 3000 to match vite.config.js
  credentials: true
}));
app.use(express.json()); // To parse JSON bodies from your axiosClient
app.use('/student', studentRoutes);

// ---------------------------------------------------------
// 🚦 ROUTES (Matching your endpoints.js)
// ---------------------------------------------------------

// Health Check (To test if connection is working)
app.get('/', (req, res) => {
  res.json({ message: 'Campus Vault Server is Running! 🚀' });
});

// Import Routes (We will create these next)
// import authRoutes from './routes/authRoutes.js';
// import studentRoutes from './routes/studentRoutes.js';

// app.use('/auth', authRoutes);       <-- Matches AUTH_ENDPOINTS in client
// app.use('/student', studentRoutes); <-- Matches STUDENT_ENDPOINTS in client

// ---------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});