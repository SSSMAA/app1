// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const registrationRoutes = require('./routes/registrationRoutes'); // Import registration API routes

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 5000; // Default to 5000 if PORT not in .env

// Core Middleware
// Enable Cross-Origin Resource Sharing (CORS) for all routes
// This allows the frontend (on a different port) to make requests to this backend.
app.use(cors());
// Parse incoming requests with JSON payloads.
// This makes `req.body` available for JSON requests.
app.use(express.json());

// MongoDB Connection Setup
const mongoURI = process.env.MONGO_URI;

// Connect to MongoDB using Mongoose.
// Options like useNewUrlParser, useUnifiedTopology are deprecated in Mongoose 6+
// and are no longer needed.
mongoose.connect(mongoURI)
.then(() => console.log('MongoDB Connected Successfully.'))
.catch(err => {
  console.error('MongoDB Connection Error:', err.message);
  // Optional: Exit process if DB connection is critical for the application to run.
  // process.exit(1);
});

// Basic Test Route
// A simple GET route to confirm the server is running.
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

// API Routes
// Mount the registration-related routes under the '/api/register' path.
app.use('/api/register', registrationRoutes);

// Start the Express server
// Listen for incoming requests on the specified port.
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
