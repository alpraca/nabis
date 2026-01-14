const https = require('https');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const PRODUCTS_URL = 'https://world.comfortzoneskin.com/collections/all-products';

// Fetch webpage
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Extract product data from React Loader JSON
function extractProductsFromJSON(html) {
  const products = [];
  
  // Find the loader data JSON - it's in a script that sets window.__reactRouterContext
  const loaderDataMatch = html.match(/window\.__reactRouterContext\.streamController\.enqueue\("(.+?)"\);/gs);
  
  if (!loaderDataMatch) {
    console.log('❌ Could not find React loader data');
    return products;
  }

  let fullJSON = '';
  for (const match of loaderDataMatch) {
    const jsonMatch = match.match(/enqueue\("(.+?)"\)/s);
    if (jsonMatch && jsonMatch[1]) {
      // Unescape the JSON string
      try {
        fullJSON += JSON.parse('"' + jsonMatch[1] + '"');
      } catch (e) {
        // Skip malformed chunks
      }
    }
  }

  // Write debug file
  fs.writeFileSync('loader-data.txt', fullJSON);
  console.log('💾 Written loader data to loader-data.txt');

  // Look for product objects - they have gid://shopify/Product/
  const productPattern = /"gid:\/\/shopify\/Product\/(\d+)","([^"]+)","([^"]+)"/g;
  let productMatches;
  
  while ((productMatches = productPattern.exec(fullJSON)) !== null) {
    const productId = productMatches[1];
    const titleField = productMatches[2];
    const handleField = productMatches[3];
    
    // Find corresponding image URL - look ahead in the JSON
    const searchStart = productMatches.index;
    const searchEnd = Math.min(searchStart + 3000, fullJSON.length);
    const productSegment = fullJSON.substring(searchStart, searchEnd);
    
    const imageMatch = productSegment.match(/"(https:\/\/cdn\.shopify\.com\/s\/files\/1\/0430\/3477\/1605\/files\/[^"]+\.jpg[^"]*?)"/);
    const altImageMatch = productSegment.match(/"(https:\/\/images\.salsify\.com\/image\/upload\/[^"]+\.jpg)"/);
    
    const imageUrl = imageMatch ? imageMatch[1] : (altImageMatch ? altImageMatch[1] : null);
    
    products.push({
      shopifyId: productId,
      title: titleField,
      handle: handleField,
      imageUrl: imageUrl
    });
  }

  return products;
}

// Download image
async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    // Clean URL - remove query parameters for filename
    const cleanUrl = url.split('?')[0];
    
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
      // Follow redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location, filename).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        return reject(new Error(`Status: ${res.statusCode}`));
      }

      const fileStream = fs.createWriteStream(filename);
      res.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function main() {
  try {
    console.log('🌐 Fetching Comfort Zone products page...');
    const html = await fetchPage(PRODUCTS_URL);
    console.log(`✅ Page loaded (${(html.length / 1024).toFixed(0)}KB)`);

    console.log('\n📦 Extracting product data from JSON...');
    const products = extractProductsFromJSON(html);
    console.log(`✅ Found ${products.length} products`);

    if (products.length === 0) {
      console.log('❌ No products found. Exiting.');
      return;
    }

    // Display sample products
    console.log('\n📋 Sample products:');
    products.slice(0, 5).forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.title} (${p.handle})`);
      console.log(`     Image: ${p.imageUrl ? p.imageUrl.substring(0, 60) + '...' : 'NO IMAGE'}`);
    });

    // Open database
    const db = new sqlite3.Database('./server/database.sqlite');
    
    // Promisify database operations
    const dbAll = (sql, params = []) => {
      return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    };

    const dbGet = (sql, params = []) => {
      return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    };

    const dbRun = (sql, params = []) => {
      return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve(this);
        });
      });
    };
    
    // Get Comfort Zone products from our database
    const dbProducts = await dbAll(`
      SELECT id, name, brand
      FROM products 
      WHERE brand = 'Comfort Zone'
      ORDER BY name
    `);
    
    console.log(`\n💾 Found ${dbProducts.length} Comfort Zone products in our database`);

    const imageDir = path.join(__dirname, 'public', 'images', 'products');
    if (!fs.existsSync(imageDir)) {
      fs.mkdirSync(imageDir, { recursive: true });
    }

    let downloadCount = 0;
    let matchCount = 0;
    let updateCount = 0;

    console.log('\n🔄 Matching products and downloading images...\n');

    for (const dbProduct of dbProducts) {
      // Try to match by product name
      const dbNameClean = dbProduct.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      let matchedProduct = products.find(p => {
        const shopifyNameClean = p.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        return dbNameClean.includes(shopifyNameClean) || shopifyNameClean.includes(dbNameClean);
      });

      // Also try matching by handle
      if (!matchedProduct) {
        const handleKeywords = dbProduct.name.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        matchedProduct = products.find(p => {
          return handleKeywords.some(keyword => p.handle.includes(keyword));
        });
      }

      if (matchedProduct && matchedProduct.imageUrl) {
        matchCount++;
        
        // Generate filename from product
        const filename = `comfort-zone-${matchedProduct.handle}.jpg`;
        const filepath = path.join(imageDir, filename);

        // Check if we already have this image
        if (fs.existsSync(filepath)) {
          console.log(`✓ ${dbProduct.name} - already exists`);
          
          // Update database if needed
          const existingImage = await dbGet(`
            SELECT image_url FROM product_images 
            WHERE product_id = ? AND sort_order = 0
          `, [dbProduct.id]);

          if (!existingImage || existingImage.image_url !== `/images/products/${filename}`) {
            await dbRun(`DELETE FROM product_images WHERE product_id = ?`, [dbProduct.id]);
            await dbRun(`
              INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
              VALUES (?, ?, 1, 0)
            `, [dbProduct.id, `/images/products/${filename}`]);
            updateCount++;
          }
          continue;
        }

        // Download new image
        try {
          await downloadImage(matchedProduct.imageUrl, filepath);
          downloadCount++;
          console.log(`✅ ${dbProduct.name}`);
          console.log(`   Downloaded: ${filename}`);

          // Update database
          await dbRun(`DELETE FROM product_images WHERE product_id = ?`, [dbProduct.id]);
          await dbRun(`
            INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
            VALUES (?, ?, 1, 0)
          `, [dbProduct.id, `/images/products/${filename}`]);
          updateCount++;

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
          console.log(`❌ ${dbProduct.name} - Download failed: ${error.message}`);
        }
      } else {
        console.log(`⚠️  ${dbProduct.name} - No match found`);
      }
    }

    db.close();

    console.log(`\n✨ Done!`);
    console.log(`   Matched: ${matchCount}/${dbProducts.length} products`);
    console.log(`   Downloaded: ${downloadCount} new images`);
    console.log(`   Updated: ${updateCount} database records`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
