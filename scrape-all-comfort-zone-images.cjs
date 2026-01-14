const https = require('https');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./server/database.sqlite');
const IMAGE_DIR = path.join(__dirname, 'public', 'images', 'products');
const BASE_URL = 'https://world.comfortzoneskin.com';

if (!fs.existsSync(IMAGE_DIR)) {
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
}

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
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

function extractProductFromPage(html, productName) {
  // Try to find the product image on the page
  const imgMatches = html.match(/https:\/\/cdn\.shopify\.com\/s\/files\/[^"'\s]+\.jpg/g);
  
  if (imgMatches && imgMatches.length > 0) {
    // Return the first high-quality image (usually the main product image)
    for (let img of imgMatches) {
      // Skip thumbnails or small images
      if (!img.includes('_thumb') && !img.includes('_small')) {
        return img.replace(/\?v=.*/, '');
      }
    }
    return imgMatches[0].replace(/\?v=.*/, '');
  }
  
  return null;
}

async function searchAndDownloadImages() {
  console.log('\n🔍 SEARCHING COMFORT ZONE WEBSITE FOR PRODUCT IMAGES\n');
  
  // Get all products from database
  const products = await new Promise((resolve, reject) => {
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
  
  console.log(`📦 Found ${products.length} Comfort Zone products\n`);
  console.log(`🌐 Searching ${BASE_URL} for each product...\n`);
  
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;
  let updated = 0;
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const cleanName = product.name.replace('Comfort Zone ', '').trim();
    const urlName = cleanName.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    const productUrl = `${BASE_URL}/products/${urlName}`;
    
    try {
      // Fetch the product page
      const html = await fetchPage(productUrl);
      const imageUrl = extractProductFromPage(html, cleanName);
      
      if (!imageUrl) {
        console.log(`   ⚠️  [${i + 1}/${products.length}] No image: ${cleanName.substring(0, 50)}`);
        failed++;
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }
      
      // Download the image
      const filename = `comfort-zone-${sanitizeFilename(cleanName)}-${product.id}.jpg`;
      const localPath = `/images/products/${filename}`;
      
      const result = await downloadImage(imageUrl, filename);
      
      if (result.downloaded) {
        downloaded++;
        
        // Update database
        await new Promise((resolve) => {
          db.run(`DELETE FROM product_images WHERE product_id = ?`, [product.id], () => resolve());
        });
        
        await new Promise((resolve) => {
          db.run(`
            INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
            VALUES (?, ?, 1, 0)
          `, [product.id, localPath], () => {
            updated++;
            resolve();
          });
        });
        
        console.log(`   ✅ [${i + 1}/${products.length}] ${cleanName.substring(0, 50)}`);
      } else if (result.skipped) {
        skipped++;
        console.log(`   ⏭️  [${i + 1}/${products.length}] Already exists: ${cleanName.substring(0, 50)}`);
      }
      
      // Delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`   ❌ [${i + 1}/${products.length}] Failed: ${cleanName.substring(0, 50)}`);
      failed++;
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log(`\n========== ✅ COMPLETE ==========\n`);
  console.log(`   Downloaded: ${downloaded} new images`);
  console.log(`   Updated DB: ${updated} records`);
  console.log(`   Skipped: ${skipped} (already existed)`);
  console.log(`   Failed: ${failed}\n`);
  
  // Final stats
  const uniqueCheck = await new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        COUNT(DISTINCT p.id) as total_products,
        COUNT(DISTINCT pi.image_url) as unique_images
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.brand = 'Comfort Zone'
    `, [], (err, row) => {
      if (err) reject(err);
      else resolve(row[0]);
    });
  });
  
  console.log(`📊 Final Statistics:\n`);
  console.log(`   Total products: ${uniqueCheck.total_products}`);
  console.log(`   Unique images: ${uniqueCheck.unique_images}\n`);
  
  if (uniqueCheck.unique_images === uniqueCheck.total_products) {
    console.log(`✅ SUCCESS! All products now have unique images!\n`);
  } else {
    console.log(`⚠️  ${uniqueCheck.total_products - uniqueCheck.unique_images} products still share images\n`);
  }
  
  console.log(`🌐 Refresh http://localhost:5173 to see all product images!\n`);
  
  db.close();
}

searchAndDownloadImages().catch(err => {
  console.error('❌ Error:', err.message);
  db.close();
  process.exit(1);
});
