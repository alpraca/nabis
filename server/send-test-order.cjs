const { sendOrderConfirmationEmail } = require('./services/emailService.cjs');
require('dotenv').config();

const sendTestOrder = async () => {
  console.log('📧 Sending test order confirmation to muratiberti02@gmail.com...');
  
  const orderData = {
    orderId: 'NF270763C725',
    items: [
      { name: 'Test Product 1', quantity: 2, price: '1200.00' },
      { name: 'Test Product 2', quantity: 1, price: '2342.00' }
    ],
    total: '4742.00',
    shippingAddress: 'Rruga Test, Nr. 123, Tiranë',
    phoneNumber: '+355 69 123 4567'
  };
  
  const result = await sendOrderConfirmationEmail(
    'muratiberti02@gmail.com',
    orderData,
    'Murat Iberti'
  );
  
  if (result.success) {
    console.log('✅ Test order confirmation email sent successfully!');
  } else {
    console.error('❌ Failed to send test email:', result.error);
  }
  
  process.exit(0);
};

sendTestOrder();
