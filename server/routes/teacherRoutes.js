import express from 'express';
import { Submission } from '../models/Submission.js'; // Ensure you have this model!
import { Notification } from '../models/Notification.js';

const router = express.Router();

// 1. GET ALL SUBMISSIONS (The Inbox)
router.get('/submissions', async (req, res) => {
    try {
        // Sort by newest first
        const submissions = await Submission.find().sort({ submittedAt: -1 });
        res.json(submissions);
    } catch (error) {
        console.error("Error fetching submissions:", error);
        res.status(500).json({ message: "Failed to fetch submissions" });
    }
});

// 2. APPROVE PROTOCOL
router.post('/submissions/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        const submission = await Submission.findByIdAndUpdate(id, { status: 'APPROVED' }, { new: true });
        
        // 🔔 Notify Student
        await Notification.create({
            userId: submission.studentId, // Ensure your submission model has studentId!
            message: `🎉 Great news! Your points for ${submission.eventName} have been APPROVED!`,
            type: 'success'
        });

        res.json({ success: true, message: "Approved & Notified" });
    } catch (error) {
        res.status(500).json({ message: "Approval Failed" });
    }
})

// 3. REJECT PROTOCOL
router.post('/submissions/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;
        await Submission.findByIdAndUpdate(id, { status: 'REJECTED' });
        res.json({ success: true, message: "Submission Rejected" });
    } catch (error) {
        res.status(500).json({ message: "Rejection Failed" });
    }
});

export default router;