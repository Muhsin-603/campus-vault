import express from 'express';
import { Submission } from '../models/Submission.js';
import { Notification } from '../models/Notification.js';

const router = express.Router();

// 1. GET SUBMISSIONS (With Filter Support)
// This handles requests to '/submissions?status=PENDING'
router.get('/submissions', async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        
        // If the dashboard asks for "PENDING", filter the DB
        if (status) {
            query.status = status;
        }

        // Sort by newest first
        const submissions = await Submission.find(query).sort({ submittedAt: -1 });
        res.json({ success: true, data: submissions });
    } catch (error) {
        console.error("Error fetching submissions:", error);
        res.status(500).json({ message: "Failed to fetch submissions" });
    }
});

// 2. UNIFIED VERIFY ROUTE (Handles both Approve & Reject)
router.post('/verify', async (req, res) => {
    try {
        const { id, status, adminComment } = req.body;

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ message: "Invalid Status" });
        }

        const submission = await Submission.findByIdAndUpdate(
            id, 
            { status: status }, // Update the status
            { new: true }
        );

        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }
        
        // 🔔 Notify Student
        const notifMessage = status === 'APPROVED' 
            ? `🎉 Approved: Your submission for "${submission.eventName}" has been verified!`
            : `⚠️ Action Required: Your submission for "${submission.eventName}" was rejected. Reason: ${adminComment}`;

        await Notification.create({
            userId: submission.studentId,
            message: notifMessage,
            type: status === 'APPROVED' ? 'success' : 'error'
        });

        res.json({ success: true, message: `Submission ${status}` });

    } catch (error) {
        console.error("Verify Error:", error);
        res.status(500).json({ message: "Verification Failed" });
    }
});

export default router;