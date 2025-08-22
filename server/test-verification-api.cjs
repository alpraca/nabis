const axios = require('axios');

const testVerification = async () => {
  try {
    console.log('🧪 Testing health endpoint first...');
    
    const healthResponse = await axios.get('http://localhost:3001/api/health');
    console.log('✅ Health Check:', healthResponse.data);
    
    console.log('🧪 Testing order verification API...');
    
    const response = await axios.post('http://localhost:3001/api/orders/verify', {
      orderNumber: 'NF270763C725',
      verificationCode: '277835'
    });
    
    console.log('✅ API Response:', response.data);
  } catch (error) {
    console.error('❌ API Error:');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  }
};

testVerification();
