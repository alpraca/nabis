const { sendOrderVerificationCode } = require('./services/emailService.cjs');
require('dotenv').config();

const sendTestVerification = async () => {
  console.log('📧 Sending test verification code to muratiberti02@gmail.com...');
  
  const result = await sendOrderVerificationCode(
    'muratiberti02@gmail.com',
    'NF270763C725', // Most recent order
    '277835' // Verification code from database
  );
  
  if (result.success) {
    console.log('✅ Test verification email sent successfully!');
  } else {
    console.error('❌ Failed to send test email:', result.error);
  }
  
  process.exit(0);
};

sendTestVerification();
