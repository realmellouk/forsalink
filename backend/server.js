// ForsaLink Backend Server
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bookmarksRoutes = require('./routes/bookmarks');

// Import routes
const authRoutes = require('./routes/auth');
const jobsRoutes = require('./routes/jobs');
const usersRoutes = require('./routes/users');
const notificationsRoutes = require('./routes/notifications');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/bookmarks', bookmarksRoutes);
// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'ForsaLink API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
