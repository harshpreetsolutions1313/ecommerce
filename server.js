require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const routes = require('./routes');

const app = express(); //instance

const allowedOrigins = [
  'http://localhost:5173', // local dev
  'https://frontend-ecom-six.vercel.app', // production
  'https://ecommerce-wheat-eight-41.vercel.app',
  'http://localhost:3000'
];

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow same-origin/tools with no Origin header (curl/Postman)
    if (!origin) {
      return callback(null, true);
    }

    const isExactAllowed = allowedOrigins.includes(origin);
    const isFrontendPreview = origin.startsWith('https://frontend-ecom-six') && origin.endsWith('.vercel.app');

    if (isExactAllowed || isFrontendPreview) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

app.use(express.json());

// Root endpoint for testing
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

// Health check with DB connection
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

// Database connection middleware
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

app.use((req, res, next) => {
  // Set CORS headers for 404 responses
  const origin = req.headers.origin;
  if (origin && (allowedOrigins.includes(origin) || (origin.startsWith('https://frontend-ecom-six') && origin.endsWith('.vercel.app')))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Set CORS headers even on errors
  const origin = req.headers.origin;
  if (origin && (allowedOrigins.includes(origin) || (origin.startsWith('https://frontend-ecom-six') && origin.endsWith('.vercel.app')))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Export for Vercel
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;