// backend/routes/registrationRoutes.js
const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration'); // Import the Mongoose model for registrations

// This router handles all routes prefixed with '/api/register' (defined in server.js)

/**
 * @route   POST /
 * @desc    Register a new student for a course.
 *          This is the actual endpoint hit when requests are made to '/api/register'.
 * @access  Public (no authentication required for this endpoint)
 */
router.post('/', async (req, res) => {
  // Destructure required fields from the request body
  const { fullName, age, phone, subject } = req.body;

  // Basic server-side validation: Check if all required fields are present.
  // More complex validation (e.g., data types, formats) is handled by Mongoose schema validation.
  if (!fullName || !age || !phone || !subject) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    // Create a new registration instance using the Mongoose model
    const newRegistration = new Registration({
      fullName,
      age,
      phone,
      subject,
      // registrationDate is set by default in the schema
    });

    // Attempt to save the new registration to the database
    const registration = await newRegistration.save();

    // Respond with a 201 (Created) status and a success message, including the ID of the new registration.
    res.status(201).json({
      msg: 'Registration successful!',
      registrationId: registration.id
    });

  } catch (err) {
    // Log the error on the server for debugging purposes
    console.error('Error saving registration:', err.message);

    // Handle Mongoose validation errors specifically
    // These errors occur if data does not conform to the schema (e.g., required fields missing, type mismatches).
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ msg: 'Validation Error', errors: messages });
    }

    // For other types of errors (e.g., database connection issues, unexpected server problems),
    // respond with a generic 500 (Server Error) status.
    res.status(500).send('Server Error');
  }
});

module.exports = router; // Export the router to be used in server.js
