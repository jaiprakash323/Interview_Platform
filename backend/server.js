const express = require('express');
const cors = require('cors');
const initDb = require('./db');

// Import routes
const panelistRoutes = require('./routes/panelistRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const matchRoutes = require('./routes/matchRoutes');
const interviewRoutes = require('./routes/interviewRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initDb();

// Routes
app.use('/api/panelists', panelistRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/interviews', interviewRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
