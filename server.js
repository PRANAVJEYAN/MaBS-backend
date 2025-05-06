const express = require('express');
const dotenv = require('dotenv');
const { submitContactForm } = require('./controllers/contactController');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());

// Routes
app.post('/api/contact', submitContactForm);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});