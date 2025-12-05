// config/db.js - UPDATED VERSION
const mongoose = require('mongoose');

let isConnected = false;
let connectionPromise = null;

const connectDB = async () => {
  // Return existing connection if available
  if (isConnected) {
    console.log('Using existing database connection');
    return mongoose.connection;
  }

  // Prevent multiple connection attempts
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferCommands: false, // CRITICAL for serverless
    maxPoolSize: 10,
    retryWrites: true,
    w: 'majority'
  }).then((conn) => {
    isConnected = true;
    console.log('MongoDB connected successfully');
    return conn;
  }).catch((error) => {
    console.error('MongoDB connection error:', error);
    connectionPromise = null;
    throw error;
  });

  return connectionPromise;
};

// Routes
// app.use('/api', routes);

// ✅ ADD: 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({ message: 'Route not found' });
// });

// Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(err.status || 500).json({
//     message: err.message || 'Internal Server Error',
//     ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
//   });
// });

// ✅ REMOVE: Database connection from top-level (moved to middleware)
// connectDB(); // DELETE THIS LINE

// ✅ KEEP: Export for Vercel
// module.exports = app;

module.exports = connectDB;