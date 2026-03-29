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
    host: process.env.EMAIL_HOST,     // e.g. smtp.gmail.com — insert your SMTP host
    port: process.env.EMAIL_PORT,     // e.g. 587
    secure: false,                    // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,   // Insert your email address here
      pass: process.env.EMAIL_PASS,   // Insert your email password or app password here
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