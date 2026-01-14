/**
 * 🔄 AUTO IMAGE RESTORATION MODULE
 * Automatically restores and assigns images to products when server starts
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'database.sqlite');

async function autoRestoreImages() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    
    console.log('🔄 Auto-restoring product images...');
    
    // Get all products with images (from any location)
    db.all(`
      SELECT DISTINCT p.id, p.name, p.brand, pi.image_url, pi.id as image_id, pi.sort_order
      FROM products p
      INNER JOIN product_images pi ON p.id = pi.product_id
      ORDER BY p.brand, p.name
    `, [], (err, products) => {
      if (err) {
        console.error('   ❌ Error fetching products:', err.message);
        db.close();
        return reject(err);
      }
      
      if (!products || products.length === 0) {
        console.log('   ✅ No images need restoration');
        db.close();
        return resolve({ restored: 0, total: 0 });
      }
      
      let restored = 0;
      let processed = 0;
      
      const updatePromises = products.map(product => {
        return new Promise((resolveUpdate) => {
          if (product.sort_order !== 0) {
            db.run(`
              UPDATE product_images 
              SET sort_order = 0, is_primary = 1
              WHERE id = ?
            `, [product.image_id], (updateErr) => {
              if (updateErr) {
                console.error(`   ❌ Error updating ${product.name}:`, updateErr.message);
              } else {
                restored++;
              }
              processed++;
              resolveUpdate();
            });
          } else {
            processed++;
            resolveUpdate();
          }
        });
      });
      
      Promise.all(updatePromises).then(() => {
        console.log(`   ✅ Image restoration complete: ${restored} updated, ${products.length} total`);
        db.close();
        resolve({ restored, total: products.length });
      });
    });
  });
}

module.exports = { autoRestoreImages };
