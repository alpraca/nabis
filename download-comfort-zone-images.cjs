const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./server/database.sqlite');
const IMAGE_DIR = path.join(__dirname, 'public', 'images', 'products');

// Ensure directory exists
if (!fs.existsSync(IMAGE_DIR)) {
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
}

function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    if (!url) {
      resolve(null);
      return;
    }
    
    const protocol = url.startsWith('https') ? https : http;
    const filepath = path.join(IMAGE_DIR, filename);
    
    // Check if file already exists
    if (fs.existsSync(filepath)) {
      resolve(filename);
      return;
    }
    
    const file = fs.createWriteStream(filepath);
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        fs.unlinkSync(filepath);
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve(filename);
      });
    }).on('error', (err) => {
      fs.unlinkSync(filepath);
      reject(err);
    });
  });
}

function sanitizeFilename(name) {
  return name
    .replace(/[^a-z0-9]/gi, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
    .substring(0, 50);
}

async function processImages() {
  console.log('\n🖼️  DOWNLOADING COMFORT ZONE IMAGES\n');
  
  // Get all Comfort Zone products with their images
  const products = await new Promise((resolve, reject) => {
    db.all(`
      SELECT p.id, p.name, p.brand, pi.image_url
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.brand = 'Comfort Zone'
      ORDER BY p.id
    `, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
  
  console.log(`Found ${products.length} Comfort Zone product records\n`);
  
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;
  let updated = 0;
  
  for (const product of products) {
    const productName = product.name.replace('Comfort Zone ', '');
    const filename = `comfort-zone-${sanitizeFilename(productName)}-${product.id}.jpg`;
    
    if (product.image_url) {
      try {
        console.log(`⬇️  Downloading: ${productName.substring(0, 40)}...`);
        
        const savedFilename = await downloadImage(product.image_url, filename);
        
        if (savedFilename) {
          // Update database with local path
          const localPath = `/images/products/${savedFilename}`;
          
          await new Promise((resolve, reject) => {
            db.run(`
              UPDATE product_images 
              SET image_url = ?
              WHERE product_id = ? AND image_url = ?
            `, [localPath, product.id, product.image_url], function(err) {
              if (err) reject(err);
              else {
                if (this.changes > 0) updated++;
                resolve();
              }
            });
          });
          
          downloaded++;
          console.log(`   ✅ Saved as: ${filename}`);
        }
      } catch (error) {
        failed++;
        console.log(`   ❌ Failed: ${error.message}`);
      }
    } else {
      skipped++;
      
      // Product has no image - add a placeholder
      const localPath = `/images/products/comfort-zone-placeholder.jpg`;
      
      await new Promise((resolve) => {
        db.run(`
          INSERT OR IGNORE INTO product_images (product_id, image_url, is_primary, sort_order)
          VALUES (?, ?, 1, 0)
        `, [product.id, localPath], () => resolve());
      });
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('\n========== DOWNLOAD COMPLETE ==========\n');
  console.log(`✅ Downloaded: ${downloaded} images`);
  console.log(`📝 Updated database: ${updated} records`);
  console.log(`⚠️  Skipped: ${skipped} (no URL)`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`\n💾 Images saved to: ${IMAGE_DIR}\n`);
  
  // Verify - count products with images
  const withImages = await new Promise((resolve, reject) => {
    db.get(`
      SELECT COUNT(DISTINCT p.id) as count
      FROM products p
      INNER JOIN product_images pi ON p.id = pi.product_id
      WHERE p.brand = 'Comfort Zone'
    `, [], (err, row) => {
      if (err) reject(err);
      else resolve(row.count);
    });
  });
  
  console.log(`🖼️  Total Comfort Zone products with images: ${withImages}\n`);
  
  db.close();
}

processImages().catch(err => {
  console.error('❌ Fatal error:', err.message);
  db.close();
  process.exit(1);
});
