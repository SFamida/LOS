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
  require('./db/connection').getConnection()
    .then(async (pool) => {
      // Auto-migrate: add sub_status column if it doesn't exist
      try {
        const req = pool.request();
        await req.query(`
          IF NOT EXISTS (
            SELECT * FROM sys.columns 
            WHERE object_id = OBJECT_ID('applications') AND name = 'sub_status'
          )
          BEGIN
            ALTER TABLE applications ADD sub_status VARCHAR(100) DEFAULT 'pending with lender';
            UPDATE applications SET sub_status = 'pending with lender' WHERE status = 'pending' AND sub_status IS NULL;
          END
        `);
        console.log('[DB] sub_status column ready');
      } catch (err) {
        console.warn('[DB] sub_status migration skipped:', err.message);
      }
    })
    .catch(err => console.error('[DB] Init error:', err.message));
});
