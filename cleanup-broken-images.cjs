const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const imagesDir = path.join(__dirname, 'public', 'images', 'products');

const db = new sqlite3.Database(dbPath);

console.log('\n🔧 Fixing Image References After Cleanup\n');

// Step 1: Remove references to non-existent files
db.all('SELECT DISTINCT image_url FROM product_images', [], (err, rows) => {
  if (err) {
    console.error('Error:', err);
    db.close();
    return;
  }
  
  let removed = 0;
  let checked = 0;
  
  rows.forEach(row => {
    checked++;
    const fullPath = path.join(__dirname, 'public', row.image_url.replace(/^\/+/, ''));
    
    if (!fs.existsSync(fullPath) || fs.statSync(fullPath).size === 0) {
      db.run('DELETE FROM product_images WHERE image_url = ?', [row.image_url], (err) => {
        if (err) console.error('Error deleting:', err);
      });
      removed++;
    }
  });
  
  console.log(`✅ Checked ${checked} image references`);
  console.log(`🗑️  Removed ${removed} broken references\n`);
  
  // Step 2: Find products without images
  setTimeout(() => {
    db.all(`
      SELECT p.id, p.name, p.brand
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE pi.product_id IS NULL
      ORDER BY p.brand, p.name
    `, [], (err, productsWithoutImages) => {
      if (err) {
        console.error('Error:', err);
        db.close();
        return;
      }
      
      console.log(`📦 Products without images: ${productsWithoutImages.length}\n`);
      
      if (productsWithoutImages.length > 0) {
        console.log('Sample products needing images:');
        productsWithoutImages.slice(0, 10).forEach(p => {
          console.log(`   - ${p.name} (${p.brand})`);
        });
      }
      
      db.close();
      
      console.log('\n✅ Cleanup complete!');
      console.log('🔄 Please restart the server to re-match images');
    });
  }, 1000);
});
