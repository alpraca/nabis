// Test the complete verification flow
console.log('Testing complete verification flow...\n');

const testData = {
  orderNumber: 'NFFABD7E19E895',
  verificationCode: '778681',
  totalAmount: '25.99',
  email: 'test@example.com'
};

console.log('1. Order Details:');
console.log(`   - Order Number: ${testData.orderNumber}`);
console.log(`   - Email: ${testData.email}`);
console.log(`   - Total: ${testData.totalAmount}€`);
console.log(`   - Verification Code: ${testData.verificationCode}\n`);

console.log('2. Verification Request:');
console.log(`   URL: http://localhost:3001/api/orders/verify`);
console.log(`   Method: POST`);
console.log(`   Body: ${JSON.stringify({
  orderNumber: testData.orderNumber,
  verificationCode: testData.verificationCode
})}\n`);

fetch('http://localhost:3001/api/orders/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderNumber: testData.orderNumber,
    verificationCode: testData.verificationCode
  })
})
.then(res => {
  console.log(`3. Response Status: ${res.status}`);
  return res.json();
})
.then(data => {
  console.log('4. Response Data:', JSON.stringify(data, null, 2));
  
  if (data.verified) {
    console.log('\n✅ SUCCESS: Order verified successfully!');
    console.log('👉 User should now be redirected to success page');
    console.log(`👉 URL: /order-success with state:`, {
      orderNumber: testData.orderNumber,
      totalAmount: testData.totalAmount,
      verified: true
    });
  } else {
    console.log('\n❌ FAILED: Verification was not successful');
  }
})
.catch(err => {
  console.log('\n❌ ERROR:', err.message);
});
