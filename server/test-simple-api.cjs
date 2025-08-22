const http = require('http');

const testAPI = () => {
  console.log('🧪 Testing simple API call...');
  
  const postData = JSON.stringify({
    orderNumber: 'NF198A4F1FB4E',
    verificationCode: '626315'
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/orders/verify',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📝 Response:', data);
      process.exit(0);
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Request error: ${e.message}`);
    process.exit(1);
  });

  req.setTimeout(5000, () => {
    console.error('❌ Request timeout');
    req.destroy();
    process.exit(1);
  });

  req.write(postData);
  req.end();
};

testAPI();
