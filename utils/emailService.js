const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendInactivityEmail = async (email, name) => {
  if (!process.env.EMAIL_USER) return; // Skip if not configured

  const mailOptions = {
    from: `Learning Tracker <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '📚 We miss you! Time to study',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">Hi ${name}! 👋</h2>
        <p>We noticed you haven't logged any study sessions in the past 3 days.</p>
        <p>Consistency is key to learning! Even 15 minutes a day can make a big difference.</p>
        <a href="${process.env.CLIENT_URL}" style="background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">
          Continue Learning →
        </a>
        <p style="color: #9ca3af; margin-top: 32px; font-size: 14px;">
          You're receiving this because you haven't been active recently.
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};
