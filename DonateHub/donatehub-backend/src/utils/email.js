const nodemailer = require('nodemailer');

// Create a transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Email templates
const emailTemplates = {
  welcome: (name) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e53935;">Welcome to DonateHub, ${name}! 👋</h2>
      <p>We're excited to have you join our community of givers and receivers.</p>
      <p>Start making a difference today by:</p>
      <ul>
        <li>Donating items you no longer need</li>
        <li>Sharing your knowledge and skills</li>
        <li>Finding items you need from others</li>
        <li>Connecting with your local community</li>
      </ul>
      <p>If you have any questions, feel free to reach out to our support team.</p>
      <p>Best regards,<br>The DonateHub Team</p>
    </div>
  `,

  passwordReset: (name, token) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e53935;">Password Reset Request</h2>
      <p>Hello ${name},</p>
      <p>We received a request to reset your password. Click the link below to set a new password:</p>
      <p>
        <a href="${process.env.CLIENT_URL}/reset-password?token=${token}" 
           style="background-color: #e53935; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Reset Password
        </a>
      </p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>The DonateHub Team</p>
    </div>
  `,

  donationApproved: (name, donationTitle) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4caf50;">Donation Approved! 🎉</h2>
      <p>Hello ${name},</p>
      <p>Your donation "${donationTitle}" has been approved and is now visible to the community.</p>
      <p>You'll be notified when someone requests your donation.</p>
      <p>Thank you for making a difference!</p>
      <p>Best regards,<br>The DonateHub Team</p>
    </div>
  `,

  donationRequested: (name, donorName, donationTitle) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2196f3;">New Donation Request</h2>
      <p>Hello ${name},</p>
      <p>${donorName} has requested your donation: "${donationTitle}"</p>
      <p>Please log in to your account to review and respond to this request.</p>
      <p>Best regards,<br>The DonateHub Team</p>
    </div>
  `,
};

// Send email function
const sendEmail = async ({ email, subject, html }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = {
  transporter,
  emailTemplates,
  sendEmail,
};