const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

async function restoreAllUploadedImages() {
  console.log('\n🔧 RESTORING ALL UPLOADED IMAGES FROM DATABASE\n');
  
  // Get all products with their image URLs from uploads folder
  const products = await new Promise((resolve, reject) => {
    db.all(`
      SELECT DISTINCT p.id, p.name, p.brand, pi.image_url
      FROM products p
      INNER JOIN product_images pi ON p.id = pi.product_id
      WHERE pi.image_url LIKE '/uploads/images/%'
      ORDER BY p.brand, p.name
    `, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
  
  console.log(`📦 Found ${products.length} products with uploaded images\n`);
  
  let restored = 0;
  
  for (const product of products) {
    // Update sort_order to 0 if needed
    const currentImage = await new Promise((resolve, reject) => {
      db.get(`
        SELECT id, sort_order FROM product_images 
        WHERE product_id = ? AND image_url = ?
      `, [product.id, product.image_url], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (currentImage && currentImage.sort_order !== 0) {
      await new Promise((resolve, reject) => {
        db.run(`
          UPDATE product_images 
          SET sort_order = 0, is_primary = 1
          WHERE id = ?
        `, [currentImage.id], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      restored++;
      console.log(`   ✅ ${product.brand.substring(0, 20).padEnd(20)} - ${product.name.substring(0, 50)}`);
    }
  }
  
  console.log(`\n========== ✅ COMPLETE ==========\n`);
  console.log(`   • Restored: ${restored} products`);
  console.log(`   • Total with images: ${products.length}`);
  console.log(`\n🌐 Refresh your browser!\n`);
  
  db.close();
}

restoreAllUploadedImages().catch(err => {
  console.error('❌ Error:', err.message);
  db.close();
  process.exit(1);
});
