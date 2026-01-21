// Authentication routes
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, role, bio, level_of_study, company_description } = req.body;

    // Check if email already exists
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Insert new user (Note: In production, hash the password!)
    const [result] = await db.query(
      'INSERT INTO users (full_name, email, password, role, bio, level_of_study, company_description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [full_name, email, password, role, bio || null, level_of_study || null, company_description || null]
    );

    // Create welcome notification
    await db.query(
      'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
      [result.insertId, 'Welcome to ForsaLink! Start exploring opportunities.']
    );

    res.status(201).json({
      message: 'Registration successful',
      userId: result.insertId,
      role: role
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    // Find user by email
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    console.log(`Login attempt for '${cleanEmail}'`);

    if (users.length === 0) {
      console.log('User not found');
      return res.status(401).json({ error: 'User with this email not found' });
    }

    const user = users[0];
    console.log(`User found: ${user.email}, Role: ${user.role}`);

    // Check password (Note: In production, use bcrypt to compare hashed passwords!)
    if (user.password !== cleanPassword) {
      console.log(`Password mismatch. Input: '${cleanPassword}', Stored: '${user.password}'`);
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Return user data (exclude password)
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Change password
router.put('/change-password', async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;

    // Validate input
    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Get user
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    // Verify old password
    if (user.password !== oldPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password
    await db.query('UPDATE users SET password = ? WHERE id = ?', [newPassword, userId]);

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = router;