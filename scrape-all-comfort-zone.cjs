const https = require('https');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const BASE_URL = 'https://world.comfortzoneskin.com/collections/all-products';

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
  
  // Find the loader data JSON
  const loaderDataMatch = html.match(/window\.__reactRouterContext\.streamController\.enqueue\("(.+?)"\);/gs);
  
  if (!loaderDataMatch) {
    return products;
  }

  let fullJSON = '';
  for (const match of loaderDataMatch) {
    const jsonMatch = match.match(/enqueue\("(.+?)"\)/s);
    if (jsonMatch && jsonMatch[1]) {
      try {
        fullJSON += JSON.parse('"' + jsonMatch[1] + '"');
      } catch (e) {
        // Skip malformed chunks
      }
    }
  }

  // Extract products
  const productPattern = /"gid:\/\/shopify\/Product\/(\d+)","([^"]+)","([^"]+)"/g;
  let productMatches;
  
  while ((productMatches = productPattern.exec(fullJSON)) !== null) {
    const productId = productMatches[1];
    const titleField = productMatches[2];
    const handleField = productMatches[3];
    
    // Find corresponding image URL
    const searchStart = productMatches.index;
    const searchEnd = Math.min(searchStart + 3000, fullJSON.length);
    const productSegment = fullJSON.substring(searchStart, searchEnd);
    
    const imageMatch = productSegment.match(/"(https:\/\/cdn\.shopify\.com\/s\/files\/1\/0430\/3477\/1605\/files\/[^"]+\.jpg[^"]*?)"/);
    const altImageMatch = productSegment.match(/"(https:\/\/images\.salsify\.com\/image\/upload\/[^"]+\.jpg)"/);
    
    const imageUrl = imageMatch ? imageMatch[1] : (altImageMatch ? altImageMatch[1] : null);
    
    // Avoid duplicates
    if (!products.find(p => p.handle === handleField)) {
      products.push({
        shopifyId: productId,
        title: titleField,
        handle: handleField,
        imageUrl: imageUrl
      });
    }
  }

  return products;
}

// Fetch all pages
async function fetchAllProducts() {
  let allProducts = [];
  let page = 1;
  const maxPages = 10; // Safety limit

  console.log('🌐 Fetching all product pages...');

  while (page <= maxPages) {
    const url = page === 1 ? BASE_URL : `${BASE_URL}?page=${page}`;
    console.log(`   Page ${page}...`);

    try {
      const html = await fetchPage(url);
      const products = extractProductsFromJSON(html);

      if (products.length === 0) {
        console.log(`   No more products found on page ${page}`);
        break;
      }

      allProducts = allProducts.concat(products);
      console.log(`   Found ${products.length} products (total: ${allProducts.length})`);
      
      // Rate limiting between pages
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      page++;
    } catch (error) {
      console.log(`   Error fetching page ${page}:`, error.message);
      break;
    }
  }

  return allProducts;
}

// Download image
async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
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
    const products = await fetchAllProducts();
    console.log(`\n✅ Total products found: ${products.length}`);

    if (products.length === 0) {
      console.log('❌ No products found. Exiting.');
      return;
    }

    // Display sample
    console.log('\n📋 Sample products:');
    products.slice(0, 10).forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.title} (${p.handle})`);
    });

    // Save all products to JSON for reference
    fs.writeFileSync('comfort-zone-all-products.json', JSON.stringify(products, null, 2));
    console.log('\n💾 Saved all products to comfort-zone-all-products.json');

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
      // Try to match by product name (fuzzy)
      const dbNameClean = dbProduct.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      let matchedProduct = products.find(p => {
        const shopifyNameClean = p.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        const similarity = dbNameClean.includes(shopifyNameClean) || shopifyNameClean.includes(dbNameClean);
        
        // Also check handle keywords
        const handleKeywords = p.handle.split('-').filter(w => w.length > 3);
        const nameKeywords = dbProduct.name.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const keywordMatch = handleKeywords.some(hk => nameKeywords.some(nk => nk.includes(hk) || hk.includes(nk)));
        
        return similarity || keywordMatch;
      });

      if (matchedProduct && matchedProduct.imageUrl) {
        matchCount++;
        
        // Generate filename
        const filename = `comfort-zone-${matchedProduct.handle}.jpg`;
        const filepath = path.join(imageDir, filename);

        // Check if we already have this image
        if (fs.existsSync(filepath)) {
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
            console.log(`🔄 ${dbProduct.name} - updated database`);
          }
          continue;
        }

        // Download new image
        try {
          await downloadImage(matchedProduct.imageUrl, filepath);
          downloadCount++;
          console.log(`✅ ${dbProduct.name}`);

          // Update database
          await dbRun(`DELETE FROM product_images WHERE product_id = ?`, [dbProduct.id]);
          await dbRun(`
            INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
            VALUES (?, ?, 1, 0)
          `, [dbProduct.id, `/images/products/${filename}`]);
          updateCount++;

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 300));

        } catch (error) {
          console.log(`❌ ${dbProduct.name} - Download failed: ${error.message}`);
        }
      } else {
        console.log(`⚠️  ${dbProduct.name} - No match`);
      }
    }

    db.close();

    console.log(`\n✨ COMPLETE!`);
    console.log(`   Scraped: ${products.length} products from website`);
    console.log(`   Matched: ${matchCount}/${dbProducts.length} in database`);
    console.log(`   Downloaded: ${downloadCount} new images`);
    console.log(`   Updated: ${updateCount} database records`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
