const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Update application status (Accept/Reject)
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const appId = req.params.id;

        if (!['accepted', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        // 1. Update status
        await db.query(
            'UPDATE applications SET status = ? WHERE id = ?',
            [status, appId]
        );

        // 2. Get application info to notify student
        const [apps] = await db.query(`
      SELECT 
        applications.student_id,
        jobs.title,
        users.full_name as company_name
      FROM applications
      JOIN jobs ON applications.job_id = jobs.id
      JOIN users ON jobs.company_id = users.id
      WHERE applications.id = ?
    `, [appId]);

        if (apps.length > 0) {
            const { student_id, title, company_name } = apps[0];
            const message = status === 'accepted'
                ? `Congratulations! 🎉 Your application for "${title}" has been accepted by ${company_name}.`
                : `Update on your application: "${title}" status has been changed to ${status}.`;

            await db.query(
                'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
                [student_id, message]
            );
        }

        res.json({ message: 'Application status updated and student notified' });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

module.exports = router;
