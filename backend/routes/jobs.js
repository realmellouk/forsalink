// Jobs routes
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all active jobs (with company info)
router.get('/', async (req, res) => {
  try {
    const [jobs] = await db.query(`
      SELECT 
        jobs.*, 
        users.full_name as company_name,
        users.company_logo
      FROM jobs 
      JOIN users ON jobs.company_id = users.id 
      WHERE jobs.status = 'active'
      ORDER BY jobs.created_at DESC
    `);

    res.json(jobs);
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Get single job by ID
router.get('/:id', async (req, res) => {
  try {
    const [jobs] = await db.query(`
      SELECT 
        jobs.*, 
        users.full_name as company_name,
        users.email as company_email,
        users.company_description,
        users.company_logo
      FROM jobs 
      JOIN users ON jobs.company_id = users.id 
      WHERE jobs.id = ?
    `, [req.params.id]);

    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(jobs[0]);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// Get jobs by company
router.get('/company/:companyId', async (req, res) => {
  try {
    const [jobs] = await db.query(
      'SELECT * FROM jobs WHERE company_id = ? ORDER BY created_at DESC',
      [req.params.companyId]
    );

    res.json(jobs);
  } catch (error) {
    console.error('Get company jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Create new job (company only)
router.post('/', async (req, res) => {
  try {
    const { title, description, job_type, location, salary, requirements, company_id } = req.body;

    const [result] = await db.query(
      'INSERT INTO jobs (title, description, job_type, location, salary, requirements, company_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, job_type, location, salary, requirements, company_id]
    );

    res.status(201).json({
      message: 'Job created successfully',
      jobId: result.insertId
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Update job
router.put('/:id', async (req, res) => {
  try {
    const { title, description, job_type, location, salary, requirements, status } = req.body;

    await db.query(
      'UPDATE jobs SET title = ?, description = ?, job_type = ?, location = ?, salary = ?, requirements = ?, status = ? WHERE id = ?',
      [title, description, job_type, location, salary, requirements, status, req.params.id]
    );

    res.json({ message: 'Job updated successfully' });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// Delete job
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM jobs WHERE id = ?', [req.params.id]);
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

// Apply to job
router.post('/:id/apply', async (req, res) => {
  try {
    const { student_id } = req.body;
    const job_id = req.params.id;

    // Check if already applied
    const [existing] = await db.query(
      'SELECT * FROM applications WHERE job_id = ? AND student_id = ?',
      [job_id, student_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Already applied to this job' });
    }

    // Create application
    await db.query(
      'INSERT INTO applications (job_id, student_id) VALUES (?, ?)',
      [job_id, student_id]
    );

    // Get job and company info for notification
    const [jobs] = await db.query(`
      SELECT jobs.title, jobs.company_id, users.full_name as student_name
      FROM jobs 
      JOIN users ON users.id = ?
      WHERE jobs.id = ?
    `, [student_id, job_id]);

    if (jobs.length > 0) {
      // Notify company
      await db.query(
        'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
        [jobs[0].company_id, `${jobs[0].student_name} applied to "${jobs[0].title}"`]
      );
    }

    res.status(201).json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Apply job error:', error);
    res.status(500).json({ error: 'Failed to apply' });
  }
});

module.exports = router;