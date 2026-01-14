const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database('./server/database.sqlite');

function normalizeForMatching(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/\s+/g, '');
}

function getImageFiles(dir) {
  try {
    return fs.readdirSync(dir)
      .filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
      .map(f => ({
        fullPath: path.join(dir, f).replace(/\\/g, '/'),
        basename: path.basename(f, path.extname(f)),
        filename: f
      }));
  } catch (err) {
    return [];
  }
}

async function aggressiveMatch() {
  console.log('\n🚀 AGGRESSIVE IMAGE MATCHING FOR ALL 2178 PRODUCTS\n');
  
  // Get all image files
  const publicImages = getImageFiles('public/images/products').map(img => ({
    ...img,
    url: '/images/products/' + img.filename
  }));
  const uploadsImages = getImageFiles('server/uploads/images').map(img => ({
    ...img,
    url: '/uploads/images/' + img.filename
  }));
  const uploadsProducts = getImageFiles('server/uploads/products').map(img => ({
    ...img,
    url: '/uploads/products/' + img.filename
  }));
  
  const allImages = [...publicImages, ...uploadsImages, ...uploadsProducts];
  
  console.log(`📁 Total images available: ${allImages.length}\n`);
  
  // Get ALL products
  const allProducts = await new Promise((resolve, reject) => {
    db.all(`
      SELECT p.id, p.name, p.brand, pi.id as has_image
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.sort_order = 0
      ORDER BY p.brand, p.name
    `, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
  
  console.log(`🔍 Total products: ${allProducts.length}`);
  console.log(`   • With images: ${allProducts.filter(p => p.has_image).length}`);
  console.log(`   • Without images: ${allProducts.filter(p => !p.has_image).length}\n`);
  
  // Create a map of already used images
  const usedImages = new Set();
  
  let matched = 0;
  let skipped = 0;
  
  for (const product of allProducts) {
    if (product.has_image) {
      skipped++;
      continue;
    }
    
    const productNormalized = normalizeForMatching(product.name);
    const brandNormalized = normalizeForMatching(product.brand || '');
    const productWords = product.name.toLowerCase().split(/[\s\-_]+/).filter(w => w.length > 2);
    
    let bestMatch = null;
    let bestScore = 0;
    
    for (const img of allImages) {
      if (usedImages.has(img.url)) continue;
      
      const imgNormalized = normalizeForMatching(img.basename);
      const imgWords = img.basename.toLowerCase().split(/[\s\-_]+/).filter(w => w.length > 2);
      
      let score = 0;
      
      // Perfect match
      if (imgNormalized === productNormalized) {
        score = 100;
      }
      // Image contains full product name
      else if (imgNormalized.includes(productNormalized)) {
        score = 90;
      }
      // Product contains full image name
      else if (productNormalized.includes(imgNormalized)) {
        score = 85;
      }
      // Brand match
      else if (brandNormalized && imgNormalized.startsWith(brandNormalized)) {
        // Count matching words
        const matchingWords = productWords.filter(w => 
          imgNormalized.includes(normalizeForMatching(w))
        ).length;
        
        if (matchingWords >= 3) score = 75;
        else if (matchingWords === 2) score = 60;
        else if (matchingWords === 1) score = 45;
      }
      // Partial word matching (no brand requirement)
      else {
        const matchingWords = productWords.filter(w => 
          w.length > 3 && imgNormalized.includes(normalizeForMatching(w))
        ).length;
        
        if (matchingWords >= 4) score = 70;
        else if (matchingWords >= 3) score = 55;
        else if (matchingWords >= 2) score = 40;
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = img;
      }
    }
    
    // Lower threshold to 35 to match more products
    if (bestMatch && bestScore >= 35) {
      try {
        await new Promise((resolve, reject) => {
          db.run(`
            INSERT INTO product_images (product_id, image_url, sort_order, is_primary)
            VALUES (?, ?, 0, 1)
          `, [product.id, bestMatch.url], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        
        usedImages.add(bestMatch.url);
        matched++;
        console.log(`   ✅ ${product.brand?.substring(0, 18).padEnd(18)} - ${product.name.substring(0, 45)}`);
        console.log(`      → ${bestMatch.basename.substring(0, 60)} (${bestScore})`);
      } catch (err) {
        // Skip errors
      }
    }
  }
  
  console.log(`\n========== ✅ COMPLETE ==========\n`);
  console.log(`   • Total products: ${allProducts.length}`);
  console.log(`   • Already had images: ${skipped}`);
  console.log(`   • New matches: ${matched}`);
  console.log(`   • Total with images now: ${skipped + matched}`);
  console.log(`   • Remaining without images: ${allProducts.length - skipped - matched}`);
  console.log(`\n🎉 Image matching complete!\n`);
  
  db.close();
}

aggressiveMatch().catch(err => {
  console.error('❌ Error:', err.message);
  db.close();
  process.exit(1);
});
