/**
 * 🗂️ IMAGE CONSOLIDATION MODULE
 * Consolidates all images into one location and fixes duplicate assignments
 * PERMANENT SOLUTION - Runs automatically on server start
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const CONSOLIDATED_DIR = path.join(__dirname, '..', '..', 'public', 'images', 'products');

// Source directories to consolidate from
const SOURCE_DIRS = [
  path.join(__dirname, '..', 'uploads', 'images'),
  path.join(__dirname, '..', 'uploads', 'products'),
  path.join(__dirname, '..', 'uploads', 'hero')
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getImageHash(filepath) {
  try {
    const content = fs.readFileSync(filepath);
    return crypto.createHash('md5').update(content).digest('hex');
  } catch (err) {
    return null;
  }
}

function getAllImages(dir) {
  try {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
      .filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
      .map(f => ({
        filename: f,
        fullPath: path.join(dir, f),
        hash: null
      }));
  } catch (err) {
    return [];
  }
}

async function consolidateImages() {
  return new Promise(async (resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    
    console.log('🗂️  Consolidating images...');
    
    try {
      // Ensure consolidated directory exists
      ensureDir(CONSOLIDATED_DIR);
      
      // Get all existing images in consolidated directory
      const existingImages = getAllImages(CONSOLIDATED_DIR);
      const existingHashes = new Map();
      
      for (const img of existingImages) {
        const hash = getImageHash(img.fullPath);
        if (hash) {
          existingHashes.set(hash, img.filename);
        }
      }
      
      console.log(`   📁 Consolidated directory: ${existingImages.length} images`);
      
      // Collect all images from source directories
      let copied = 0;
      let skipped = 0;
      const imageMap = new Map(); // oldPath -> newFilename
      
      for (const sourceDir of SOURCE_DIRS) {
        if (!fs.existsSync(sourceDir)) continue;
        
        const sourceImages = getAllImages(sourceDir);
        
        for (const img of sourceImages) {
          const hash = getImageHash(img.fullPath);
          if (!hash) continue;
          
          // Check if we already have this image (by hash)
          if (existingHashes.has(hash)) {
            const existingFilename = existingHashes.get(hash);
            imageMap.set(img.fullPath, existingFilename);
            skipped++;
          } else {
            // Copy to consolidated directory
            const destPath = path.join(CONSOLIDATED_DIR, img.filename);
            
            // Handle filename conflicts
            let finalFilename = img.filename;
            let counter = 1;
            while (fs.existsSync(path.join(CONSOLIDATED_DIR, finalFilename))) {
              const ext = path.extname(img.filename);
              const base = path.basename(img.filename, ext);
              finalFilename = `${base}-${counter}${ext}`;
              counter++;
            }
            
            const finalPath = path.join(CONSOLIDATED_DIR, finalFilename);
            fs.copyFileSync(img.fullPath, finalPath);
            existingHashes.set(hash, finalFilename);
            imageMap.set(img.fullPath, finalFilename);
            copied++;
          }
        }
      }
      
      console.log(`   ✅ Copied ${copied} new images, skipped ${skipped} duplicates`);
      
      resolve({ copied, skipped, total: existingImages.length + copied });
      db.close();
      
    } catch (error) {
      db.close();
      reject(error);
    }
  });
}

async function fixDuplicateAssignments() {
  return new Promise(async (resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    
    console.log('🔧 Fixing duplicate image assignments...');
    
    try {
      // Find all images shared by multiple products
      const sharedImages = await new Promise((resolveQuery, rejectQuery) => {
        db.all(`
          SELECT image_url, GROUP_CONCAT(product_id) as product_ids, COUNT(*) as count
          FROM product_images
          WHERE sort_order = 0
          GROUP BY image_url
          HAVING count > 1
          ORDER BY count DESC
        `, [], (err, rows) => {
          if (err) rejectQuery(err);
          else resolveQuery(rows || []);
        });
      });
      
      if (sharedImages.length === 0) {
        console.log('   ✅ No duplicate assignments found');
        db.close();
        return resolve({ fixed: 0 });
      }
      
      console.log(`   📦 Found ${sharedImages.length} images shared by multiple products`);
      
      // Get all available images
      const availableImages = getAllImages(CONSOLIDATED_DIR);
      const availableFilenames = availableImages.map(img => img.filename);
      
      // For each shared image, keep it for the first product and assign different images to others
      let fixed = 0;
      const usedImages = new Set();
      
      for (const shared of sharedImages) {
        const productIds = shared.product_ids.split(',').map(id => parseInt(id));
        const imageUrl = shared.image_url;
        
        // Keep original image for first product
        usedImages.add(path.basename(imageUrl));
        
        // For remaining products, try to find better matches
        for (let i = 1; i < productIds.length; i++) {
          const productId = productIds[i];
          
          // Get product info
          const product = await new Promise((resolveQuery, rejectQuery) => {
            db.get(`
              SELECT id, name, brand FROM products WHERE id = ?
            `, [productId], (err, row) => {
              if (err) rejectQuery(err);
              else resolveQuery(row);
            });
          });
          
          if (!product) continue;
          
          // Try to find a better matching image
          const productNormalized = product.name.toLowerCase().replace(/[^a-z0-9]/g, '');
          const brandNormalized = (product.brand || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          
          // For Comfort Zone products, use stricter matching
          const isComfortZone = product.brand && product.brand.toLowerCase().includes('comfort zone');
          const productWords = product.name.toLowerCase()
            .replace(/comfort\s*zone/gi, '')
            .split(/[\s\-_]+/)
            .filter(w => w.length > 3);
          
          let bestMatch = null;
          let bestScore = 0;
          
          for (const availableImg of availableImages) {
            if (usedImages.has(availableImg.filename)) continue;
            
            const imgNormalized = availableImg.filename.toLowerCase().replace(/[^a-z0-9]/g, '');
            let score = 0;
            
            if (isComfortZone && availableImg.filename.toLowerCase().startsWith('comfort-zone')) {
              // Strict matching for Comfort Zone
              const matchingWords = productWords.filter(word => {
                const wordNorm = word.replace(/[^a-z0-9]/g, '');
                return wordNorm.length > 3 && imgNormalized.includes(wordNorm);
              });
              score = matchingWords.length * 150;
              if (matchingWords.length >= 2) score += 300;
            } else {
              // Regular matching for other brands
              // Check for brand match
              if (brandNormalized && imgNormalized.includes(brandNormalized.replace(/\s+/g, ''))) {
                score += 100;
              }
              
              // Check for product name words
              const matchingWords = productWords.filter(word => imgNormalized.includes(word));
              score += matchingWords.length * 50;
            }
            
            if (score > bestScore) {
              bestScore = score;
              bestMatch = availableImg;
            }
          }
          
          // Increased minimum score requirement
          const minScore = isComfortZone ? 300 : 50;
          
          if (bestMatch && bestScore >= minScore) {
            // Update product to use new image
            await new Promise((resolveUpdate, rejectUpdate) => {
              db.run(`
                UPDATE product_images
                SET image_url = ?
                WHERE product_id = ? AND sort_order = 0
              `, [`/images/products/${bestMatch.filename}`, productId], (err) => {
                if (err) rejectUpdate(err);
                else resolveUpdate();
              });
            });
            
            usedImages.add(bestMatch.filename);
            fixed++;
          } else if (!isComfortZone) {
            // For non-Comfort Zone, assign any unused image
            const unusedImage = availableImages.find(img => !usedImages.has(img.filename));
            if (unusedImage) {
              await new Promise((resolveUpdate, rejectUpdate) => {
                db.run(`
                  UPDATE product_images
                  SET image_url = ?
                  WHERE product_id = ? AND sort_order = 0
                `, [`/images/products/${unusedImage.filename}`, productId], (err) => {
                  if (err) rejectUpdate(err);
                  else resolveUpdate();
                });
              });
              
              usedImages.add(unusedImage.filename);
              fixed++;
            }
          }
        }
      }
      
      console.log(`   ✅ Fixed ${fixed} duplicate assignments`);
      db.close();
      resolve({ fixed });
      
    } catch (error) {
      db.close();
      reject(error);
    }
  });
}

async function updateAllReferences() {
  return new Promise(async (resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    
    console.log('🔄 Updating database references...');
    
    try {
      // Update all /uploads/* references to /images/products/*
      const updated = await new Promise((resolveUpdate, rejectUpdate) => {
        db.run(`
          UPDATE product_images
          SET image_url = '/images/products/' || SUBSTR(image_url, INSTR(image_url, '/') + 
            CASE 
              WHEN image_url LIKE '/uploads/images/%' THEN LENGTH('/uploads/images')
              WHEN image_url LIKE '/uploads/products/%' THEN LENGTH('/uploads/products')
              WHEN image_url LIKE '/uploads/hero/%' THEN LENGTH('/uploads/hero')
              ELSE 0
            END
          )
          WHERE image_url LIKE '/uploads/%'
        `, [], function(err) {
          if (err) rejectUpdate(err);
          else resolveUpdate(this.changes);
        });
      });
      
      console.log(`   ✅ Updated ${updated} references to consolidated location`);
      db.close();
      resolve({ updated });
      
    } catch (error) {
      db.close();
      reject(error);
    }
  });
}

async function autoConsolidateImages() {
  try {
    const consolidateResult = await consolidateImages();
    const fixResult = await fixDuplicateAssignments();
    const updateResult = await updateAllReferences();
    
    return {
      success: true,
      consolidated: consolidateResult,
      fixed: fixResult,
      updated: updateResult
    };
  } catch (error) {
    console.error('   ❌ Consolidation error:', error.message);
    throw error;
  }
}

module.exports = { autoConsolidateImages };
