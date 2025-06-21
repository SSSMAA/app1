// backend/models/Registration.js
const mongoose = require('mongoose');

/**
 * Mongoose schema for course registrations.
 * Defines the structure and validation rules for registration documents stored in MongoDB.
 */
const registrationSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'], // Field is required, with a custom error message.
    trim: true, // Trims whitespace from the beginning and end of the string.
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [1, 'Age must be a positive number'], // Minimum value allowed, with a custom error message.
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    // Basic regex validation for phone numbers (allows digits, spaces, +, -).
    // More robust validation might be needed for specific country formats.
    match: [/^[0-9\s+-]+$/, 'Please fill a valid phone number'],
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'], // The course or subject the student is registering for.
    trim: true,
  },
  registrationDate: {
    type: Date,
    default: Date.now, // Automatically sets to the current date and time upon document creation.
  },
});

// Create and export the Mongoose model.
// 'Registration' will be the name of the collection in MongoDB (pluralized to 'registrations').
module.exports = mongoose.model('Registration', registrationSchema);
