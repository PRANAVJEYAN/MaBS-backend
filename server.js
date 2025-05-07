const express = require('express');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const cors = require('cors');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());

// Update CORS settings to allow only production frontend domain
const allowedOrigins = [
  'http://localhost:5173', // Development
  'https://mabs-eight.vercel.app/', // Production
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../public')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../public', 'index.html'));
  });
}

// Email sending function
const sendEmail = async (formData, res) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER,
      subject: 'New Form Submission',
      text: `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nLocation: ${formData.location || formData.country}\nMessage: ${formData.message}`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);

    // Provide detailed error messages for debugging
    if (error.response) {
      res.status(500).json({ error: `Failed to send email: ${error.response}` });
    } else if (error.code === 'EAUTH') {
      res.status(500).json({ error: 'Authentication failed. Please check email credentials.' });
    } else {
      res.status(500).json({ error: 'An unexpected error occurred while sending the email.' });
    }
  }
};

// Routes
app.post('/api/send-mail', (req, res) => {
  sendEmail(req.body, res);
});

// Add a test route to verify email service
app.get('/api/test-mail', async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER,
      subject: 'Test Email',
      text: 'This is a test email to verify the email service.',
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Test email sent successfully!' });
  } catch (error) {
    console.error('Error sending test email:', error);

    if (error.response) {
      res.status(500).json({ error: `Failed to send test email: ${error.response}` });
    } else if (error.code === 'EAUTH') {
      res.status(500).json({ error: 'Authentication failed. Please check email credentials.' });
    } else {
      res.status(500).json({ error: 'An unexpected error occurred while sending the test email.' });
    }
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
