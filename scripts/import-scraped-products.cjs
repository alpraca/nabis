const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Paths
const EXCEL_PATH = './Scraped_Products_20251123_213727/products.xlsx';
const IMAGES_SOURCE = './Scraped_Products_20251123_213727/images';
const IMAGES_DEST = './server/uploads/products';
const DB_PATH = './server/database.sqlite';

// Category mapping from Albanian to English
const CATEGORY_MAP = {
  'Dermokozmetikë': 'Dermocosmetics',
  'Kozmetikë': 'Cosmetics',
  'Parfume': 'Perfumes',
  'Higjienë': 'Hygiene',
  'Kujdes për Lëkurën': 'Skincare',
  'Kujdes për Flokët': 'Haircare',
  'Mbrojtje Diellore': 'Sun Protection',
  'Make-up': 'Makeup',
  'Pajisje Mjekësore': 'Medical Devices',
  'Ushqime Dietike': 'Dietary Foods'
};

const SUBCATEGORY_MAP = {
  'Fytyre': 'Face',
  'Trup': 'Body',
  'Flokë': 'Hair',
  'Sy': 'Eyes',
  'Buzë': 'Lips',
  'Duar': 'Hands',
  'Këmbë': 'Feet',
  'Shampo': 'Shampoo',
  'Kondicionerë': 'Conditioners',
  'Serume': 'Serums',
  'Kreme': 'Creams',
  'Maska': 'Masks',
  'SPF': 'Sun Protection'
};

function translateCategory(category) {
  return CATEGORY_MAP[category] || category;
}

function translateSubcategory(subcategory) {
  return SUBCATEGORY_MAP[subcategory] || subcategory;
}

function parsePrice(priceStr) {
  if (!priceStr) return 0;
  // Remove currency symbol and convert to number
  const cleaned = priceStr.replace(/[^\d.,]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

function parseStock(stockStr) {
  if (!stockStr) return 0;
  if (stockStr.includes('Ka stok') || stockStr.includes('Stock')) return 999;
  if (stockStr.includes('Nuk ka stok') || stockStr.includes('Out')) return 0;
  return 999;
}

function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100);
}

function copyImage(sourcePath, productSlug) {
  try {
    if (!fs.existsSync(sourcePath)) {
      console.log(`   ⚠️  Image not found: ${sourcePath}`);
      return null;
    }

    // Ensure destination directory exists
    if (!fs.existsSync(IMAGES_DEST)) {
      fs.mkdirSync(IMAGES_DEST, { recursive: true });
    }

    const ext = path.extname(sourcePath);
    const destFileName = `${productSlug}${ext}`;
    const destPath = path.join(IMAGES_DEST, destFileName);

    fs.copyFileSync(sourcePath, destPath);
    return destFileName;
  } catch (error) {
    console.log(`   ⚠️  Error copying image: ${error.message}`);
    return null;
  }
}

async function importProducts() {
  console.log('🚀 Starting product import from scraped data...\n');

  // Read Excel file
  console.log('📊 Reading Excel file...');
  const workbook = XLSX.readFile(EXCEL_PATH);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const products = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  
  console.log(`✓ Found ${products.length} products\n`);

  // Connect to database
  console.log('💾 Connecting to database...');
  const db = new sqlite3.Database(DB_PATH);
  
  // Promisify database operations
  const runAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  };

  const allAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  };
  
  // Check database structure
  const tables = await allAsync("SELECT name FROM sqlite_master WHERE type='table'");
  console.log(`✓ Database tables: ${tables.map(t => t.name).join(', ')}\n`);

  // Get unique categories and subcategories
  console.log('📁 Processing categories...');
  const uniqueCategories = new Set();
  const uniqueSubcategories = new Map();

  products.forEach(p => {
    if (p.kategoria_main) {
      uniqueCategories.add(p.kategoria_main);
      if (p.nenkategoria) {
        if (!uniqueSubcategories.has(p.kategoria_main)) {
          uniqueSubcategories.set(p.kategoria_main, new Set());
        }
        uniqueSubcategories.get(p.kategoria_main).add(p.nenkategoria);
      }
    }
  });

  console.log(`✓ Found ${uniqueCategories.size} unique categories\n`);

  // Display categories
  for (const catName of uniqueCategories) {
    const engName = translateCategory(catName);
    console.log(`  ✓ Category: ${catName} → ${engName}`);

    // Display subcategories
    if (uniqueSubcategories.has(catName)) {
      for (const subName of uniqueSubcategories.get(catName)) {
        const engSubName = translateSubcategory(subName);
        console.log(`    ✓ Subcategory: ${subName} → ${engSubName}`);
      }
    }
  }

  console.log('\n📦 Importing products...\n');

  let imported = 0;
  let withImages = 0;
  let errors = 0;

  for (const product of products) {
    try {
      const name = product.Name || 'Unnamed Product';
      const description = product.Description || '';
      const price = parsePrice(product.Price);
      const stockQty = parseStock(product.Stock);
      const inStock = stockQty > 0 ? 1 : 0;
      
      // Extract brand from name (first word or two)
      const brandMatch = name.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
      const brand = brandMatch ? brandMatch[1].trim() : 'Unknown';

      // Get translated categories
      const category = translateCategory(product.kategoria_main || 'Other');
      const subcategory = translateSubcategory(product.nenkategoria || '');

      // Handle image
      let imagePath = null;
      if (product.Image_URL) {
        // Image_URL already contains "images\" so just use the product folder path
        const imageSourcePath = path.join('./Scraped_Products_20251123_213727', product.Image_URL.replace(/\\/g, '/'));
        const imageName = copyImage(imageSourcePath, createSlug(name));
        if (imageName) {
          imagePath = `/uploads/products/${imageName}`;
          withImages++;
        }
      }

      // Insert product
      const result = await runAsync(`
        INSERT OR REPLACE INTO products 
        (name, brand, category, subcategory, description, price, stock_quantity, in_stock, is_new, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `, [name, brand, category, subcategory, description, price, stockQty, inStock, 1]);

      // Insert image if exists
      if (imagePath && result.lastID) {
        await runAsync(`
          INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
          VALUES (?, ?, 1, 0)
        `, [result.lastID, imagePath]);
      }

      imported++;
      
      if (imported % 50 === 0) {
        console.log(`  ✓ Imported ${imported} products...`);
      }

    } catch (error) {
      console.error(`  ❌ Error importing "${product.Name}": ${error.message}`);
      errors++;
    }
  }

  // Close database
  db.close((err) => {
    if (err) console.error('Error closing database:', err);
  });

  console.log('\n✨ Import Complete!\n');
  console.log('═══════════════════════════════════════');
  console.log(`  Total products: ${products.length}`);
  console.log(`  Successfully imported: ${imported}`);
  console.log(`  With images: ${withImages}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Categories: ${uniqueCategories.size}`);
  console.log('═══════════════════════════════════════\n');
}

// Run import
importProducts().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
