const http = require('http');

// Test API endpoint
const url = 'http://localhost:3001/api/products?search=Comfort Zone';

http.get(url, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const products = JSON.parse(data);
      
      console.log('\n🔍 API Response for Comfort Zone Products\n');
      console.log(`Total products found: ${products.length}\n`);
      
      // Show first 5 products
      products.slice(0, 5).forEach(product => {
        console.log(`📦 ${product.name} (ID: ${product.id})`);
        console.log(`   Brand: ${product.brand}`);
        console.log(`   Images type: ${typeof product.images}`);
        console.log(`   Images value: ${JSON.stringify(product.images)}`);
        
        if (Array.isArray(product.images)) {
          console.log(`   ✅ Images is an array with ${product.images.length} items`);
          product.images.forEach((img, idx) => {
            console.log(`      ${idx + 1}. ${img}`);
          });
        } else {
          console.log(`   ❌ Images is NOT an array!`);
        }
        console.log('');
      });
      
    } catch (error) {
      console.error('❌ Error parsing response:', error);
    }
  });
  
}).on('error', (error) => {
  console.error('❌ HTTP Error:', error);
});
