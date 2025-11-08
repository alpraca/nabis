require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { sendVerificationEmail } = require('./services/emailService.cjs');

(async () => {
  const to = process.env.TEST_EMAIL || process.env.EMAIL_USER || 'test@example.com';
  console.log('Sending test verification email to:', to);
  const res = await sendVerificationEmail(to, '123456', 'Test User');
  console.log('Result:', res);
})();
