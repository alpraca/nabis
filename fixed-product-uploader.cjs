/**
 * Fixed Product Uploader - Handles proper brands, prices, and images
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const XLSX = require('xlsx');
const fs = require('fs');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const excelFile = path.join(__dirname, 'farmaon_products.xlsx');
const imagesFolder = path.join(__dirname, 'product_images');

console.log('🚀 Fixed Product Uploader for Nabis Farmaci');
console.log('===========================================');

// Enhanced brand extraction - matches actual pharmacy brands
function extractBrand(productName) {
  const brands = [
    'A-Derma', 'Avene', 'Vichy', 'La Roche-Posay', 'Eucerin', 'Bioderma', 
    'CeraVe', 'Cetaphil', 'Ducray', 'SVR', 'Uriage', 'Nuxe', 'Caudalie',
    'The Ordinary', 'Garnier', 'L\'Oreal', 'L\'Oréal', 'Nivea', 'Neutrogena',
    'Mustela', 'Sebamed', 'Pharmaceris', 'Lierac', 'Filorga', 'Roc',
    'Aptamil', 'Nan', 'Nutrilon', 'Similac', 'Enfamil', 'Nestle',
    'Bebe Vio', 'Chicco', 'Bepanthen', 'Sudocrem', 'Weleda',
    'Solgar', 'Nature\'s Bounty', 'Centrum', 'Vitabiotics', 'Now Foods',
    'Omega Pharma', 'Bayer', 'Sanofi', 'GSK', 'Pfizer', 'Johnson\'s',
    'Oral-B', 'Colgate', 'Sensodyne', 'Listerine', 'Paradontax',
    'Durex', 'Sagami', 'Control', 'Pasante', 'Manix',
    'Compeed', 'Hansaplast', 'Band-Aid', 'Elastoplast',
    'Omron', 'Braun', 'Beurer', 'Microlife', 'Rossmax',
    '4U Pharma', 'Babytol', 'Doppelherz', 'Supradyn', 'Multicentrum'
  ];
  
  const name = productName.trim();
  
  // Check for exact brand matches at the beginning
  for (const brand of brands) {
    if (name.toLowerCase().startsWith(brand.toLowerCase())) {
      return brand;
    }
  }
  
  // Check for brand anywhere in the name
  for (const brand of brands) {
    if (name.toLowerCase().includes(brand.toLowerCase())) {
      return brand;
    }
  }
  
  // Extract first word if no brand found
  const firstWord = name.split(' ')[0];
  return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
}

// Enhanced category mapping based on product names
function getCategoryFromName(productName) {
  const name = productName.toLowerCase();
  
  const categoryKeywords = {
    'fytyre': ['face', 'facial', 'serum', 'cream', 'cleanser', 'moisturizer', 'toner', 'mask', 'eye', 'anti-age', 'cleanance', 'effaclar', 'toleriane', 'hydreane'],
    'trupi': ['body', 'lotion', 'shower', 'deodorant', 'hand', 'foot', 'atoderm', 'lipikar'],
    'flokët': ['hair', 'shampoo', 'conditioner', 'treatment', 'scalp', 'kelual', 'anaphase', 'dercos'],
    'spf': ['spf', 'sun', 'solar', 'protection', 'anthelios', 'capital'],
    'mama-dhe-bebat': ['baby', 'infant', 'aptamil', 'nan', 'nutrilon', 'mustela', 'bepanthen', 'chicco', 'stelatopia'],
    'suplemente': ['vitamin', 'supplement', 'omega', 'calcium', 'iron', 'magnesium', 'solgar', 'centrum', 'nature'],
    'higjena': ['oral', 'toothpaste', 'mouthwash', 'dental', 'hygiene', 'intimate', 'colgate', 'oral-b'],
    'farmaci': ['medicine', 'pharmaceutical', 'drops', 'spray', 'gel', 'ointment', 'cream', 'tablet']
  };
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (name.includes(keyword)) {
        return category;
      }
    }
  }
  
  return 'dermokozmetikë'; // Default category
}

// Parse Albanian Lek prices
function parsePrice(priceStr) {
  if (!priceStr) return 0;
  
  // Remove "L" and other non-numeric characters, keep decimal separators
  const cleaned = priceStr.toString().replace(/[^\d.,]/g, '');
  
  // Handle Albanian format (comma as thousands separator, dot as decimal)
  let normalized = cleaned;
  
  // If there's both comma and dot, comma is thousands separator
  if (cleaned.includes(',') && cleaned.includes('.')) {
    normalized = cleaned.replace(/,/g, '');
  } 
  // If only comma, it might be decimal separator
  else if (cleaned.includes(',') && !cleaned.includes('.')) {
    // Check if it's likely a decimal (less than 3 digits after comma)
    const parts = cleaned.split(',');
    if (parts[1] && parts[1].length <= 2) {
      normalized = cleaned.replace(',', '.');
    } else {
      normalized = cleaned.replace(/,/g, '');
    }
  }
  
  const price = parseFloat(normalized);
  return isNaN(price) ? 0 : Math.round(price * 100) / 100;
}

// Check if image exists
function getImagePath(imageFileName) {
  if (!imageFileName) return null;
  
  const imagePath = path.join(imagesFolder, imageFileName);
  return fs.existsSync(imagePath) ? imageFileName : null;
}

// Generate URL-friendly slug
function generateSlug(name) {
  return name.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

async function uploadProducts() {
  return new Promise((resolve, reject) => {
    console.log('📊 Reading Excel file...');
    
    if (!fs.existsSync(excelFile)) {
      console.error('❌ Excel file not found:', excelFile);
      return reject('Excel file not found');
    }
    
    const workbook = XLSX.readFile(excelFile);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`📋 Found ${data.length} rows in Excel file`);
    console.log(`🖼️  Images folder: ${imagesFolder}`);
    
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Database connection failed:', err.message);
        return reject(err);
      }
      console.log('✅ Connected to database');
    });
    
    // Clear existing products
    db.run('DELETE FROM products', (err) => {
      if (err) {
        console.log('⚠️  Could not clear existing products:', err.message);
      } else {
        console.log('🗑️  Cleared existing products');
      }
      
      let successful = 0;
      let failed = 0;
      let processed = 0;
      let skipped = 0;
      
      // Get existing columns in products table
      db.all("PRAGMA table_info(products)", (err, columns) => {
        if (err) {
          console.error('❌ Could not get table info:', err.message);
          return reject(err);
        }
        
        const columnNames = columns.map(col => col.name);
        const hasImageColumn = columnNames.includes('image_url') || columnNames.includes('image');
        
        console.log('📋 Database columns:', columnNames);
        
        // Prepare insert statement based on available columns
        let insertSQL = `
          INSERT INTO products (
            name, brand, category, subcategory, description, 
            price, original_price, stock_quantity, 
            is_new, on_sale, in_stock,
            created_at, updated_at
        `;
        
        let placeholders = '?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?';
        
        if (hasImageColumn) {
          insertSQL += ', ' + (columnNames.includes('image_url') ? 'image_url' : 'image');
          placeholders += ', ?';
        }
        
        insertSQL += `) VALUES (${placeholders})`;
        
        console.log('🔧 Using SQL:', insertSQL);
        
        const stmt = db.prepare(insertSQL);
        
        console.log('🚀 Starting product upload...');
        
        data.forEach((row, index) => {
          if (!row.Name || !row.Price) {
            console.log(`⚠️  Skipping row ${index + 1}: Missing name or price`);
            skipped++;
            processed++;
            return;
          }
          
          const price = parsePrice(row.Price);
          if (price === 0) {
            console.log(`⚠️  Skipping ${row.Name}: Invalid price ${row.Price}`);
            skipped++;
            processed++;
            return;
          }
          
          const brand = extractBrand(row.Name);
          const category = getCategoryFromName(row.Name);
          const description = row.Description || `${row.Name} - Produkt cilësor farmaceutik.`;
          const stock = row.Stock && row.Stock.includes('Ka stok') ? 50 : 0;
          const imagePath = getImagePath(row.Image_File);
          const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
          
          // Determine if product is on sale
          const isOnSale = 0; // We'll set this based on original price if available
          const isNew = Math.random() > 0.85 ? 1 : 0; // 15% chance of being new
          const inStock = stock > 0 ? 1 : 0;
          
          let values = [
            row.Name,
            brand,
            category,
            null, // subcategory
            description,
            price,
            null, // original_price (can be calculated from sales data)
            stock,
            isNew,
            isOnSale,
            inStock,
            now,
            now
          ];
          
          if (hasImageColumn) {
            values.push(imagePath);
          }
          
          stmt.run(values, function(err) {
            processed++;
            
            if (err) {
              console.error(`❌ Failed to insert: ${row.Name} - ${err.message}`);
              failed++;
            } else {
              successful++;
              if (successful % 50 === 0) {
                console.log(`✅ Inserted ${successful} products...`);
              }
              
              // Log first few successful insertions for verification
              if (successful <= 3) {
                console.log(`✅ ${successful}. ${row.Name} | Brand: ${brand} | Price: ${price} | Image: ${imagePath || 'None'}`);
              }
            }
            
            // Check if all rows processed
            if (processed === data.length) {
              stmt.finalize();
              
              console.log('\n📊 UPLOAD SUMMARY');
              console.log('=================');
              console.log(`✅ Successful: ${successful}`);
              console.log(`❌ Failed: ${failed}`);
              console.log(`⚠️  Skipped: ${skipped}`);
              console.log(`📦 Total: ${data.length}`);
              
              // Show brand distribution
              db.all('SELECT brand, COUNT(*) as count FROM products GROUP BY brand ORDER BY count DESC LIMIT 10', (err, brands) => {
                if (!err && brands.length > 0) {
                  console.log('\n🏷️  Top Brands:');
                  brands.forEach(b => console.log(`   ${b.brand}: ${b.count} products`));
                }
                
                db.close((err) => {
                  if (err) {
                    console.error('❌ Error closing database:', err.message);
                  } else {
                    console.log('✅ Database connection closed');
                  }
                  resolve({ successful, failed, skipped, total: data.length });
                });
              });
            }
          });
        });
      });
    });
  });
}

// Run the upload
uploadProducts()
  .then(result => {
    console.log(`\n🎉 Upload completed! ${result.successful} products with proper brands, prices, and images.`);
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Upload failed:', error);
    process.exit(1);
  });