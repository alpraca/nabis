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
      .map(f => path.join(dir, f).replace(/\\/g, '/'));
  } catch (err) {
    return [];
  }
}

async function matchAllImages() {
  console.log('\n🔍 SCANNING ALL IMAGE FILES...\n');
  
  // Get all image files from all three locations
  const publicImages = getImageFiles('public/images/products');
  const uploadsImages = getImageFiles('server/uploads/images');
  const uploadsProducts = getImageFiles('server/uploads/products');
  
  console.log(`📁 Found image files:`);
  console.log(`   • public/images/products/: ${publicImages.length}`);
  console.log(`   • server/uploads/images/: ${uploadsImages.length}`);
  console.log(`   • server/uploads/products/: ${uploadsProducts.length}`);
  console.log(`   • TOTAL: ${publicImages.length + uploadsImages.length + uploadsProducts.length}\n`);
  
  // Get products without images
  const productsWithoutImages = await new Promise((resolve, reject) => {
    db.all(`
      SELECT p.id, p.name, p.brand
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.sort_order = 0
      WHERE pi.id IS NULL
      ORDER BY p.brand, p.name
    `, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
  
  console.log(`🔍 Products without images: ${productsWithoutImages.length}\n`);
  
  if (productsWithoutImages.length === 0) {
    console.log('✅ All products already have images!\n');
    db.close();
    return;
  }
  
  // Combine all image files with their web paths
  const allImages = [
    ...publicImages.map(f => ({
      file: f,
      url: '/images/products/' + path.basename(f),
      basename: path.basename(f, path.extname(f))
    })),
    ...uploadsImages.map(f => ({
      file: f,
      url: '/uploads/images/' + path.basename(f),
      basename: path.basename(f, path.extname(f))
    })),
    ...uploadsProducts.map(f => ({
      file: f,
      url: '/uploads/products/' + path.basename(f),
      basename: path.basename(f, path.extname(f))
    }))
  ];
  
  console.log(`🎯 Matching images to products...\n`);
  
  let matched = 0;
  let inserted = 0;
  
  for (const product of productsWithoutImages) {
    const productNormalized = normalizeForMatching(product.name);
    const brandNormalized = normalizeForMatching(product.brand || '');
    
    // Find best matching image
    let bestMatch = null;
    let bestScore = 0;
    
    for (const img of allImages) {
      const imgNormalized = normalizeForMatching(img.basename);
      
      let score = 0;
      
      // Exact match - highest score
      if (imgNormalized === productNormalized) {
        score = 100;
      }
      // Contains product name
      else if (imgNormalized.includes(productNormalized)) {
        score = 80;
      }
      // Product name contains image name
      else if (productNormalized.includes(imgNormalized)) {
        score = 70;
      }
      // Brand match + partial name match
      else if (brandNormalized && imgNormalized.includes(brandNormalized)) {
        // Count matching words
        const productWords = product.name.toLowerCase().split(/\s+/);
        const matchingWords = productWords.filter(w => 
          w.length > 3 && imgNormalized.includes(normalizeForMatching(w))
        ).length;
        
        if (matchingWords >= 2) {
          score = 60 + (matchingWords * 5);
        } else if (matchingWords === 1) {
          score = 40;
        }
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = img;
      }
    }
    
    // Only assign if we have a decent match (score > 50)
    if (bestMatch && bestScore > 50) {
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
        
        matched++;
        inserted++;
        console.log(`   ✅ ${product.brand?.substring(0, 20).padEnd(20)} - ${product.name.substring(0, 50)}`);
        console.log(`      → ${bestMatch.basename.substring(0, 70)} (score: ${bestScore})`);
      } catch (err) {
        // Skip if image already assigned
      }
    }
  }
  
  console.log(`\n========== ✅ COMPLETE ==========\n`);
  console.log(`   • Products without images: ${productsWithoutImages.length}`);
  console.log(`   • New matches found: ${matched}`);
  console.log(`   • Images inserted: ${inserted}`);
  console.log(`   • Remaining without images: ${productsWithoutImages.length - matched}`);
  console.log(`\n🌐 All available images have been matched!\n`);
  
  db.close();
}

matchAllImages().catch(err => {
  console.error('❌ Error:', err.message);
  db.close();
  process.exit(1);
});
