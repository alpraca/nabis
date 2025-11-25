const XLSX = require('xlsx');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const https = require('https');
const http = require('http');
const fs = require('fs');

// Database connection
const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Excel file path
const excelPath = path.join(__dirname, 'products.xlsx');

// Images directory
const imagesDir = path.join(__dirname, 'server', 'uploads', 'images');

// Ensure images directory exists
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Category mapping
const categoryMap = {
  'dermokozmetikë': 'Kozmetikë',
  'dermokozmetike': 'Kozmetikë',
  'kozmetikë': 'Kozmetikë',
  'kozmetike': 'Kozmetikë',
  'suplemente': 'Suplementa',
  'vitamin': 'Vitamin',
  'vitamina': 'Vitamin',
  'ilaçe': 'Ilaçe',
  'ilace': 'Ilaçe',
  'mama dhe bebe': 'Kujdes Fëmijësh',
  'kujdes fëmijësh': 'Kujdes Fëmijësh',
  'kujdes femijesh': 'Kujdes Fëmijësh',
  'bebe': 'Kujdes Fëmijësh'
};

function normalizeCategory(category) {
  if (!category) return 'Të tjera';
  const normalized = category.toString().toLowerCase().trim();
  return categoryMap[normalized] || 'Të tjera';
}

// Download image from URL
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(imagesDir, filename);
    
    // Check if file already exists
    if (fs.existsSync(filepath)) {
      resolve(`/uploads/images/${filename}`);
      return;
    }

    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve(`/uploads/images/${filename}`);
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });
    }).on('error', reject);
  });
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
        stock_quantity, is_new, on_sale, in_stock,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 1, datetime('now'), datetime('now'))`,
      [
        product.name,
        product.description,
        product.price,
        product.brand,
        product.category,
        product.subcategory,
        product.stock_quantity
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
    db.run(
      `INSERT INTO product_images (product_id, image_url, is_primary, sort_order, created_at)
       VALUES (?, ?, 1, 0, datetime('now'))`,
      [productId, imageUrl],
      function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
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
    let imageDownloadCount = 0;

    // Process each product
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const productName = row['Name'];
      
      if (!productName) {
        console.log(`⚠️  Row ${i + 1}: Skipping - No product name`);
        skippedCount++;
        continue;
      }

      try {
        // Check if product already exists
        const existingId = await checkProductExists(productName);
        
        if (existingId) {
          console.log(`⏭️  "${productName}" - Already exists`);
          skippedCount++;
          continue;
        }

        // Parse price
        let price = row['Price'] || '0';
        if (typeof price === 'string') {
          price = parseFloat(price.replace(/[^\d.]/g, '')) || 0;
        }
        price = Math.round(price * 100);

        // Extract brand from name or default to N/A
        const nameParts = productName.split(' ');
        const brand = nameParts[0] || 'N/A';

        // Prepare product object
        const product = {
          name: productName.trim(),
          description: row['Description'] || 'Përshkrim i produktit',
          price: price,
          brand: brand,
          category: normalizeCategory(row['kategoria_main']),
          subcategory: row['nenkategoria'] || null,
          stock_quantity: (row['Stock'] || '').includes('Ka stok') ? 50 : 0
        };

        // Insert product
        const productId = await insertProduct(product);
        
        // Download and insert image if available
        let imageStatus = '';
        if (row['Image_URL']) {
          try {
            // Create safe filename from product name
            const safeFilename = productName
              .replace(/[^a-zA-Z0-9\s]/g, '_')
              .replace(/\s+/g, '_')
              .substring(0, 100) + '.jpg';
            
            const localImagePath = await downloadImage(row['Image_URL'], safeFilename);
            await insertProductImage(productId, localImagePath);
            imageDownloadCount++;
            imageStatus = '🖼️ ';
          } catch (imgErr) {
            imageStatus = '⚠️ (no image) ';
            console.warn(`   Warning: Could not download image for "${productName}"`);
          }
        }

        console.log(`✅ ${imageStatus}Added: "${productName}" (${brand}) - ${product.category}`);
        addedCount++;

      } catch (err) {
        console.error(`❌ Error processing "${productName}":`, err.message);
        errorCount++;
      }

      // Small delay to avoid overwhelming the server
      if (i % 10 === 0 && i > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('📊 IMPORT SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Products Added: ${addedCount}`);
    console.log(`🖼️  Images Downloaded: ${imageDownloadCount}`);
    console.log(`⏭️  Products Skipped (already exist): ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
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
