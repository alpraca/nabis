const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('Email User:', process.env.EMAIL_USER);
console.log('Email Pass:', process.env.EMAIL_PASS ? '****' + process.env.EMAIL_PASS.slice(-4) : 'NOT SET');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Test email
const testEmail = async () => {
  try {
    console.log('Testing email connection...');
    
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection verified!');
    
    // Send test email
    const info = await transporter.sendMail({
      from: {
        name: 'Nabis Farmaci Test',
        address: process.env.EMAIL_USER
      },
      to: process.env.EMAIL_USER, // Send to yourself for testing
      subject: 'Test Email - Nabis Farmaci',
      html: `
        <h2>Test Email</h2>
        <p>If you receive this email, the Gmail configuration is working!</p>
        <p>Time: ${new Date().toLocaleString()}</p>
      `
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ Email test failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 SOLUTION:');
      console.log('1. Make sure 2-Factor Authentication is enabled');
      console.log('2. Generate a new App Password');
      console.log('3. Use the App Password (not your regular Gmail password)');
    }
  }
};

testEmail();
