const sgMail = require('@sendgrid/mail');

// Only configure SendGrid if API key is available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const sendOTPEmail = async (to, otp) => {
  // Always log OTP to console for testing
  console.log('═══════════════════════════════════════');
  console.log(`📧 OTP for ${to}: ${otp}`);
  console.log('═══════════════════════════════════════');

  // Try to send email if SendGrid is configured
  if (process.env.SENDGRID_API_KEY && process.env.EMAIL_FROM) {
    const msg = {
      to,
      from: process.env.EMAIL_FROM,
      subject: 'Your OTP Code',
      text: `Your OTP is ${otp}`,
      html: `<h2>Your OTP is: ${otp}</h2>`
    };

    try {
      await sgMail.send(msg);
      console.log('✅ Email sent successfully');
    } catch (error) {
      console.error('❌ Email error:', error.response?.body || error);
      console.log('⚠️  OTP logged in console above for testing');
    }
  } else {
    console.log('⚠️  SendGrid not configured. OTP logged in console above for testing.');
  }
};

module.exports = sendOTPEmail;