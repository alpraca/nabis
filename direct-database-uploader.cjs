/**
 * Direct Database Product Uploader
 * Loads products directly into SQLite database without requiring API server
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const XLSX = require('xlsx');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const excelFile = path.join(__dirname, 'farmaon_products.xlsx');

console.log('🚀 Direct Database Product Uploader');
console.log('===================================');

// Category mapping
const categoryMapping = {
  'face': 'fytyre',
  'skin': 'fytyre', 
  'cream': 'fytyre',
  'serum': 'fytyre',
  'cleanser': 'fytyre',
  'moisturizer': 'fytyre',
  'spf': 'spf',
  'sun': 'spf',
  'body': 'trupi',
  'baby': 'mama-dhe-bebat',
  'infant': 'mama-dhe-bebat',
  'supplement': 'suplemente',
  'vitamin': 'suplemente',
  'hygiene': 'higjena',
  'oral': 'higjena',
  'hair': 'flokët',
  'shampoo': 'flokët'
};

function getCategoryFromName(productName) {
  const name = productName.toLowerCase();
  
  for (const [key, category] of Object.entries(categoryMapping)) {
    if (name.includes(key)) {
      return category;
    }
  }
  
  return 'dermokozmetikë'; // Default category
}

function cleanPrice(priceStr) {
  if (!priceStr) return 0;
  
  // Remove currency symbols and non-numeric characters except decimal point
  const cleaned = priceStr.toString().replace(/[^\d.,]/g, '');
  
  // Handle different decimal separators
  const normalized = cleaned.replace(',', '.');
  
  const price = parseFloat(normalized);
  return isNaN(price) ? 0 : Math.round(price * 100) / 100; // Round to 2 decimal places
}

function generateSlug(name) {
  return name.toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single
    .trim();
}

async function uploadProducts() {
  return new Promise((resolve, reject) => {
    console.log('📊 Reading Excel file...');
    
    if (!require('fs').existsSync(excelFile)) {
      console.error('❌ Excel file not found:', excelFile);
      return reject('Excel file not found');
    }
    
    const workbook = XLSX.readFile(excelFile);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`📋 Found ${data.length} rows in Excel file`);
    
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Database connection failed:', err.message);
        return reject(err);
      }
      console.log('✅ Connected to database');
    });
    
    // Clear existing products first
    db.run('DELETE FROM products', (err) => {
      if (err) {
        console.log('⚠️  Could not clear existing products:', err.message);
      } else {
        console.log('🗑️  Cleared existing products');
      }
      
      let successful = 0;
      let failed = 0;
      let processed = 0;
      
      // Prepare insert statement
      const stmt = db.prepare(`
        INSERT INTO products (
          name, brand, category, subcategory, description, 
          price, original_price, stock_quantity, 
          is_new, on_sale, in_stock,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      data.forEach((row, index) => {
        if (!row.Name || !row.Price) {
          failed++;
          processed++;
          return;
        }
        
        const price = cleanPrice(row.Price);
        const originalPrice = row.Original_Price ? cleanPrice(row.Original_Price) : null;
        const stock = parseInt(row.Stock) || 50; // Default stock
        const category = getCategoryFromName(row.Name);
        const brand = row.Brand || 'Unknown';
        const description = row.Description || `${row.Name} - Produkt cilësor farmaceutik.`;
        const slug = generateSlug(row.Name);
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
        
        const isOnSale = originalPrice && originalPrice > price ? 1 : 0;
        const isNew = Math.random() > 0.8 ? 1 : 0; // 20% chance of being new
        
        stmt.run([
          row.Name,
          brand,
          category,
          null, // subcategory
          description,
          price,
          originalPrice,
          stock,
          isNew,
          isOnSale,
          1, // in_stock
          now,
          now
        ], function(err) {
          processed++;
          
          if (err) {
            console.error(`❌ Failed to insert: ${row.Name} - ${err.message}`);
            failed++;
          } else {
            successful++;
            if (successful % 100 === 0) {
              console.log(`✅ Inserted ${successful} products...`);
            }
          }
          
          // Check if all rows processed
          if (processed === data.length) {
            stmt.finalize();
            
            console.log('\n📊 UPLOAD SUMMARY');
            console.log('=================');
            console.log(`✅ Successful: ${successful}`);
            console.log(`❌ Failed: ${failed}`);
            console.log(`📦 Total: ${data.length}`);
            
            db.close((err) => {
              if (err) {
                console.error('❌ Error closing database:', err.message);
              } else {
                console.log('✅ Database connection closed');
              }
              resolve({ successful, failed, total: data.length });
            });
          }
        });
      });
    });
  });
}

// Run the upload
uploadProducts()
  .then(result => {
    console.log(`\n🎉 Upload completed! ${result.successful} products added to database.`);
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Upload failed:', error);
    process.exit(1);
  });