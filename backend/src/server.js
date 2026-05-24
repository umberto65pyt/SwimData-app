const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const athleteRoutes = require('./routes/athletes');
const timeRoutes = require('./routes/times');
const benchmarkRoutes = require('./routes/benchmarks');
const performanceRoutes = require('./routes/performance');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Routes
app.use('/api/athletes', athleteRoutes);
app.use('/api/times', timeRoutes);
app.use('/api/benchmarks', benchmarkRoutes);
app.use('/api/performance', performanceRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`SwimData API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
