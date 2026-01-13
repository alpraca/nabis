const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

async function fixAllImages() {
  console.log('\n🔧 FIXING ALL PRODUCT IMAGES\n');
  
  // Step 1: Add default images to products without any image
  console.log('📸 Step 1: Adding default images to products without images...\n');
  
  const productsWithoutImages = await new Promise((resolve, reject) => {
    db.all(`
      SELECT p.id, p.name, p.brand
      FROM products p
      WHERE NOT EXISTS (
        SELECT 1 FROM product_images pi WHERE pi.product_id = p.id
      )
    `, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
  
  console.log(`   Found ${productsWithoutImages.length} products without images\n`);
  
  for (const product of productsWithoutImages) {
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
        VALUES (?, '/images/products/default-product.jpg', 1, 0)
      `, [product.id], function(err) {
        if (err) {
          console.error(`   ❌ Failed: ${product.name}`);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
  
  console.log(`   ✅ Added default images to ${productsWithoutImages.length} products\n`);
  
  // Step 2: Verify all products now have images
  const stats = await new Promise((resolve, reject) => {
    db.get(`
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT pi.product_id) as with_images
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
    `, [], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
  
  console.log('📊 Image Statistics:');
  console.log(`   Total products: ${stats.total}`);
  console.log(`   Products with images: ${stats.with_images}`);
  console.log(`   Missing images: ${stats.total - stats.with_images}\n`);
  
  // Step 3: Show Comfort Zone image distribution
  const comfortZoneCheck = await new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        p.id,
        p.name,
        pi.image_url
      FROM products p
      INNER JOIN product_images pi ON p.id = pi.product_id
      WHERE p.brand = 'Comfort Zone'
      ORDER BY p.id
      LIMIT 10
    `, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
  
  console.log('✅ Sample Comfort Zone products with images:');
  comfortZoneCheck.forEach(p => {
    const imgName = p.image_url.split('/').pop().substring(0, 40);
    console.log(`   ${p.name.substring(0, 40)} → ${imgName}`);
  });
  
  console.log('\n========== ✅ COMPLETE ==========\n');
  console.log('🖼️  All products now have images assigned');
  console.log('🌐 Refresh your browser to see the changes!\n');
  
  db.close();
}

fixAllImages().catch(err => {
  console.error('❌ Error:', err.message);
  db.close();
  process.exit(1);
});
