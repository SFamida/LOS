const nodemailer = require('nodemailer');

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

const sendCustomerApplicationLink = async (customerEmail, customerName, applicationLink) => {
  try {
    console.log(`[EMAIL] Sending application link to: ${customerEmail}`);

    const transporter = createTransporter();

    const info = await transporter.sendMail({
      from: `"LOS Platform" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: customerEmail,
      subject: 'Your Loan Application is Ready to Complete',
      html: `
        <h2>Complete Your Loan Application</h2>
        <p>Hi ${customerName || 'there'},</p>
        <p>Your merchant has initiated a loan application for you. Click the button below to complete it:</p>
        <div style="margin: 30px 0;">
          <a href="${applicationLink}"
             style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
            Complete Application
          </a>
        </div>
        <p style="margin-top: 20px; color: #666;">
          Or copy this link in your browser:<br>
          <code style="background-color: #f0f0f0; padding: 10px; border-radius: 3px; display: inline-block; margin-top: 10px;">${applicationLink}</code>
        </p>
        <div style="margin-top: 30px; padding: 20px; background-color: #f9f9f9; border-left: 4px solid #28a745; border-radius: 3px;">
          <h4 style="margin-top: 0; color: #333;">What to do next:</h4>
          <ol style="color: #666;">
            <li>Click the link above or copy it to your browser</li>
            <li>Verify your phone number with OTP</li>
            <li>Review and confirm your personal information</li>
            <li>Complete the SSN verification</li>
            <li>Submit your application</li>
          </ol>
        </div>
        <p style="margin-top: 20px; font-size: 14px; color: #999;">
          ⏱ This link will be valid for 7 days. Please complete your application within this time.
        </p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin-top: 30px;">
        <p style="font-size: 12px; color: #999;">LOS Platform | Loan Origination System</p>
      `,
    });

    console.log(`[EMAIL] ✓ Email sent to ${customerEmail} — Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId, mode: 'gmail' };
  } catch (error) {
    console.error('[EMAIL] Failed to send email:', error.message);
    return { success: false, mode: 'error-fallback', error: error.message };
  }
};

module.exports = { sendCustomerApplicationLink };
