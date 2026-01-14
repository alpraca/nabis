const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database('./server/database.sqlite');

async function fixImages() {
  console.log('\n🔧 FIXING ALL PRODUCT IMAGES\n');
  
  // Get actual image files (exclude Comfort Zone which are already correct)
  const imageDir = path.join(__dirname, 'public', 'images', 'products');
  const allImages = fs.readdirSync(imageDir)
    .filter(f => (f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg')) && 
                 f !== 'default-product.jpg' && 
                 !f.startsWith('comfort-zone'));
  
  console.log(`📸 Found ${allImages.length} non-Comfort Zone image files:`);
  allImages.forEach(img => console.log(`   - ${img}`));
  
  // Get all non-Comfort Zone products with wrong images
  const products = await new Promise((resolve, reject) => {
    db.all(`
      SELECT p.id, p.name, p.brand, pi.image_url
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.sort_order = 0
      WHERE p.brand != 'Comfort Zone'
      ORDER BY p.brand, p.name
    `, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
  
  console.log(`\n📦 Found ${products.length} non-Comfort Zone products\n`);
  console.log('🔄 Fixing images...\n');
  
  let fixed = 0;
  let removed = 0;
  
  for (const product of products) {
    const cleanBrand = product.brand.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanName = product.name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Find matching image
    const matchingImage = allImages.find(img => {
      const imgName = img.toLowerCase().replace(/\.(jpg|png|jpeg)$/i, '');
      
      // Check if image name contains brand and product keywords
      const imgWords = imgName.split('-').filter(w => w.length > 2);
      const nameWords = cleanName.split('-').filter(w => w.length > 2);
      
      // Must match brand
      if (!imgName.includes(cleanBrand)) return false;
      
      // Check keyword overlap
      const matchCount = imgWords.filter(iw => nameWords.some(nw => 
        iw.includes(nw) || nw.includes(iw)
      )).length;
      
      return matchCount >= 2; // At least 2 matching keywords
    });
    
    const currentImage = product.image_url;
    const correctImage = matchingImage ? `/images/products/${matchingImage}` : null;
    
    // If current image is wrong (pointing to comfort-zone or doesn't exist)
    if (currentImage && (currentImage.includes('comfort-zone') || !correctImage)) {
      // Remove wrong image
      await new Promise((resolve) => {
        db.run(`DELETE FROM product_images WHERE product_id = ?`, [product.id], () => resolve());
      });
      removed++;
      console.log(`   🗑️  ${product.brand.substring(0, 15).padEnd(15)} - ${product.name.substring(0, 40)} - Removed wrong image`);
    } else if (correctImage && currentImage !== correctImage) {
      // Update with correct image
      await new Promise((resolve) => {
        db.run(`DELETE FROM product_images WHERE product_id = ?`, [product.id], () => resolve());
      });
      
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
          VALUES (?, ?, 1, 0)
        `, [product.id, correctImage], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      fixed++;
      console.log(`   ✅ ${product.brand.substring(0, 15).padEnd(15)} - ${product.name.substring(0, 40)} → ${matchingImage}`);
    }
  }
  
  console.log(`\n========== ✅ COMPLETE ==========\n`);
  console.log(`   • Fixed: ${fixed} products`);
  console.log(`   • Removed wrong: ${removed} products`);
  console.log(`   • Available images: ${allImages.length}`);
  console.log(`\n🌐 Refresh your browser!\n`);
  
  db.close();
}

fixImages().catch(err => {
  console.error('❌ Error:', err.message);
  db.close();
  process.exit(1);
});
