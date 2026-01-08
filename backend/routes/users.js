// Users routes
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get user profile by ID
router.get('/:id', async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, full_name, email, role, bio, level_of_study, cv_link, interests, company_description, company_logo, created_at FROM users WHERE id = ?',
      [req.params.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user profile
router.put('/:id', async (req, res) => {
  try {
    const { full_name, bio, level_of_study, cv_link, interests, company_description } = req.body;

    await db.query(
      'UPDATE users SET full_name = ?, bio = ?, level_of_study = ?, cv_link = ?, interests = ?, company_description = ? WHERE id = ?',
      [full_name, bio, level_of_study, cv_link, interests, company_description, req.params.id]
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user's applications (for students)
router.get('/:id/applications', async (req, res) => {
  try {
    const [applications] = await db.query(`
      SELECT 
        applications.*,
        jobs.title,
        jobs.job_type,
        jobs.location,
        users.full_name as company_name
      FROM applications
      JOIN jobs ON applications.job_id = jobs.id
      JOIN users ON jobs.company_id = users.id
      WHERE applications.student_id = ?
      ORDER BY applications.applied_at DESC
    `, [req.params.id]);

    res.json(applications);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

module.exports = router;