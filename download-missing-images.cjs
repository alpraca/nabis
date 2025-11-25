const sqlite3 = require('sqlite3').verbose();
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const dbPath = './server/database.sqlite';
const excelPath = './products.xlsx';
const imagesDir = './server/uploads/images';

// Ensure images directory exists
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

// Download image from URL
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
        fileStream.on('error', (err) => {
          fs.unlink(filepath, () => {}); // Delete failed download
          reject(err);
        });
      } else {
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Generate safe filename from product details
function generateFilename(brand, productName, imageUrl) {
  // Get extension from URL
  const urlExt = path.extname(new URL(imageUrl).pathname);
  const ext = urlExt || '.jpg';
  
  // Create safe filename from brand and product name
  const safeBrand = brand.replace(/[^a-zA-Z0-9]/g, '_');
  const safeName = productName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
  
  return `${safeBrand}_${safeName}${ext}`;
}

// Get product by name and brand
function getProductByNameAndBrand(name, brand) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT id FROM products WHERE name = ? AND brand = ?`,
      [name, brand],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
}

// Check if product has images
function productHasImages(productId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT COUNT(*) as count FROM product_images WHERE product_id = ?`,
      [productId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row.count > 0);
      }
    );
  });
}

// Insert product image
function insertProductImage(productId, imagePath) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO product_images (product_id, image_path, is_primary, created_at) 
       VALUES (?, ?, 1, datetime('now'))`,
      [productId, imagePath],
      function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

async function processProducts() {
  console.log('============================================================');
  console.log('📥 DOWNLOADING MISSING PRODUCT IMAGES');
  console.log('============================================================\n');

  // Read Excel file
  console.log(`📖 Reading Excel file: ${path.resolve(excelPath)}`);
  const workbook = xlsx.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet);
  
  console.log(`✅ Found ${data.length} products in Excel file\n`);

  let imagesDownloaded = 0;
  let imageErrors = 0;
  let productsSkipped = 0;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const productName = row['Product Name']?.trim();
    const brand = row['Brand']?.trim();
    const imageUrl = row['Image URL']?.trim();

    if (!productName || !brand) {
      continue;
    }

    try {
      // Check if product exists
      const product = await getProductByNameAndBrand(productName, brand);
      
      if (!product) {
        continue; // Product not in database, skip
      }

      // Check if product already has images
      const hasImages = await productHasImages(product.id);
      
      if (hasImages) {
        productsSkipped++;
        continue; // Already has images, skip
      }

      // Product exists but has no images - download image
      console.log(`📥 Downloading image for: ${productName}`);

      if (!imageUrl) {
        console.log(`   ⚠️  No image URL provided`);
        imageErrors++;
        continue;
      }

      // Generate filename and path
      const filename = generateFilename(brand, productName, imageUrl);
      const filepath = path.join(imagesDir, filename);
      const dbPath = `/uploads/images/${filename}`;

      // Check if file already exists
      if (fs.existsSync(filepath)) {
        console.log(`   ✅ Image file already exists, linking to product`);
      } else {
        // Download image
        try {
          await downloadImage(imageUrl, filepath);
          console.log(`   ✅ Downloaded: ${filename}`);
        } catch (downloadErr) {
          console.log(`   ❌ Download failed: ${downloadErr.message}`);
          imageErrors++;
          continue;
        }
      }

      // Insert into product_images table
      await insertProductImage(product.id, dbPath);
      imagesDownloaded++;

      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`❌ Error processing "${productName}": ${error.message}`);
      imageErrors++;
    }
  }

  console.log('\n============================================================');
  console.log('📊 DOWNLOAD SUMMARY');
  console.log('============================================================');
  console.log(`✅ Images Downloaded & Linked: ${imagesDownloaded}`);
  console.log(`⏭️  Products Already Had Images: ${productsSkipped}`);
  console.log(`⚠️  Image Errors: ${imageErrors}`);
  console.log(`📦 Total Processed: ${data.length}`);

  db.close();
}

processProducts().catch(console.error);
