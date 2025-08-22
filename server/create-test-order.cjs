const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');

const db = new sqlite3.Database('./database.sqlite');

// Create a test order
const orderNumber = 'NF' + crypto.randomBytes(6).toString('hex').toUpperCase();
const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

const testOrder = {
  user_id: 1, // Assuming user ID 1 exists
  order_number: orderNumber,
  total_amount: 25.99,
  status: 'pending',
  payment_method: 'cash_on_delivery',
  shipping_address: 'Test Address 123',
  shipping_city: 'Tirane',
  phone: '+355691234567',
  notes: 'Test order for verification',
  email: 'test@example.com',
  verification_code: verificationCode,
  verification_status: 'pending'
};

db.run(`
  INSERT INTO orders (
    user_id, order_number, total_amount, status, payment_method,
    shipping_address, shipping_city, phone, notes, email,
    verification_code, verification_status, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
`, [
  testOrder.user_id, testOrder.order_number, testOrder.total_amount,
  testOrder.status, testOrder.payment_method, testOrder.shipping_address,
  testOrder.shipping_city, testOrder.phone, testOrder.notes,
  testOrder.email, testOrder.verification_code, testOrder.verification_status
], function(err) {
  if (err) {
    console.error('Error creating test order:', err);
  } else {
    console.log('✅ Test order created successfully!');
    console.log('Order Number:', testOrder.order_number);
    console.log('Verification Code:', testOrder.verification_code);
    console.log('Email:', testOrder.email);
    console.log('');
    console.log('Test this verification with:');
    console.log(`curl -X POST http://localhost:3001/api/orders/verify \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '{"orderNumber":"${testOrder.order_number}","verificationCode":"${testOrder.verification_code}"}'`);
  }
  db.close();
});
