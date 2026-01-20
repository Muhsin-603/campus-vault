import express from 'express';
import { upload } from '../middleware/uploadMiddleware.js';
import { analyzeCertificate } from '../controllers/uploadController.js';
import { Submission } from '../models/Submission.js'; // <--- Import the model
import { Notification } from '../models/Notification.js'; // 👈 IMPORT
import { sendEmail, emailTemplates } from '../services/emailService.js';
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
        await Notification.create({
            userId: req.body.studentId,
            message: `Certificate for ${req.body.eventName} submitted successfully.`,
            type: 'success'
        });
        await sendEmail(
            'your_verified_email@example.com', // ⚠️ REPLACE THIS with the email you used for Resend
            `Submission Confirmation: ${req.body.eventName}`,
            emailTemplates.submissionReceived(
                req.body.studentName,
                req.body.eventName,
                req.body.predictedPoints,
                req.body.fraudAnalysis?.riskLevel || "LOW"
            )
        );
        res.status(201).json({ success: true, message: "Vaulted & Notified!" });

        await newSubmission.save();
        console.log("💾 Saved to MongoDB with ID:", newSubmission._id);

        res.status(201).json({ 
            success: true, 
            message: "Certificate securely vaulted!",
            id: newSubmission._id 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Save Failed" });
        console.error("❌ Save Error:", error);
        res.status(500).json({ success: false, message: "Database Write Failed" });
    }
});

router.get('/dashboard', (req, res) => {
    res.json({ message: "Student Dashboard Data" }); 
});

export default router;