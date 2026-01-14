const http = require('http');

console.log('\n🔍 Testing Image URLs from API\n');

http.get('http://localhost:3001/api/products?limit=5', (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      const products = response.products || response;
      
      console.log(`Found ${products.length} products\n`);
      
      products.forEach((product, idx) => {
        console.log(`${idx + 1}. ${product.name}`);
        console.log(`   Brand: ${product.brand}`);
        console.log(`   Images type: ${typeof product.images}`);
        console.log(`   Images value: ${JSON.stringify(product.images)}`);
        
        if (Array.isArray(product.images) && product.images.length > 0) {
          console.log(`   ✅ Has ${product.images.length} images`);
          product.images.forEach(img => {
            console.log(`      📷 ${img}`);
          });
        } else if (typeof product.images === 'string' && product.images) {
          console.log(`   ⚠️  Images is a string: ${product.images}`);
        } else {
          console.log(`   ❌ No images`);
        }
        console.log('');
      });
      
      // Test actual image URL
      if (products.length > 0 && products[0].images && products[0].images.length > 0) {
        const testImg = products[0].images[0];
        const testUrl = `http://localhost:3001${testImg}`;
        console.log(`\n🌐 Testing image URL: ${testUrl}\n`);
        
        http.get(testUrl, (imgRes) => {
          console.log(`   Status: ${imgRes.statusCode}`);
          console.log(`   Content-Type: ${imgRes.headers['content-type']}`);
          console.log(`   Content-Length: ${imgRes.headers['content-length']}`);
          
          if (imgRes.statusCode === 200) {
            console.log(`   ✅ Image is accessible!`);
          } else {
            console.log(`   ❌ Image returned ${imgRes.statusCode}`);
          }
        }).on('error', (err) => {
          console.log(`   ❌ Error loading image: ${err.message}`);
        });
      }
      
    } catch (error) {
      console.error('❌ Error parsing response:', error);
    }
  });
  
}).on('error', (error) => {
  console.error('❌ HTTP Error:', error.message);
});
