/**
 * ONE-TIME PERMANENT FIX for duplicate image assignments
 * After this runs, the database will be clean forever
 */

const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

// Connect to database
const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Promisify database methods
const dbAll = promisify(db.all.bind(db));
const dbRun = promisify(db.run.bind(db));

async function run() {
  console.log('\n🔧 PERMANENT DUPLICATE FIX\n');
  console.log('This will permanently fix all duplicate assignments in the database.');
  console.log('After this, autostart will only validate, not fix.\n');

  // Get all products with their images
  const products = await dbAll(`
    SELECT p.id, p.name, p.brand, pi.image_url
    FROM products p
    LEFT JOIN product_images pi ON p.id = pi.product_id
    ORDER BY p.id, pi.image_url
  `);

  // Group by image
  const imageToProducts = {};
  products.forEach(p => {
    if (p.image_url) {
      if (!imageToProducts[p.image_url]) {
        imageToProducts[p.image_url] = [];
      }
      imageToProducts[p.image_url].push(p);
    }
  });

  // Find duplicates
  const duplicates = Object.entries(imageToProducts).filter(([img, prods]) => prods.length > 1);

  console.log(`📦 Found ${duplicates.length} images shared by multiple products\n`);

  if (duplicates.length === 0) {
    console.log('✅ No duplicates found! Database is already clean.\n');
    db.close();
    process.exit(0);
  }

  let fixed = 0;

  // Comfort Zone intelligent matching logic
  function getBestMatch(imagePath, products) {
    const imageName = path.basename(imagePath, path.extname(imagePath))
      .toLowerCase()
      .replace(/-/g, ' ');
    
    const scores = products.map(p => {
      const productName = (p.name || '').toLowerCase();
      const brand = (p.brand || '').toLowerCase();
      let score = 0;
      
      // Exact brand match required for Comfort Zone
      if (brand === 'comfort zone' || brand === 'comfort-zone') {
        if (!imageName.includes('comfort') || !imageName.includes('zone')) {
          return { product: p, score: 0 }; // Not a Comfort Zone image
        }
        score += 100; // Brand match bonus
      }
      
      // Count matching words
      const productWords = productName.split(/\s+/).filter(w => w.length > 3);
      const imageWords = imageName.split(/\s+/);
      
      let matchingWords = 0;
      productWords.forEach(pw => {
        if (imageWords.some(iw => iw.includes(pw) || pw.includes(iw))) {
          matchingWords++;
          score += 50;
        }
      });
      
      // Comfort Zone requires at least 2 matching product words
      if ((brand === 'comfort zone' || brand === 'comfort-zone') && matchingWords < 2) {
        score = 0;
      }
      
      return { product: p, score };
    });
    
    scores.sort((a, b) => b.score - a.score);
    return scores[0].score > 0 ? scores[0].product : products[0];
  }

  // Fix each duplicate
  for (const [imagePath, prods] of duplicates) {
    const bestMatch = getBestMatch(imagePath, prods);
    const otherProducts = prods.filter(p => p.id !== bestMatch.id);
    
    console.log(`🔧 Image: ${path.basename(imagePath)}`);
    console.log(`   ✅ Keeping for: ${bestMatch.name} (${bestMatch.brand})`);
    
    // Remove this image from other products
    for (const p of otherProducts) {
      await dbRun('DELETE FROM product_images WHERE product_id = ? AND image_url = ?', [p.id, imagePath]);
      console.log(`   ❌ Removed from: ${p.name}`);
      fixed++;
    }
    
    console.log('');
  }

  console.log(`✅ Fixed ${fixed} duplicate assignments permanently\n`);
  console.log('🎯 Database is now clean. Autostart will only validate from now on.\n');

  db.close();
}

run().catch(err => {
  console.error('Error:', err);
  db.close();
  process.exit(1);
});
