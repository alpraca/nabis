const XLSX = require('xlsx');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

// Database connection
const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Excel file path
const excelPath = path.join(__dirname, 'products.xlsx');

// Images directory
const imagesDir = path.join(__dirname, 'server', 'uploads', 'images');

// Create images directory if it doesn't exist
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Category mapping
const categoryMap = {
  'ilace': 'Ilaçe',
  'ilac': 'Ilaçe',
  'medicine': 'Ilaçe',
  'suplementa': 'Suplementa',
  'supplement': 'Suplementa',
  'kozmetike': 'Kozmetikë',
  'kozmetik': 'Kozmetikë',
  'cosmetic': 'Kozmetikë',
  'vitamin': 'Vitamin',
  'kujdes femijesh': 'Kujdes Fëmijësh',
  'child care': 'Kujdes Fëmijësh',
  'baby': 'Kujdes Fëmijësh',
  'te tjera': 'Të tjera',
  'other': 'Të tjera'
};

function normalizeCategory(category) {
  if (!category) return 'Të tjera';
  const normalized = category.toString().toLowerCase().trim();
  return categoryMap[normalized] || 'Të tjera';
}

// Download image from URL
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    if (!url || url === 'N/A') {
      resolve(null);
      return;
    }

    const filepath = path.join(imagesDir, filename);
    
    // Check if file already exists
    if (fs.existsSync(filepath)) {
      console.log(`   ⏭️  Image already exists: ${filename}`);
      resolve(`/uploads/images/${filename}`);
      return;
    }

    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filepath);

    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        fs.unlinkSync(filepath);
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve(`/uploads/images/${filename}`);
      });

      file.on('error', (err) => {
        fs.unlinkSync(filepath);
        reject(err);
      });
    }).on('error', (err) => {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      reject(err);
    });
  });
}

// Generate safe filename
function generateFilename(productName, brand) {
  const safeName = productName
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 50);
  const safeBrand = brand
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 20);
  return `${safeBrand}_${safeName}.jpg`;
}

// Check if product exists
function checkProductExists(name) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT id FROM products WHERE LOWER(name) = LOWER(?)',
      [name.trim()],
      (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.id : null);
      }
    );
  });
}

// Insert product
function insertProduct(product) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO products (
        name, description, price, brand, category, subcategory,
        stock_quantity, is_new, on_sale, original_price,
        in_stock, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))`,
      [
        product.name,
        product.description || 'Përshkrim i produktit',
        product.price,
        product.brand || 'N/A',
        normalizeCategory(product.category),
        product.subcategory || null,
        product.stock_quantity || 50,
        product.is_new || 0,
        product.on_sale || 0,
        product.original_price || null
      ],
      function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

// Insert product image
function insertProductImage(productId, imageUrl) {
  return new Promise((resolve, reject) => {
    if (!imageUrl) {
      resolve();
      return;
    }

    db.run(
      `INSERT INTO product_images (product_id, image_url, is_primary, sort_order, created_at)
       VALUES (?, ?, 1, 0, datetime('now'))`,
      [productId, imageUrl],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

// Main import function
async function importProductsWithImages() {
  console.log('='.repeat(60));
  console.log('📦 EXCEL PRODUCTS IMPORT WITH IMAGE DOWNLOAD');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Read Excel file
    console.log('📖 Reading Excel file:', excelPath);
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`✅ Found ${data.length} products in Excel file`);
    console.log('');

    let addedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    let imageDownloadedCount = 0;
    let imageErrorCount = 0;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      const productName = row['Name'] || row['name'] || row['Product Name'] || row['Emri'];
      
      if (!productName) {
        console.log(`⚠️  Row ${i + 1}: Skipping - No product name`);
        skippedCount++;
        continue;
      }

      try {
        // Check if product already exists
        const existingId = await checkProductExists(productName);
        
        if (existingId) {
          console.log(`⏭️  Skipping "${productName}" - Already exists (ID: ${existingId})`);
          skippedCount++;
          continue;
        }

        // Parse price
        let price = row['Price'] || row['price'] || row['Çmimi'] || row['Cmimi'] || 0;
        if (typeof price === 'string') {
          price = parseFloat(price.replace(/[^\d.]/g, '')) || 0;
        }
        price = Math.round(price * 100);

        // Prepare product object
        const product = {
          name: productName.trim(),
          description: row['Description'] || row['description'] || row['Përshkrimi'] || 'Përshkrim i produktit',
          price: price,
          brand: row['Brand'] || row['brand'] || row['Marka'] || 'N/A',
          category: row['Category'] || row['category'] || row['Kategoria'] || 'Të tjera',
          subcategory: row['Subcategory'] || row['subcategory'] || null,
          stock_quantity: parseInt(row['Stock'] || row['stock'] || row['Stoku'] || 50),
          is_new: 0,
          on_sale: 0,
          original_price: null
        };

        // Insert product
        const productId = await insertProduct(product);
        console.log(`✅ Added: "${productName}" (ID: ${productId})`);
        addedCount++;

        // Download and insert image
        const imageUrl = row['Image'] || row['image'] || row['Image URL'] || row['Foto'];
        
        if (imageUrl && imageUrl !== 'N/A') {
          try {
            const filename = generateFilename(product.name, product.brand);
            console.log(`   📥 Downloading image from: ${imageUrl}`);
            
            const localImagePath = await downloadImage(imageUrl, filename);
            
            if (localImagePath) {
              await insertProductImage(productId, localImagePath);
              console.log(`   ✅ Image saved: ${filename}`);
              imageDownloadedCount++;
            }
          } catch (imgErr) {
            console.log(`   ⚠️  Image download failed: ${imgErr.message}`);
            imageErrorCount++;
          }
        } else {
          console.log(`   ⚠️  No image URL provided`);
        }

      } catch (err) {
        console.error(`❌ Error processing "${productName}":`, err.message);
        errorCount++;
      }

      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('📊 IMPORT SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Products Added: ${addedCount}`);
    console.log(`⏭️  Products Skipped: ${skippedCount}`);
    console.log(`❌ Product Errors: ${errorCount}`);
    console.log(`📥 Images Downloaded: ${imageDownloadedCount}`);
    console.log(`⚠️  Image Errors: ${imageErrorCount}`);
    console.log(`📦 Total Processed: ${data.length}`);
    console.log('');

    db.close();

  } catch (error) {
    console.error('❌ Fatal Error:', error.message);
    db.close();
    process.exit(1);
  }
}

// Run import
importProductsWithImages();
