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
    useNewUrlParser: true,
    useUnifiedTopology: true,
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

// Connection event handlers
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
  isConnected = true;
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
  isConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
  isConnected = false;
});

// Handle process termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

module.exports = connectDB;