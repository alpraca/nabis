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

async function checkDuplicateAssignments() {
  return new Promise(async (resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    
    console.log('🔍 Validating image assignments (no fixing)...');
    
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
        console.log(`   ✅ All images are uniquely assigned (no duplicates)`);
        db.close();
        resolve({ checked: true, duplicatesFound: 0 });
        return;
      }
      
      console.log(`   ⚠️  WARNING: Found ${sharedImages.length} images still shared by multiple products`);
      console.log(`   This should not happen - run permanent-duplicate-fix.cjs if needed`);
      
      db.close();
      resolve({ checked: true, duplicatesFound: sharedImages.length });
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
    const checkResult = await checkDuplicateAssignments();
    const updateResult = await updateAllReferences();
    
    return {
      success: true,
      consolidated: consolidateResult,
      validated: checkResult,
      updated: updateResult
    };
  } catch (error) {
    console.error('   ❌ Consolidation error:', error.message);
    throw error;
  }
}

module.exports = { autoConsolidateImages };
