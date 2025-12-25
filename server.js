require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const routes = require('./routes');

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [
        'https://frontend-ecom-six.vercel.app',
        'https://cryptoecommercebackend.vercel.app'
      ]
    : ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
};

// Apply CORS - this automatically handles OPTIONS preflight
app.use(cors(corsOptions));

app.use(express.json());

// Connect to DB once at startup
let dbConnected = false;
connectDB()
  .then(() => {
    dbConnected = true;
    console.log('Database connected');
  })
  .catch(err => {
    console.error('Initial DB connection failed:', err);
  });

// Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Backend API is running',
    endpoints: ['/health', '/api/products', '/api/orders', '/api/contract'],
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', async (req, res) => {
  try {
    if (!dbConnected) await connectDB();
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// const PORT = process.env.PORT || 5000;
// if (process.env.NODE_ENV !== 'production') {
//   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// }

module.exports = app;