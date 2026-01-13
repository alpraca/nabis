const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

async function fixComfortZoneImages() {
  console.log('\n🔧 FIXING COMFORT ZONE IMAGES\n');
  
  // First, let's see how many products have images vs don't
  const stats = await new Promise((resolve, reject) => {
    db.get(`
      SELECT 
        COUNT(DISTINCT p.id) as total_products,
        COUNT(DISTINCT pi.product_id) as products_with_images
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.brand = 'Comfort Zone'
    `, [], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
  
  console.log(`📊 Status:`);
  console.log(`   Total Comfort Zone products: ${stats.total_products}`);
  console.log(`   Products with images: ${stats.products_with_images}`);
  console.log(`   Products WITHOUT images: ${stats.total_products - stats.products_with_images}\n`);
  
  // Get all products without images
  const productsWithoutImages = await new Promise((resolve, reject) => {
    db.all(`
      SELECT p.id, p.name
      FROM products p
      WHERE p.brand = 'Comfort Zone'
        AND NOT EXISTS (
          SELECT 1 FROM product_images pi WHERE pi.product_id = p.id
        )
    `, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
  
  console.log(`📦 Adding default images to ${productsWithoutImages.length} products...\n`);
  
  // Use a nice generic skincare product image path
  const defaultImagePath = '/images/products/default-skincare.jpg';
  
  let added = 0;
  for (const product of productsWithoutImages) {
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
        VALUES (?, ?, 1, 0)
      `, [product.id, defaultImagePath], function(err) {
        if (err) {
          console.error(`   ❌ Failed to add image for: ${product.name}`);
          reject(err);
        } else {
          added++;
          if (added % 20 === 0) {
            console.log(`   ✅ Added ${added} default images...`);
          }
          resolve();
        }
      });
    });
  }
  
  console.log(`\n✅ Added ${added} default images\n`);
  
  // Final verification
  const finalStats = await new Promise((resolve, reject) => {
    db.get(`
      SELECT COUNT(DISTINCT p.id) as products_with_images
      FROM products p
      INNER JOIN product_images pi ON p.id = pi.product_id
      WHERE p.brand = 'Comfort Zone'
    `, [], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
  
  console.log(`========== ✅ COMPLETE ==========\n`);
  console.log(`🖼️  Total Comfort Zone products with images: ${finalStats.products_with_images}/${stats.total_products}`);
  console.log(`\n📝 Image breakdown:`);
  console.log(`   • Real downloaded images: 22 products`);
  console.log(`   • Default placeholder: ${added} products`);
  console.log(`\n🌐 All images will now display on http://localhost:5173\n`);
  
  db.close();
}

fixComfortZoneImages().catch(err => {
  console.error('❌ Error:', err.message);
  db.close();
  process.exit(1);
});
