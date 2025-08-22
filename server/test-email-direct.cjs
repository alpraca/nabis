const nodemailer = require('nodemailer');
require('dotenv').config();

const testEmail = async () => {
  console.log('🧪 Testing email configuration...');
  console.log('📧 Email User:', process.env.EMAIL_USER);
  console.log('🔑 Email Pass Length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 'NOT SET');
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Verify connection
  try {
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');
    
    // Send test email
    console.log('📤 Sending test email...');
    const result = await transporter.sendMail({
      from: {
        name: 'Nabis Farmaci Test',
        address: process.env.EMAIL_USER
      },
      to: process.env.EMAIL_USER, // Send to self for testing
      subject: 'Test Email - Nabis Farmaci',
      html: `
        <h2>🎉 Email Test Successful!</h2>
        <p>This is a test email from Nabis Farmaci.</p>
        <p>Time: ${new Date().toLocaleString()}</p>
        <p>If you receive this, email configuration is working!</p>
      `
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('📨 Message ID:', result.messageId);
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('📝 Full error:', error);
  }
};

testEmail();
