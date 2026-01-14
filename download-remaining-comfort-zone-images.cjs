const https = require('https');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./server/database.sqlite');
const IMAGE_DIR = path.join(__dirname, 'public', 'images', 'products');

// Import the original product data with image URLs
const COMFORT_ZONE_PRODUCTS = require('./import-comfort-zone.cjs').COMFORT_ZONE_PRODUCTS || [];

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

async function downloadRemainingImages() {
  console.log('\n🖼️  DOWNLOADING REMAINING COMFORT ZONE IMAGES\n');
  
  // Get products that still have generic/shared images
  const products = await new Promise((resolve, reject) => {
    db.all(`
      SELECT DISTINCT p.id, p.name, pi.image_url
      FROM products p
      INNER JOIN product_images pi ON p.id = pi.product_id
      WHERE p.brand = 'Comfort Zone'
      ORDER BY p.id
    `, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
  
  console.log(`📦 Found ${products.length} Comfort Zone products\n`);
  
  // Find products using generic images (not product-specific)
  const genericImages = [
    '/images/products/comfort-zone-sublime-skin-fluid-cream.jpg',
    '/images/products/comfort-zone-sublime-skin-lotion.jpg',
    '/images/products/comfort-zone-sublime-skin-serum.jpg',
    '/images/products/comfort-zone-tranquillity-cream.jpg',
    '/images/products/comfort-zone-sun-soul-cream-spf50.jpg',
    '/images/products/comfort-zone-hydramemory-ampoules.jpg',
    '/images/products/comfort-zone-remedy-serum.jpg',
    '/images/products/comfort-zone-renight-ampoules.jpg',
    '/images/products/comfort-zone-hand-oil.jpg',
    '/images/products/comfort-zone-tranquillity-shower.jpg',
    '/images/products/comfort-zone-makeup-remover.jpg'
  ];
  
  const productsNeedingImages = products.filter(p => {
    // Check if using a generic shared image
    const usingGeneric = genericImages.some(img => p.image_url === img);
    
    // Check if individual image file exists
    const individualFile = `comfort-zone-${sanitizeFilename(p.name.replace('Comfort Zone ', ''))}-${p.id}.jpg`;
    const individualPath = path.join(IMAGE_DIR, individualFile);
    const hasIndividualFile = fs.existsSync(individualPath);
    
    return usingGeneric && !hasIndividualFile;
  });
  
  console.log(`🎯 ${productsNeedingImages.length} products need individual images\n`);
  
  if (productsNeedingImages.length === 0) {
    console.log('✅ All products already have individual images!\n');
    db.close();
    return;
  }
  
  // Check if we have original URLs stored anywhere - looks like we don't have them anymore
  // So we'll need to generate placeholder images or skip
  console.log(`⚠️  No original image URLs available in database\n`);
  console.log(`   Products are already using the best available images from the 22 downloaded\n`);
  console.log(`   To get unique images, you would need to:\n`);
  console.log(`   1. Manually download from Comfort Zone website\n`);
  console.log(`   2. Or provide a CSV/JSON with product IDs and image URLs\n`);
  
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;
  let updated = 0;
  
  for (const product of productsNeedingImages) {
    // Find matching scraped data
    const scraped = scrapedData.find(s => s.id === product.id);
    
    if (!scraped || !scraped.original_image_url || !scraped.original_image_url.startsWith('http')) {
      console.log(`   ⚠️  No URL: ${product.name.substring(0, 60)}`);
      skipped++;
      continue;
    }
    
    const filename = `comfort-zone-${sanitizeFilename(product.name.replace('Comfort Zone ', ''))}-${product.id}.jpg`;
    const localPath = `/images/products/${filename}`;
    
    try {
      const result = await downloadImage(scraped.original_image_url, filename);
      
      if (result.skipped) {
        skipped++;
      } else if (result.downloaded) {
        downloaded++;
        
        // Update database to use the new individual image
        await new Promise((resolve) => {
          db.run(`
            UPDATE product_images 
            SET image_url = ?
            WHERE product_id = ?
          `, [localPath, product.id], () => {
            updated++;
            resolve();
          });
        });
        
        console.log(`   ✅ ${product.name.substring(14, 60)}...`);
      }
      
      // Small delay to be nice to the server
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (error) {
      console.log(`   ❌ Failed: ${product.name.substring(14, 60)}`);
      failed++;
    }
  }
  
  console.log(`\n========== ✅ COMPLETE ==========\n`);
  console.log(`   Downloaded: ${downloaded} new images`);
  console.log(`   Updated DB: ${updated} records`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Failed: ${failed}\n`);
  
  // Verify
  const verification = await new Promise((resolve, reject) => {
    db.all(`
      SELECT pi.image_url, COUNT(*) as count
      FROM products p
      INNER JOIN product_images pi ON p.id = pi.product_id
      WHERE p.brand = 'Comfort Zone'
      GROUP BY pi.image_url
      ORDER BY count DESC
      LIMIT 15
    `, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
  
  console.log('📊 Top image usage after download:\n');
  verification.forEach(row => {
    const imgName = row.image_url.split('/').pop();
    console.log(`   ${imgName.substring(0, 50)}: ${row.count} products`);
  });
  
  console.log(`\n🌐 Refresh http://localhost:5173 to see updated images!\n`);
  
  db.close();
}

downloadRemainingImages().catch(err => {
  console.error('❌ Error:', err.message);
  db.close();
  process.exit(1);
});
