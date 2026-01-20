import express from 'express';
import { Notification } from '../models/Notification.js';

const router = express.Router();

router.get('/:userId', async (req, res) => {
    try {
        console.log(req.params.userId)
        const notifications = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: "Fetch failed" });
    }
});

export default router;