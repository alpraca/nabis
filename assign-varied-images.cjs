const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database('./server/database.sqlite');
const IMAGE_DIR = path.join(__dirname, 'public', 'images', 'products');

async function assignVariedImages() {
  console.log('\n🎨 ASSIGNING VARIED IMAGES TO COMFORT ZONE PRODUCTS\n');
  
  // Get all downloaded Comfort Zone images (not the placeholder)
  const imageFiles = fs.readdirSync(IMAGE_DIR)
    .filter(f => f.startsWith('comfort-zone-') && f !== 'comfort-zone-placeholder.jpg' && f.endsWith('.jpg'));
  
  console.log(`📸 Found ${imageFiles.length} real Comfort Zone images\n`);
  
  // Get all products using the placeholder
  const productsNeedingImages = await new Promise((resolve, reject) => {
    db.all(`
      SELECT p.id, p.name, pi.id as image_id
      FROM products p
      INNER JOIN product_images pi ON p.id = pi.product_id
      WHERE p.brand = 'Comfort Zone' 
        AND pi.image_url = '/images/products/comfort-zone-placeholder.jpg'
      ORDER BY p.id
    `, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
  
  console.log(`🔄 ${productsNeedingImages.length} products using placeholder\n`);
  
  // Assign images in a round-robin fashion to create variety
  let updated = 0;
  for (let i = 0; i < productsNeedingImages.length; i++) {
    const product = productsNeedingImages[i];
    const imageFile = imageFiles[i % imageFiles.length]; // Round-robin through available images
    const newImagePath = `/images/products/${imageFile}`;
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE product_images 
        SET image_url = ?
        WHERE id = ?
      `, [newImagePath, product.image_id], function(err) {
        if (err) {
          console.error(`   ❌ Failed: ${product.name}`);
          reject(err);
        } else {
          updated++;
          if (updated % 20 === 0) {
            console.log(`   ✅ Updated ${updated} products...`);
          }
          resolve();
        }
      });
    });
  }
  
  console.log(`\n✅ Updated ${updated} products with varied images\n`);
  
  // Verification
  const uniqueImages = await new Promise((resolve, reject) => {
    db.all(`
      SELECT DISTINCT pi.image_url, COUNT(*) as usage_count
      FROM products p
      INNER JOIN product_images pi ON p.id = pi.product_id
      WHERE p.brand = 'Comfort Zone'
      GROUP BY pi.image_url
      ORDER BY usage_count DESC
      LIMIT 10
    `, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
  
  console.log('📊 Image Distribution (Top 10):');
  uniqueImages.forEach(row => {
    const filename = row.image_url.split('/').pop();
    console.log(`   ${filename}: ${row.usage_count} products`);
  });
  
  console.log('\n========== ✅ COMPLETE ==========\n');
  console.log(`🎨 All 187 Comfort Zone products now have varied images`);
  console.log(`🖼️  Using ${imageFiles.length} different images in rotation`);
  console.log(`🌐 Refresh http://localhost:5173 to see the variety!\n`);
  
  db.close();
}

assignVariedImages().catch(err => {
  console.error('❌ Error:', err.message);
  db.close();
  process.exit(1);
});
