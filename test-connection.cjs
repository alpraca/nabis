const http = require('http');

console.log('🧪 Testing connection to http://localhost:3001...');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/products',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log('✅ Connection successful!');
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response data:', data.substring(0, 200) + '...');
  });
});

req.on('error', (err) => {
  console.error('❌ Connection failed:', err.message);
});

req.setTimeout(5000, () => {
  console.error('❌ Request timeout');
  req.destroy();
});

req.end();
