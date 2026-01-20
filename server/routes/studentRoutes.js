import express from 'express';
import { upload } from '../middleware/uploadMiddleware.js';
import { analyzeCertificate } from '../controllers/uploadController.js';
import { Submission } from '../models/Submission.js'; // <--- Import the model

const router = express.Router();

router.post('/upload', upload.single('file'), analyzeCertificate);

// 👇 THE REAL SUBMISSION HANDLER
router.post('/submit', async (req, res) => {
    console.log("📝 Submission Received:", req.body);
    
    try {
        // Create a new record in MongoDB
        const newSubmission = new Submission({
            studentId: req.body.studentId || "unknown_student", // Fallback for now
            studentName: req.body.studentName,
            eventName: req.body.eventName,
            eventDate: req.body.eventDate,
            predictedPoints: req.body.predictedPoints,
            fraudAnalysis: req.body.fraudAnalysis
        });

        await newSubmission.save();
        console.log("💾 Saved to MongoDB with ID:", newSubmission._id);

        res.status(201).json({ 
            success: true, 
            message: "Certificate securely vaulted!",
            id: newSubmission._id 
        });

    } catch (error) {
        console.error("❌ Save Error:", error);
        res.status(500).json({ success: false, message: "Database Write Failed" });
    }
});

router.get('/dashboard', (req, res) => {
    res.json({ message: "Student Dashboard Data" }); 
});

export default router;