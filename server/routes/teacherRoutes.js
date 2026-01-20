import express from 'express';
import { Submission } from '../models/Submission.js';

const router = express.Router();

// 1. GET all submissions (The "Inbox")
router.get('/submissions', async (req, res) => {
    try {
        // Sort by newest first
        const submissions = await Submission.find().sort({ submittedAt: -1 });
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch submissions" });
    }
});

// 2. APPROVE a submission
router.post('/submissions/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        await Submission.findByIdAndUpdate(id, { status: 'APPROVED' });
        res.json({ success: true, message: "Approved" });
    } catch (error) {
        res.status(500).json({ message: "Update failed" });
    }
});

// 3. REJECT a submission
router.post('/submissions/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;
        await Submission.findByIdAndUpdate(id, { status: 'REJECTED' });
        res.json({ success: true, message: "Rejected" });
    } catch (error) {
        res.status(500).json({ message: "Update failed" });
    }
});

export default router;