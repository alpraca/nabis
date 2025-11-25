const XLSX = require('xlsx');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Excel file path
const excelPath = path.join(__dirname, 'products.xlsx');

// Category mapping to match navbar categories
const categoryMap = {
  'ilace': 'Ilaçe',
  'ilac': 'Ilaçe',
  'medicine': 'Ilaçe',
  'medicines': 'Ilaçe',
  'suplementa': 'Suplementa',
  'suplement': 'Suplementa',
  'supplements': 'Suplementa',
  'supplement': 'Suplementa',
  'kozmetike': 'Kozmetikë',
  'kozmetik': 'Kozmetikë',
  'cosmetics': 'Kozmetikë',
  'cosmetic': 'Kozmetikë',
  'vitamin': 'Vitamin',
  'vitamins': 'Vitamin',
  'vitamina': 'Vitamin',
  'kujdes femijesh': 'Kujdes Fëmijësh',
  'kujdes femijes': 'Kujdes Fëmijësh',
  'child care': 'Kujdes Fëmijësh',
  'baby': 'Kujdes Fëmijësh',
  'bebe': 'Kujdes Fëmijësh',
  'te tjera': 'Të tjera',
  'other': 'Të tjera',
  'tjera': 'Të tjera'
};

// Normalize category name
function normalizeCategory(category) {
  if (!category) return 'Të tjera';
  const normalized = category.toString().toLowerCase().trim();
  return categoryMap[normalized] || 'Të tjera';
}

// Check if product exists by name (case-insensitive)
function checkProductExists(name) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT id FROM products WHERE LOWER(name) = LOWER(?)',
      [name.trim()],
      (err, row) => {
        if (err) reject(err);
        else resolve(!!row);
      }
    );
  });
}

// Insert product into database
function insertProduct(product) {
  return new Promise((resolve, reject) => {
    const {
      name,
      description,
      price,
      brand,
      category,
      subcategory,
      stock_quantity,
      image_url,
      is_new,
      on_sale,
      original_price
    } = product;

    db.run(
      `INSERT INTO products (
        name, description, price, brand, category, subcategory,
        stock_quantity, is_new, on_sale, original_price,
        in_stock, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))`,
      [
        name,
        description || 'Përshkrim i produktit',
        price,
        brand || 'N/A',
        normalizeCategory(category),
        subcategory || null,
        stock_quantity || 50,
        is_new || 0,
        on_sale || 0,
        original_price || null
      ],
      function(err) {
        if (err) reject(err);
        else {
          const productId = this.lastID;
          // Insert default image if image_url is provided
          if (image_url && image_url !== '/api/placeholder/400/400') {
            db.run(
              `INSERT INTO product_images (product_id, image_url, is_primary, sort_order, created_at)
               VALUES (?, ?, 1, 0, datetime('now'))`,
              [productId, image_url],
              (imgErr) => {
                if (imgErr) console.warn(`Warning: Could not insert image for product ${name}`);
                resolve(productId);
              }
            );
          } else {
            resolve(productId);
          }
        }
      }
    );
  });
}

// Main import function
async function importProducts() {
  console.log('='.repeat(60));
  console.log('📦 EXCEL PRODUCTS IMPORT');
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

    // Process each product
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      // Extract product data from Excel row
      // Adjust these column names to match your Excel file
      const productName = row['Name'] || row['name'] || row['Product Name'] || row['Emri'];
      
      if (!productName) {
        console.log(`⚠️  Row ${i + 1}: Skipping - No product name found`);
        skippedCount++;
        continue;
      }

      try {
        // Check if product already exists
        const exists = await checkProductExists(productName);
        
        if (exists) {
          console.log(`⏭️  Skipping "${productName}" - Already exists in database`);
          skippedCount++;
          continue;
        }

        // Parse price (handle different formats)
        let price = row['Price'] || row['price'] || row['Çmimi'] || row['Cmimi'] || 0;
        if (typeof price === 'string') {
          price = parseFloat(price.replace(/[^\d.]/g, '')) || 0;
        }
        price = Math.round(price * 100); // Convert to cents/lek integer

        // Prepare product object
        const product = {
          name: productName.trim(),
          description: row['Description'] || row['description'] || row['Përshkrimi'] || row['Pershkrimi'] || 'Përshkrim i produktit',
          price: price,
          brand: row['Brand'] || row['brand'] || row['Marka'] || 'N/A',
          category: row['Category'] || row['category'] || row['Kategoria'] || 'Të tjera',
          subcategory: row['Subcategory'] || row['subcategory'] || row['Nënkategoria'] || row['Nenkategoria'] || null,
          stock_quantity: parseInt(row['Stock'] || row['stock'] || row['Stoku'] || 50),
          image_url: row['Image'] || row['image'] || row['Image URL'] || row['Foto'] || null,
          is_new: (row['New'] || row['new'] || row['I ri'] || '').toString().toLowerCase() === 'true' || (row['New'] || row['new'] || row['I ri']) === 1 ? 1 : 0,
          on_sale: (row['Sale'] || row['sale'] || row['Zbritje'] || '').toString().toLowerCase() === 'true' || (row['Sale'] || row['sale']) === 1 ? 1 : 0,
          original_price: row['Original Price'] || row['original_price'] || row['Çmimi Origjinal'] || null
        };

        // Insert product
        await insertProduct(product);
        console.log(`✅ Added: "${productName}" (${product.brand}) - Category: ${normalizeCategory(product.category)}`);
        addedCount++;

      } catch (err) {
        console.error(`❌ Error processing "${productName}":`, err.message);
        errorCount++;
      }
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('📊 IMPORT SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Products Added: ${addedCount}`);
    console.log(`⏭️  Products Skipped (already exist): ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📦 Total Processed: ${data.length}`);
    console.log('');

    // Show category distribution
    console.log('📋 Category Distribution of New Products:');
    db.all(
      'SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY count DESC',
      (err, rows) => {
        if (!err && rows) {
          rows.forEach(row => {
            console.log(`   ${row.category}: ${row.count} products`);
          });
        }
        db.close();
      }
    );

  } catch (error) {
    console.error('❌ Fatal Error:', error.message);
    db.close();
    process.exit(1);
  }
}

// Run import
importProducts();
