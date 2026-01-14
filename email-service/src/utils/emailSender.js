const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// Configure SendGrid with API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send an email using SendGrid
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text body
 * @param {string} html - HTML body (optional, falls back to text)
 */
const sendEmail = async (to, subject, text, html) => {
  const msg = {
    to,
    from: process.env.FROM_EMAIL, // Must match a verified sender in SendGrid
    subject,
    text,
    html: html || text, // Fallback to text if HTML not provided
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    if (error.response) {
      // Log detailed SendGrid error response for debugging
      console.error(error.response.body);
    }
  }
};

module.exports = { sendEmail };
