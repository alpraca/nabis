// Quick test script to call sendOrderStatusUpdateEmail
// Usage: node scripts\test-order-status.cjs

(async () => {
  try {
    // Ensure we're running from project root
    // Load the email service
    const path = require('path');
    const emailService = require(path.resolve(__dirname, '..', 'server', 'services', 'emailService.cjs'));

    const testEmail = process.env.TEST_EMAIL || 'test@example.com';
    const testOrderNumber = 'TEST-0001';
    const testStatus = process.env.TEST_STATUS || 'in_delivery';
    const testName = process.env.TEST_NAME || 'Test User';

    console.log(`Calling sendOrderStatusUpdateEmail(to=${testEmail}, order=${testOrderNumber}, status=${testStatus}, name=${testName})`);

    const res = await emailService.sendOrderStatusUpdateEmail(testEmail, testOrderNumber, testStatus, testName);

    console.log('Result:', res);
    process.exit(0);
  } catch (err) {
    console.error('Test script error:', err && err.stack ? err.stack : err);
    process.exit(1);
  }
})();
