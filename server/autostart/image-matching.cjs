/**
 * 🎯 AUTO IMAGE MATCHING MODULE
 * Automatically matches available images to products without images
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');

function normalizeForMatching(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/\s+/g, '');
}

function getImageFiles(dir) {
  try {
    const fullPath = path.isAbsolute(dir) ? dir : path.join(__dirname, '..', '..', dir);
    if (!fs.existsSync(fullPath)) {
      return [];
    }
    return fs.readdirSync(fullPath)
      .filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
      .map(f => ({
        fullPath: path.join(fullPath, f).replace(/\\/g, '/'),
        basename: path.basename(f, path.extname(f)),
        filename: f
      }));
  } catch (err) {
    return [];
  }
}

async function autoMatchImages() {
  return new Promise(async (resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    
    console.log('🎯 Auto-matching images to products...');
    
    try {
      // Get all available images from consolidated directory only
      const publicImages = getImageFiles('public/images/products').map(img => ({
        ...img,
        url: '/images/products/' + img.filename
      }));
      
      const allImages = publicImages;
      
      if (allImages.length === 0) {
        console.log('   ℹ️  No images found to match');
        db.close();
        return resolve({ matched: 0, total: 0 });
      }
      
      // Get products without images
      const productsWithoutImages = await new Promise((resolveQuery, rejectQuery) => {
        db.all(`
          SELECT p.id, p.name, p.brand
          FROM products p
          LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.sort_order = 0
          WHERE pi.id IS NULL
          ORDER BY p.brand, p.name
        `, [], (err, rows) => {
          if (err) rejectQuery(err);
          else resolveQuery(rows || []);
        });
      });
      
      if (productsWithoutImages.length === 0) {
        console.log('   ✅ All products already have images');
        db.close();
        return resolve({ matched: 0, total: 0 });
      }
      
      console.log(`   📦 Found ${productsWithoutImages.length} products without images`);
      console.log(`   🖼️  Available images: ${allImages.length}`);
      
      const usedImages = new Set();
      let matched = 0;
      
      for (const product of productsWithoutImages) {
        const productNormalized = normalizeForMatching(product.name);
        const brandNormalized = normalizeForMatching(product.brand || '');
        const productWords = product.name.toLowerCase().split(/[\s\-_]+/).filter(w => w.length > 2);
        
        let bestMatch = null;
        let bestScore = 0;
        
        for (const image of allImages) {
          if (usedImages.has(image.url)) continue;
          
          const imageNormalized = normalizeForMatching(image.basename);
          let score = 0;
          
          // Exact match (very high score)
          if (imageNormalized === productNormalized) {
            score = 1000;
          }
          // Brand + product match
          else if (imageNormalized.includes(brandNormalized) && 
                   productWords.some(word => imageNormalized.includes(normalizeForMatching(word)))) {
            score = 500;
          }
          // Multiple word matches (more words = better match)
          else {
            const matchingWords = productWords.filter(word => 
              imageNormalized.includes(normalizeForMatching(word))
            );
            score = matchingWords.length * 100;
            
            // Bonus if brand also matches
            if (brandNormalized && imageNormalized.includes(brandNormalized)) {
              score += 200;
            }
          }
          
          if (score > bestScore && score >= 200) { // Increased minimum score from 100 to 200
            bestScore = score;
            bestMatch = image;
          }
        }
        
        if (bestMatch) {
          await new Promise((resolveInsert, rejectInsert) => {
            db.run(`
              INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
              VALUES (?, ?, 1, 0)
            `, [product.id, bestMatch.url], (err) => {
              if (err) {
                rejectInsert(err);
              } else {
                usedImages.add(bestMatch.url);
                matched++;
                resolveInsert();
              }
            });
          });
        }
      }
      
      console.log(`   ✅ Auto-matched ${matched} images to products`);
      db.close();
      resolve({ matched, total: productsWithoutImages.length });
      
    } catch (error) {
      db.close();
      reject(error);
    }
  });
}

module.exports = { autoMatchImages };
