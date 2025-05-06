const nodemailer = require('nodemailer');

// Controller to handle contact form submissions
const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, location, message } = req.body;

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER,
      subject: 'New Contact Form Submission',
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nLocation: ${location}\nMessage: ${message}`,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'Contact form submitted and email sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit contact form or send email' });
  }
};

// Placeholder function for getFooterContact
const getFooterContact = (req, res) => {
  res.status(200).json({ message: 'Footer contact information not implemented yet' });
};

module.exports = { submitContactForm, getFooterContact };
