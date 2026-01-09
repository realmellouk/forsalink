// Bookmarks routes
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get user's bookmarked jobs
router.get('/:studentId', async (req, res) => {
    try {
        const [bookmarks] = await db.query(`
      SELECT 
        bookmarks.*,
        jobs.*,
        users.full_name as company_name
      FROM bookmarks
      JOIN jobs ON bookmarks.job_id = jobs.id
      JOIN users ON jobs.company_id = users.id
      WHERE bookmarks.student_id = ?
      ORDER BY bookmarks.created_at DESC
    `, [req.params.studentId]);

        res.json(bookmarks);
    } catch (error) {
        console.error('Get bookmarks error:', error);
        res.status(500).json({ error: 'Failed to fetch bookmarks' });
    }
});

// Add bookmark
router.post('/', async (req, res) => {
    try {
        const { student_id, job_id } = req.body;

        await db.query(
            'INSERT INTO bookmarks (student_id, job_id) VALUES (?, ?)',
            [student_id, job_id]
        );

        res.status(201).json({ message: 'Job bookmarked successfully' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Already bookmarked' });
        }
        console.error('Add bookmark error:', error);
        res.status(500).json({ error: 'Failed to bookmark job' });
    }
});

// Remove bookmark
router.delete('/:studentId/:jobId', async (req, res) => {
    try {
        await db.query(
            'DELETE FROM bookmarks WHERE student_id = ? AND job_id = ?',
            [req.params.studentId, req.params.jobId]
        );

        res.json({ message: 'Bookmark removed successfully' });
    } catch (error) {
        console.error('Remove bookmark error:', error);
        res.status(500).json({ error: 'Failed to remove bookmark' });
    }
});

// Check if job is bookmarked
router.get('/check/:studentId/:jobId', async (req, res) => {
    try {
        const [result] = await db.query(
            'SELECT id FROM bookmarks WHERE student_id = ? AND job_id = ?',
            [req.params.studentId, req.params.jobId]
        );

        res.json({ isBookmarked: result.length > 0 });
    } catch (error) {
        console.error('Check bookmark error:', error);
        res.status(500).json({ error: 'Failed to check bookmark' });
    }
});

module.exports = router;