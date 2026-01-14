const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database('./server/database.sqlite');

async function restoreImages() {
  console.log('\n🔧 RESTORING ALL PRODUCT IMAGES (EXCEPT COMFORT ZONE)\n');
  
  // Get all non-Comfort Zone products without images
  const products = await new Promise((resolve, reject) => {
    db.all(`
      SELECT p.id, p.name, p.brand
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.sort_order = 0
      WHERE p.brand != 'Comfort Zone' AND pi.id IS NULL
      ORDER BY p.brand, p.name
    `, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
  
  console.log(`📦 Found ${products.length} products without images\n`);
  
  if (products.length === 0) {
    console.log('✅ All products already have images!\n');
    db.close();
    return;
  }
  
  const imageDir = path.join(__dirname, 'public', 'images', 'products');
  const imageFiles = fs.readdirSync(imageDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg'));
  
  console.log(`🖼️  Found ${imageFiles.length} image files\n`);
  console.log('🔄 Matching images to products...\n');
  
  let restored = 0;
  let notFound = 0;
  
  for (const product of products) {
    // Clean product name for matching
    const cleanName = product.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    
    const cleanBrand = product.brand
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    
    // Try to find matching image
    let matchedImage = null;
    
    // Try exact match with brand-name pattern
    const exactMatch = imageFiles.find(img => {
      const imgName = img.toLowerCase().replace(/\.(jpg|png|jpeg)$/i, '');
      return imgName === `${cleanBrand}-${cleanName}` || 
             imgName === cleanName ||
             imgName.includes(cleanName);
    });
    
    if (exactMatch) {
      matchedImage = exactMatch;
    } else {
      // Try fuzzy match - split into words and match
      const nameWords = cleanName.split('-').filter(w => w.length > 2);
      const bestMatch = imageFiles.find(img => {
        const imgName = img.toLowerCase();
        return nameWords.some(word => imgName.includes(word) && word.length > 3);
      });
      
      if (bestMatch) {
        matchedImage = bestMatch;
      }
    }
    
    if (matchedImage) {
      // Insert image record
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
          VALUES (?, ?, 1, 0)
        `, [product.id, `/images/products/${matchedImage}`], (err) => {
          if (err) {
            console.log(`   ❌ ${product.brand} - ${product.name.substring(0, 40)}`);
            reject(err);
          } else {
            restored++;
            console.log(`   ✅ ${product.brand.substring(0, 20).padEnd(20)} - ${product.name.substring(0, 40)} → ${matchedImage}`);
            resolve();
          }
        });
      });
    } else {
      notFound++;
      console.log(`   ⚠️  ${product.brand} - ${product.name.substring(0, 40)} - No matching image`);
    }
  }
  
  console.log(`\n========== ✅ COMPLETE ==========\n`);
  console.log(`   • Restored: ${restored} products`);
  console.log(`   • Not found: ${notFound} products`);
  console.log(`   • Total processed: ${products.length}`);
  console.log(`\n🌐 Refresh your browser to see all images!\n`);
  
  db.close();
}

restoreImages().catch(err => {
  console.error('❌ Error:', err.message);
  db.close();
  process.exit(1);
});
