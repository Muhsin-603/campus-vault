import express from 'express';
import { upload } from '../middleware/uploadMiddleware.js';
import { analyzeCertificate } from '../controllers/uploadController.js';

const router = express.Router();

// Route: POST /api/student/upload
// 1. 'upload.single' processes the file
// 2. 'analyzeCertificate' sends it to Gemini
router.post('/upload', upload.single('file'), analyzeCertificate);

// Placeholder for other routes
router.get('/dashboard', (req, res) => {
    res.json({ message: "Student Dashboard Data" }); 
});

export default router;