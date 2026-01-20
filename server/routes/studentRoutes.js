import express from 'express';
import { upload } from '../middleware/uploadMiddleware.js';
import { analyzeCertificate } from '../controllers/uploadController.js';
import { Submission } from '../models/Submission.js';
import { Notification } from '../models/Notification.js';
import { sendEmail, emailTemplates } from '../services/emailService.js';

const router = express.Router();

router.post('/upload', upload.single('file'), analyzeCertificate);

// 👇 THE FIXED SUBMISSION HANDLER
router.post('/submit', async (req, res) => {
    console.log("📝 Submission Received:", req.body);
    
    try {
        const newSubmission = new Submission({
            studentId: req.body.studentId || "unknown_student",
            studentName: req.body.studentName,
            eventName: req.body.eventName,
            eventDate: req.body.eventDate,
            predictedPoints: req.body.predictedPoints,
            fraudAnalysis: req.body.fraudAnalysis
        });

        // 1. Save to Database FIRST
        await newSubmission.save();
        console.log("💾 Saved to MongoDB with ID:", newSubmission._id);

        // 2. Create Notification
        try {
            await Notification.create({
                userId: req.body.studentId,
                message: `Certificate for ${req.body.eventName} submitted successfully.`,
                type: 'success'
            });
        } catch (notifError) {
            console.error("⚠️ Notification Error (Non-fatal):", notifError.message);
        }

        // 3. Send Email (Non-blocking)
        sendEmail(
            'your_verified_email@example.com', // Remember to update this!
            `Submission Confirmation: ${req.body.eventName}`,
            emailTemplates.submissionReceived(
                req.body.studentName,
                req.body.eventName,
                req.body.predictedPoints,
                req.body.fraudAnalysis?.riskLevel || "LOW"
            )
        ).catch(err => console.error("📧 Email Error:", err));

        // 4. Send ONE Final Response
        res.status(201).json({ 
            success: true, 
            message: "Vaulted & Notified!",
            id: newSubmission._id 
        });

    } catch (error) {
        console.error("❌ Critical Submit Error:", error);
        // Ensure we only send one error response
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: "Database Write Failed" });
        }
    }
});

router.get('/dashboard', (req, res) => {
    res.json({ message: "Student Dashboard Data" }); 
});

export default router;