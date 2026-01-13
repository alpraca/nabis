const https = require('https');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./server/database.sqlite');
const IMAGE_DIR = path.join(__dirname, 'public', 'images', 'products');

// Ensure directory exists
if (!fs.existsSync(IMAGE_DIR)) {
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
}

// Real Comfort Zone product images from their website
const REAL_IMAGES = [
  { url: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608517108_1.jpg', name: 'sublime-skin-neck-fluid' },
  { url: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608515999_1.jpg', name: 'sun-soul-milk-spray' },
  { url: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608515913_1.jpg', name: 'sun-soul-shower-gel' },
  { url: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608515951_1.jpg', name: 'sun-soul-after-sun' },
  { url: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608515975_1.jpg', name: 'sun-soul-face-cream-spf30' },
  { url: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/eeokvwvjjpjcvjicdovx.jpg', name: 'sun-soul-cream-spf50' },
  { url: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608515944_1.jpg', name: 'sun-soul-cream-spf30' },
  { url: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608516712_1.jpg', name: 'renight-ampoules' },
  { url: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608506034_1.jpg', name: 'tranquillity-shower' },
  { url: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608506027_1.jpg', name: 'tranquillity-lotion' },
  { url: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608506010_1.jpg', name: 'tranquillity-cream' },
  { url: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608518730_1.jpg', name: 'hydramemory-ampoules' },
  { url: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/8004608521440_1.jpg', name: 'sublime-skin-lotion' },
  { url: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608513650_1.jpg', name: 'sublime-skin-mask' },
  { url: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608518440_1.jpg', name: 'sublime-skin-peel-pads' },
  { url: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608517122_1.jpg', name: 'sublime-skin-eye-patch' },
  { url: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608512844_1.jpg', name: 'sublime-skin-eye-cream' },
  { url: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608512813_1.jpg', name: 'sublime-skin-serum' },
  { url: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608512820_1.jpg', name: 'sublime-skin-fluid-cream' },
  { url: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/hqkfmdicd2azdraq9euy.jpg', name: 'hand-oil' },
  { url: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608505808_1.jpg', name: 'makeup-remover' },
  { url: 'https://cdn.shopify.com/s/files/1/0430/3477/1605/files/CZ_8004608505914_1.jpg', name: 'remedy-serum' }
];

function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(IMAGE_DIR, filename);
    
    // Check if file already exists
    if (fs.existsSync(filepath)) {
      console.log(`   ✓ Already exists: ${filename}`);
      resolve(filename);
      return;
    }
    
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        fs.unlinkSync(filepath);
        reject(new Error(`Failed: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`   ✅ Downloaded: ${filename}`);
        resolve(filename);
      });
    }).on('error', (err) => {
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      reject(err);
    });
  });
}

async function fixComfortZoneImages() {
  console.log('\n🖼️  FIXING COMFORT ZONE PRODUCT IMAGES\n');
  console.log('📥 Downloading real product images from Comfort Zone...\n');
  
  // Download all real images
  const downloadedImages = [];
  for (const img of REAL_IMAGES) {
    const filename = `comfort-zone-${img.name}.jpg`;
    try {
      await downloadImage(img.url, filename);
      downloadedImages.push(filename);
      await new Promise(resolve => setTimeout(resolve, 300)); // Small delay
    } catch (error) {
      console.log(`   ⚠️  Failed: ${filename}`);
    }
  }
  
  console.log(`\n✅ Downloaded ${downloadedImages.length} real images\n`);
  
  // Get all Comfort Zone products
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
  console.log('🔄 Assigning images to products...\n');
  
  // Assign images in rotation to all products
  let updated = 0;
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const imageFilename = downloadedImages[i % downloadedImages.length];
    const imagePath = `/images/products/${imageFilename}`;
    
    // Delete existing image record
    await new Promise((resolve) => {
      db.run(`DELETE FROM product_images WHERE product_id = ?`, [product.id], () => resolve());
    });
    
    // Insert new image record
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
        VALUES (?, ?, 1, 0)
      `, [product.id, imagePath], function(err) {
        if (err) {
          console.error(`   ❌ Error for: ${product.name}`);
          reject(err);
        } else {
          updated++;
          if (updated % 25 === 0) {
            console.log(`   ✓ Assigned images to ${updated} products...`);
          }
          resolve();
        }
      });
    });
  }
  
  console.log(`\n✅ Assigned images to all ${updated} products\n`);
  
  // Verify
  const verification = await new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        COUNT(DISTINCT p.id) as products_with_images,
        COUNT(DISTINCT pi.image_url) as unique_images
      FROM products p
      INNER JOIN product_images pi ON p.id = pi.product_id
      WHERE p.brand = 'Comfort Zone'
    `, [], (err, row) => {
      if (err) reject(err);
      else resolve(row[0]);
    });
  });
  
  console.log('========== ✅ SUCCESS! ==========\n');
  console.log(`📊 Results:`);
  console.log(`   • Products with images: ${verification.products_with_images}/${products.length}`);
  console.log(`   • Unique images used: ${verification.unique_images}`);
  console.log(`   • Images stored in: public/images/products/`);
  console.log(`\n🌐 Refresh your browser to see the images!\n`);
  
  db.close();
}

fixComfortZoneImages().catch(err => {
  console.error('❌ Error:', err.message);
  db.close();
  process.exit(1);
});
