const https = require('https');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./server/database.sqlite');
const IMAGE_DIR = path.join(__dirname, 'public', 'images', 'products');
const PRODUCTS_URL = 'https://world.comfortzoneskin.com/collections/all-products';

if (!fs.existsSync(IMAGE_DIR)) {
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
}

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };
    
    https.get(options, (res) => {
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
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };
    
    https.get(options, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve({ downloaded: true });
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
        file.close();
        fs.unlink(filePath, () => {});
        resolve(downloadImage(response.headers.location, filename));
      } else {
        file.close();
        fs.unlink(filePath, () => {});
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

function extractProductsFromHTML(html) {
  const products = [];
  
  // Find all product data in the page
  // Look for product cards with images and names
  const productRegex = /<div[^>]*class="[^"]*product-card[^"]*"[^>]*>[\s\S]*?<\/div>/gi;
  const matches = html.match(productRegex) || [];
  
  // Also try to find JSON product data embedded in the page
  const jsonMatch = html.match(/<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/gi);
  
  if (jsonMatch) {
    for (const script of jsonMatch) {
      const jsonContent = script.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
      try {
        const data = JSON.parse(jsonContent);
        if (data.products || data.collection?.products) {
          const prods = data.products || data.collection.products;
          return prods.map(p => ({
            name: p.title || p.name,
            imageUrl: p.featured_image || p.image || (p.images && p.images[0])
          }));
        }
      } catch (e) {
        // Continue to next method
      }
    }
  }
  
  // Fallback: Parse HTML for images and product names
  const imgRegex = /<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/gi;
  let match;
  
  while ((match = imgRegex.exec(html)) !== null) {
    const imageUrl = match[1];
    const altText = match[2];
    
    // Only include Shopify CDN images
    if (imageUrl.includes('cdn.shopify.com') && altText && altText.length > 3) {
      // Clean up image URL
      let cleanUrl = imageUrl;
      if (cleanUrl.startsWith('//')) {
        cleanUrl = 'https:' + cleanUrl;
      }
      // Remove size parameters
      cleanUrl = cleanUrl.replace(/(_\d+x\d+|\?v=\d+).*$/, '');
      
      products.push({
        name: altText.trim(),
        imageUrl: cleanUrl
      });
    }
  }
  
  return products;
}

async function scrapeAndDownloadAll() {
  console.log('\n🌐 SCRAPING COMFORT ZONE WEBSITE FOR ALL PRODUCTS\n');
  console.log(`📥 Fetching: ${PRODUCTS_URL}\n`);
  
  let html;
  try {
    html = await fetchPage(PRODUCTS_URL);
    console.log(`✅ Page loaded (${Math.round(html.length / 1024)}KB)\n`);
  } catch (error) {
    console.error('❌ Failed to fetch products page:', error.message);
    process.exit(1);
  }
  
  const scrapedProducts = extractProductsFromHTML(html);
  console.log(`📦 Found ${scrapedProducts.length} products on website\n`);
  
  if (scrapedProducts.length === 0) {
    console.error('❌ No products found. The website structure may have changed.');
    console.log('\n💡 Writing HTML to debug.html for inspection...');
    fs.writeFileSync('debug.html', html);
    process.exit(1);
  }
  
  // Get all products from database
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
  
  console.log(`📊 Database has ${dbProducts.length} Comfort Zone products\n`);
  console.log(`🔄 Matching and downloading images...\n`);
  
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;
  let updated = 0;
  
  for (let i = 0; i < dbProducts.length; i++) {
    const dbProduct = dbProducts[i];
    const cleanDbName = dbProduct.name.replace('Comfort Zone ', '').trim().toLowerCase();
    
    // Try to find matching product from website
    const scrapedProduct = scrapedProducts.find(sp => {
      const cleanScrapedName = sp.name.toLowerCase().trim();
      return cleanDbName.includes(cleanScrapedName) || 
             cleanScrapedName.includes(cleanDbName) ||
             cleanDbName.replace(/[^a-z0-9]/g, '') === cleanScrapedName.replace(/[^a-z0-9]/g, '');
    });
    
    if (!scrapedProduct || !scrapedProduct.imageUrl) {
      console.log(`   ⚠️  [${i + 1}/${dbProducts.length}] No match: ${cleanDbName.substring(0, 50)}`);
      failed++;
      continue;
    }
    
    const filename = `comfort-zone-${sanitizeFilename(cleanDbName)}-${dbProduct.id}.jpg`;
    const localPath = `/images/products/${filename}`;
    
    try {
      const result = await downloadImage(scrapedProduct.imageUrl, filename);
      
      if (result.downloaded) {
        downloaded++;
        
        // Update database
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
        
        console.log(`   ✅ [${i + 1}/${dbProducts.length}] ${cleanDbName.substring(0, 50)}`);
      } else if (result.skipped) {
        skipped++;
        
        // Still update DB if needed
        const currentImage = await new Promise((resolve) => {
          db.get(`SELECT image_url FROM product_images WHERE product_id = ?`, [dbProduct.id], (err, row) => {
            resolve(row ? row.image_url : null);
          });
        });
        
        if (currentImage !== localPath) {
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
        }
        
        console.log(`   ⏭️  [${i + 1}/${dbProducts.length}] Exists: ${cleanDbName.substring(0, 50)}`);
      }
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.log(`   ❌ [${i + 1}/${dbProducts.length}] Failed: ${cleanDbName.substring(0, 50)}`);
      failed++;
    }
  }
  
  console.log(`\n========== ✅ COMPLETE ==========\n`);
  console.log(`   Downloaded: ${downloaded} new images`);
  console.log(`   Updated DB: ${updated} records`);
  console.log(`   Skipped: ${skipped} (already existed)`);
  console.log(`   Failed: ${failed}\n`);
  
  // Final verification
  const verification = await new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        COUNT(DISTINCT p.id) as total_products,
        COUNT(DISTINCT pi.image_url) as unique_images,
        COUNT(DISTINCT p.id) - COUNT(DISTINCT pi.image_url) as duplicates
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.brand = 'Comfort Zone'
    `, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows[0]);
    });
  });
  
  console.log(`📊 Final Statistics:\n`);
  console.log(`   Total products: ${verification.total_products}`);
  console.log(`   Unique images: ${verification.unique_images}`);
  
  if (verification.unique_images === verification.total_products) {
    console.log(`\n🎉 SUCCESS! All ${verification.total_products} products now have unique images!\n`);
  } else {
    console.log(`\n⚠️  ${verification.total_products - verification.unique_images} products still need images\n`);
  }
  
  console.log(`🌐 Refresh http://localhost:5173 to see all product images!\n`);
  
  db.close();
}

scrapeAndDownloadAll().catch(err => {
  console.error('❌ Fatal Error:', err.message);
  db.close();
  process.exit(1);
});
