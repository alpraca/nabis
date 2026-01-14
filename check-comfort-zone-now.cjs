const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('\n🔍 Checking Comfort Zone Images NOW\n');

// Get sample of Comfort Zone products with their images
db.all(`
  SELECT 
    p.id, 
    p.name, 
    p.brand,
    pi.image_url,
    pi.sort_order
  FROM products p
  LEFT JOIN product_images pi ON p.id = pi.product_id
  WHERE p.brand = 'Comfort Zone'
  ORDER BY p.id, pi.sort_order
  LIMIT 50
`, [], (err, rows) => {
  if (err) {
    console.error('❌ Error:', err);
    db.close();
    return;
  }

  console.log(`📊 Found ${rows.length} image records for Comfort Zone products\n`);

  // Group by product
  const products = {};
  rows.forEach(row => {
    if (!products[row.id]) {
      products[row.id] = {
        id: row.id,
        name: row.name,
        brand: row.brand,
        images: []
      };
    }
    if (row.image_url) {
      products[row.id].images.push(row.image_url);
    }
  });

  let hasImages = 0;
  let noImages = 0;
  let missingFiles = 0;

  Object.values(products).forEach(product => {
    const status = product.images.length > 0 ? '✅' : '❌';
    console.log(`${status} ${product.name}`);
    
    if (product.images.length > 0) {
      hasImages++;
      product.images.forEach(img => {
        const fullPath = path.join(__dirname, 'public', img.replace(/^\/+/, ''));
        const exists = fs.existsSync(fullPath);
        if (!exists) {
          console.log(`   ⚠️  Missing file: ${img}`);
          missingFiles++;
        } else {
          console.log(`   📷 ${img}`);
        }
      });
    } else {
      noImages++;
      console.log(`   ⚠️  No images assigned`);
    }
    console.log('');
  });

  console.log(`\n📈 Summary:`);
  console.log(`   ✅ Products with images: ${hasImages}`);
  console.log(`   ❌ Products without images: ${noImages}`);
  console.log(`   ⚠️  Missing files: ${missingFiles}`);

  db.close();
});
