// utils/sendEmail.js — Email utility using Nodemailer
// Used for password reset emails

import nodemailer from "nodemailer";

/**
 * Sends an email using the configured SMTP service.
 * @param {Object} options - { to, subject, html }
 */
const sendEmail = async ({ to, subject, html }) => {
  // Create a transporter using your email service credentials from .env
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,     
    port: process.env.EMAIL_PORT,     
    secure: false,                    
    auth: {
      user: process.env.EMAIL_USER,   
      pass: process.env.EMAIL_PASS,   
    },
  });

  const mailOptions = {
    from: `"NoteNest" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;