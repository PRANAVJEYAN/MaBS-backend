import express from 'express';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.use(express.json());

// Define allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://mabs-eight.vercel.app',
  'https://mabs-beta.vercel.app',
];

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      // Allow requests with no origin (like mobile apps or curl)
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error(`Blocked by CORS: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  }
}));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
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
      text: `Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Location: ${formData.location || formData.country}
Message: ${formData.message}`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    if (error.code === 'EAUTH') {
      res.status(500).json({ error: 'Authentication failed. Check your email credentials.' });
    } else {
      res.status(500).json({ error: 'Error sending email.' });
    }
  }
};

// API Route to send email
app.post('/api/send-mail', (req, res) => {
  sendEmail(req.body, res);
});

// API Route to test email
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
      text: 'This is a test email from the MaBS backend.',
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Test email sent successfully!' });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ error: 'Error sending test email.' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
