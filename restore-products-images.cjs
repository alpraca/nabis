const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

async function restoreAllProductImages() {
  console.log('\n🔧 RESTORING ALL IMAGES FROM /uploads/products/\n');
  
  // Get all products with images from /uploads/products/
  const products = await new Promise((resolve, reject) => {
    db.all(`
      SELECT DISTINCT p.id, p.name, p.brand, pi.image_url, pi.id as img_id, pi.sort_order
      FROM products p
      INNER JOIN product_images pi ON p.id = pi.product_id
      WHERE pi.image_url LIKE '/uploads/products/%'
      ORDER BY p.brand, p.name
    `, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
  
  console.log(`📦 Found ${products.length} products with /uploads/products/ images\n`);
  
  let updated = 0;
  
  for (const product of products) {
    if (product.sort_order !== 0) {
      await new Promise((resolve, reject) => {
        db.run(`
          UPDATE product_images 
          SET sort_order = 0, is_primary = 1
          WHERE id = ?
        `, [product.img_id], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      updated++;
      console.log(`   ✅ ${product.brand.substring(0, 20).padEnd(20)} - ${product.name.substring(0, 50)}`);
    }
  }
  
  console.log(`\n========== ✅ COMPLETE ==========\n`);
  console.log(`   • Updated: ${updated} products`);
  console.log(`   • Total found: ${products.length}`);
  console.log(`\n🌐 Now all images should be visible!\n`);
  
  db.close();
}

restoreAllProductImages().catch(err => {
  console.error('❌ Error:', err.message);
  db.close();
  process.exit(1);
});
