require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const routes = require('./routes');

const app = express();

// Configure CORS - TEMPORARILY ALLOW ALL for debugging
app.use(cors({
    origin: '*', // Change back later to specific origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ✅ ADD: Root endpoint for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend API is running',
    endpoints: [
      '/health',
      '/api/products',
      '/api/orders',
      '/api/contract'
    ],
    timestamp: new Date().toISOString()
  });
});

// ✅ MODIFY: Health check with DB connection
app.get('/health', async (req, res) => {
  try {
    await connectDB();
    res.status(200).json({ 
      status: 'OK', 
      database: 'Connected',
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'Error', 
      database: 'Disconnected',
      error: error.message 
    });
  }
});

// ✅ ADD: Database connection middleware before routes
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ 
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Routes
app.use('/api', routes);

// ✅ ADD: 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({ message: 'Route not found' });
// });

app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ✅ REMOVE: Database connection from top-level (moved to middleware)
// connectDB(); // DELETE THIS LINE

// ✅ KEEP: Export for Vercel
module.exports = app;