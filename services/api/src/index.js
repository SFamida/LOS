const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialize database connection
const db = require('./db/connection');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
const applicationsRouter = require('./routes/applications');
const usersRouter = require('./routes/users');

app.use('/applications', applicationsRouter);
app.use('/users', usersRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error: ' + err.message,
  });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
  require('./db/connection').getConnection().catch(err => console.error('[DB] Init error:', err.message));
});
