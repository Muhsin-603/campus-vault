import express from 'express';
import { upload } from '../middleware/uploadMiddleware.js';
import { analyzeCertificate } from '../controllers/uploadController.js';

const router = express.Router();

router.post('/upload', upload.single('file'), analyzeCertificate);

// 👇 ADD THIS NEW ROUTE
router.post('/submit', (req, res) => {
    console.log("📝 Submission Received:", req.body);
    // TODO: Save to Database (MongoDB/Postgres)
    // For now, we simulate success
    res.status(200).json({ success: true, message: "Certificate saved to vault!" });
});

router.get('/dashboard', (req, res) => {
    res.json({ message: "Student Dashboard Data" }); 
});

export default router;