const https = require('https');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./server/database.sqlite');
const IMAGE_DIR = path.join(__dirname, 'public', 'images', 'products');

// Read and parse the import file to extract product data with image URLs
const importFileContent = fs.readFileSync('./import-comfort-zone.cjs', 'utf8');
const productsMatch = importFileContent.match(/const COMFORT_ZONE_PRODUCTS = \[([\s\S]*?)\];/);

if (!productsMatch) {
  console.error('❌ Could not extract product data from import file');
  process.exit(1);
}

// Parse the products array (simple eval in controlled environment)
const productsArrayString = '[' + productsMatch[1] + ']';
const PRODUCTS_WITH_IMAGES = eval(productsArrayString).filter(p => p.image && p.image.startsWith('http'));

console.log(`\n📥 Found ${PRODUCTS_WITH_IMAGES.length} products with image URLs from import file\n`);

if (!fs.existsSync(IMAGE_DIR)) {
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
}

function sanitizeFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(IMAGE_DIR, filename);
    
    // Skip if already exists
    if (fs.existsSync(filePath)) {
      resolve({ skipped: true });
      return;
    }

    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve({ downloaded: true });
        });
      } else {
        fs.unlink(filePath, () => {});
        reject(new Error(`Failed: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

async function downloadAndAssignImages() {
  console.log('🖼️  DOWNLOADING COMFORT ZONE PRODUCT IMAGES\n');
  
  // Get all Comfort Zone products from DB
  const dbProducts = await new Promise((resolve, reject) => {
    db.all(`
      SELECT p.id, p.name
      FROM products p
      WHERE p.brand = 'Comfort Zone'
      ORDER BY p.id
    `, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
  
  console.log(`📦 Found ${dbProducts.length} Comfort Zone products in database\n`);
  
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;
  let updated = 0;
  
  for (const dbProduct of dbProducts) {
    // Try to match with import data by name
    const cleanDbName = dbProduct.name.replace('Comfort Zone ', '').trim();
    const importProduct = PRODUCTS_WITH_IMAGES.find(p => {
      const cleanImportName = p.name.trim();
      return cleanDbName.toLowerCase() === cleanImportName.toLowerCase() ||
             cleanDbName.toLowerCase().includes(cleanImportName.toLowerCase()) ||
             cleanImportName.toLowerCase().includes(cleanDbName.toLowerCase());
    });
    
    if (!importProduct || !importProduct.image) {
      continue; // Skip products without image URLs
    }
    
    const filename = `comfort-zone-${sanitizeFilename(cleanDbName)}-${dbProduct.id}.jpg`;
    const localPath = `/images/products/${filename}`;
    const fullPath = path.join(IMAGE_DIR, filename);
    
    // Check if this product already has this specific image file
    if (fs.existsSync(fullPath)) {
      // Update DB if needed
      const currentImage = await new Promise((resolve) => {
        db.get(`
          SELECT image_url 
          FROM product_images 
          WHERE product_id = ?
        `, [dbProduct.id], (err, row) => {
          resolve(row ? row.image_url : null);
        });
      });
      
      if (currentImage !== localPath) {
        await new Promise((resolve) => {
          db.run(`
            UPDATE product_images 
            SET image_url = ?
            WHERE product_id = ?
          `, [localPath, dbProduct.id], () => {
            updated++;
            resolve();
          });
        });
      }
      
      skipped++;
      continue;
    }
    
    // Download the image
    try {
      const result = await downloadImage(importProduct.image, filename);
      
      if (result.downloaded) {
        downloaded++;
        
        // Update/Insert into database
        await new Promise((resolve) => {
          db.run(`DELETE FROM product_images WHERE product_id = ?`, [dbProduct.id], () => resolve());
        });
        
        await new Promise((resolve) => {
          db.run(`
            INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
            VALUES (?, ?, 1, 0)
          `, [dbProduct.id, localPath], () => {
            updated++;
            resolve();
          });
        });
        
        console.log(`   ✅ ${cleanDbName.substring(0, 50)}...`);
      } else if (result.skipped) {
        skipped++;
      }
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (error) {
      console.log(`   ❌ ${cleanDbName.substring(0, 50)}`);
      failed++;
    }
  }
  
  console.log(`\n========== ✅ COMPLETE ==========\n`);
  console.log(`   Downloaded: ${downloaded} images`);
  console.log(`   Updated DB: ${updated} records`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Failed: ${failed}\n`);
  
  // Final stats
  const stats = await new Promise((resolve, reject) => {
    db.all(`
      SELECT pi.image_url, COUNT(*) as count
      FROM products p
      INNER JOIN product_images pi ON p.id = pi.product_id
      WHERE p.brand = 'Comfort Zone'
      GROUP BY pi.image_url
      HAVING count > 1
      ORDER BY count DESC
      LIMIT 10
    `, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
  
  if (stats.length > 0) {
    console.log('📊 Images still shared by multiple products:\n');
    stats.forEach(row => {
      const imgName = row.image_url.split('/').pop();
      console.log(`   ${imgName}: ${row.count} products`);
    });
  } else {
    console.log('✅ All products now have unique images!\n');
  }
  
  console.log(`\n🌐 Refresh http://localhost:5173 to see all product images!\n`);
  
  db.close();
}

downloadAndAssignImages().catch(err => {
  console.error('❌ Error:', err.message);
  db.close();
  process.exit(1);
});
