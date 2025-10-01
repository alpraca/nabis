/**
 * PERMANENT CATEGORY REORGANIZATION SYSTEM
 * Maps all products to proper Albanian categories and subcategories
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const XLSX = require('xlsx');
const fs = require('fs');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const excelFile = path.join(__dirname, 'farmaon_products.xlsx');
const imagesFolder = path.join(__dirname, 'product_images');
const uploadsFolder = path.join(__dirname, 'server', 'uploads', 'images');

console.log('🏗️  PERMANENT CATEGORY REORGANIZATION SYSTEM');
console.log('============================================');

// COMPLETE ALBANIAN CATEGORY STRUCTURE
const categoryStructure = {
  'dermokozmetikë': {
    name: 'Dermokozmetikë',
    subcategories: {
      'fytyre': { name: 'Fytyre', subsubcategories: [] },
      'flokët': { name: 'Flokët', subsubcategories: [] },
      'trupi': { name: 'Trupi', subsubcategories: [] },
      'spf': { name: 'SPF', subsubcategories: [] },
      'tanning': { name: 'Tanning', subsubcategories: [] },
      'makeup': { name: 'Makeup', subsubcategories: [] }
    }
  },
  'higjena': {
    name: 'Higjena',
    subcategories: {
      'depilim-dhe-intime': { name: 'Depilim dhe Intime', subsubcategories: [] },
      'goja': { name: 'Goja', subsubcategories: [] },
      'këmbët': { name: 'Këmbët', subsubcategories: [] },
      'trupi': { name: 'Trupi', subsubcategories: [] }
    }
  },
  'farmaci': {
    name: 'Farmaci',
    subcategories: {
      'otc-pa-recetë': { name: 'OTC (pa recetë)', subsubcategories: [] },
      'mirëqenia-seksuale': { name: 'Mirëqenia seksuale', subsubcategories: [] },
      'aparat-mjekësore': { name: 'Aparat mjekësore', subsubcategories: [] },
      'first-aid': { name: 'First Aid (Ndihmë e Parë)', subsubcategories: [] },
      'ortopedike': { name: 'Ortopedike', subsubcategories: [] }
    }
  },
  'mama-dhe-bebat': {
    name: 'Mama dhe Bebat',
    subcategories: {
      'kujdesi-ndaj-nënës': { 
        name: 'Kujdesi ndaj Nënës', 
        subsubcategories: ['shtatzani', 'ushqyerje-me-gji'] 
      },
      'kujdesi-ndaj-bebit': { 
        name: 'Kujdesi ndaj Bebit', 
        subsubcategories: ['pelena', 'higjena', 'spf', 'suplementa'] 
      },
      'aksesorë-për-beba': { name: 'Aksesorë për Beba', subsubcategories: [] },
      'planifikim-familjar': { name: 'Planifikim Familjar', subsubcategories: [] }
    }
  },
  'produkte-shtesë': {
    name: 'Produkte Shtesë',
    subcategories: {
      'sete': { name: 'Sete', subsubcategories: [] },
      'vajra-esencial': { name: 'Vajra Esencial', subsubcategories: [] }
    }
  },
  'suplemente': {
    name: 'Suplemente',
    subcategories: {}
  }
};

// ADVANCED PRODUCT CATEGORIZATION LOGIC
function categorizeProduct(productName, description = '') {
  const name = productName.toLowerCase();
  const desc = description.toLowerCase();
  const fullText = `${name} ${desc}`;
  
  // Dermokozmetikë - Fytyre
  if (fullText.match(/(face|facial|serum|cream|cleanser|moisturizer|anti.?age|wrinkle|eye|fytyre|mask|toner|micellar|cleanance|effaclar|toleriane|hydreane|vitamin.*c)/)) {
    return { category: 'dermokozmetikë', subcategory: 'fytyre' };
  }
  
  // Dermokozmetikë - Flokët  
  if (fullText.match(/(hair|shampoo|conditioner|scalp|flokët|kelual|anaphase|dercos|hair.*loss|dandruff)/)) {
    return { category: 'dermokozmetikë', subcategory: 'flokët' };
  }
  
  // Dermokozmetikë - SPF
  if (fullText.match(/(spf|sun|solar|protection|anthelios|capital|sunscreen|uv)/)) {
    return { category: 'dermokozmetikë', subcategory: 'spf' };
  }
  
  // Dermokozmetikë - Tanning
  if (fullText.match(/(tanning|bronz|self.*tan|tan.*accelerator)/)) {
    return { category: 'dermokozmetikë', subcategory: 'tanning' };
  }
  
  // Dermokozmetikë - Makeup
  if (fullText.match(/(makeup|foundation|concealer|lipstick|mascara|eyeshadow|blush)/)) {
    return { category: 'dermokozmetikë', subcategory: 'makeup' };
  }
  
  // Dermokozmetikë - Trupi (body care)
  if (fullText.match(/(body|lotion|shower|hand|foot|atoderm|lipikar|body.*cream|body.*oil)/)) {
    return { category: 'dermokozmetikë', subcategory: 'trupi' };
  }
  
  // Higjena - Goja
  if (fullText.match(/(oral|toothpaste|mouthwash|dental|teeth|colgate|oral.?b|gum|breath)/)) {
    return { category: 'higjena', subcategory: 'goja' };
  }
  
  // Higjena - Depilim dhe Intime
  if (fullText.match(/(depil|intimate|feminine|vaginal|wax|hair.*removal|bikini)/)) {
    return { category: 'higjena', subcategory: 'depilim-dhe-intime' };
  }
  
  // Higjena - Këmbët
  if (fullText.match(/(foot|feet|corn|callus|fungal|athlete.*foot|këmbët)/)) {
    return { category: 'higjena', subcategory: 'këmbët' };
  }
  
  // Higjena - Trupi
  if (fullText.match(/(deodorant|antiperspirant|body.*wash|hygiene.*body)/)) {
    return { category: 'higjena', subcategory: 'trupi' };
  }
  
  // Mama dhe Bebat - Kujdesi ndaj Bebit
  if (fullText.match(/(baby|infant|newborn|bebat|mustela|chicco|bepanthen|bebe)/)) {
    if (fullText.match(/(diaper|pelena)/)) {
      return { category: 'mama-dhe-bebat', subcategory: 'kujdesi-ndaj-bebit', subsubcategory: 'pelena' };
    } else if (fullText.match(/(hygiene|wash|shampoo)/)) {
      return { category: 'mama-dhe-bebat', subcategory: 'kujdesi-ndaj-bebit', subsubcategory: 'higjena' };
    } else if (fullText.match(/(spf|sun)/)) {
      return { category: 'mama-dhe-bebat', subcategory: 'kujdesi-ndaj-bebit', subsubcategory: 'spf' };
    } else if (fullText.match(/(vitamin|supplement)/)) {
      return { category: 'mama-dhe-bebat', subcategory: 'kujdesi-ndaj-bebit', subsubcategory: 'suplementa' };
    }
    return { category: 'mama-dhe-bebat', subcategory: 'kujdesi-ndaj-bebit' };
  }
  
  // Mama dhe Bebat - Kujdesi ndaj Nënës
  if (fullText.match(/(pregnancy|pregnant|breastfeed|lactation|maternity|shtatzani|nënës)/)) {
    if (fullText.match(/(pregnancy|pregnant|shtatzani)/)) {
      return { category: 'mama-dhe-bebat', subcategory: 'kujdesi-ndaj-nënës', subsubcategory: 'shtatzani' };
    } else if (fullText.match(/(breastfeed|lactation|ushqyerje)/)) {
      return { category: 'mama-dhe-bebat', subcategory: 'kujdesi-ndaj-nënës', subsubcategory: 'ushqyerje-me-gji' };
    }
    return { category: 'mama-dhe-bebat', subcategory: 'kujdesi-ndaj-nënës' };
  }
  
  // Mama dhe Bebat - Planifikim Familjar
  if (fullText.match(/(condom|contraceptive|pregnancy.*test|ovulation|fertility)/)) {
    return { category: 'mama-dhe-bebat', subcategory: 'planifikim-familjar' };
  }
  
  // Farmaci - OTC
  if (fullText.match(/(pain|fever|headache|cold|flu|cough|allergy|otc|paracetamol|ibuprofen|aspirin)/)) {
    return { category: 'farmaci', subcategory: 'otc-pa-recetë' };
  }
  
  // Farmaci - Mirëqenia seksuale
  if (fullText.match(/(sexual|erectile|libido|viagra|cialis|durex|condom)/)) {
    return { category: 'farmaci', subcategory: 'mirëqenia-seksuale' };
  }
  
  // Farmaci - Aparat mjekësore
  if (fullText.match(/(thermometer|blood.*pressure|glucose|stethoscope|syringe|omron|braun|beurer)/)) {
    return { category: 'farmaci', subcategory: 'aparat-mjekësore' };
  }
  
  // Farmaci - First Aid
  if (fullText.match(/(bandage|plaster|wound|antiseptic|first.*aid|emergency|compeed|hansaplast)/)) {
    return { category: 'farmaci', subcategory: 'first-aid' };
  }
  
  // Farmaci - Ortopedike
  if (fullText.match(/(orthopedic|support|brace|compression|joint|muscle.*pain|ortopedike)/)) {
    return { category: 'farmaci', subcategory: 'ortopedike' };
  }
  
  // Suplemente
  if (fullText.match(/(vitamin|supplement|mineral|omega|calcium|iron|magnesium|probiotic|solgar|centrum|multivitamin)/)) {
    return { category: 'suplemente', subcategory: null };
  }
  
  // Produkte Shtesë - Sete
  if (fullText.match(/(set|kit|trio|collection|routine|bundle)/)) {
    return { category: 'produkte-shtesë', subcategory: 'sete' };
  }
  
  // Produkte Shtesë - Vajra Esencial
  if (fullText.match(/(essential.*oil|aroma|massage.*oil|vajra)/)) {
    return { category: 'produkte-shtesë', subcategory: 'vajra-esencial' };
  }
  
  // Default to Dermokozmetikë if no clear match
  return { category: 'dermokozmetikë', subcategory: 'fytyre' };
}

async function reorganizeDatabase() {
  return new Promise((resolve, reject) => {
    console.log('📊 Reading Excel file...');
    
    const workbook = XLSX.readFile(excelFile);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`📋 Found ${data.length} products to categorize`);
    
    const db = new sqlite3.Database(dbPath);
    
    // First, ensure the categories table exists
    db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        parent_id INTEGER,
        level INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.log('Categories table already exists or error:', err.message);
      
      // Clear and populate categories
      db.run('DELETE FROM categories', () => {
        console.log('🗑️  Cleared existing categories');
        
        // Insert all categories and subcategories
        const categoryInserts = [];
        let categoryId = 1;
        
        Object.entries(categoryStructure).forEach(([catSlug, catData]) => {
          categoryInserts.push({ id: categoryId, name: catData.name, slug: catSlug, parent_id: null, level: 0 });
          const parentId = categoryId++;
          
          Object.entries(catData.subcategories).forEach(([subSlug, subData]) => {
            categoryInserts.push({ id: categoryId, name: subData.name, slug: subSlug, parent_id: parentId, level: 1 });
            const subParentId = categoryId++;
            
            if (subData.subsubcategories && subData.subsubcategories.length > 0) {
              subData.subsubcategories.forEach(subsubSlug => {
                const subsubName = subsubSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                categoryInserts.push({ id: categoryId, name: subsubName, slug: subsubSlug, parent_id: subParentId, level: 2 });
                categoryId++;
              });
            }
          });
        });
        
        const categoryStmt = db.prepare('INSERT INTO categories (id, name, slug, parent_id, level) VALUES (?, ?, ?, ?, ?)');
        categoryInserts.forEach(cat => {
          categoryStmt.run([cat.id, cat.name, cat.slug, cat.parent_id, cat.level]);
        });
        categoryStmt.finalize();
        
        console.log(`✅ Created ${categoryInserts.length} categories and subcategories`);
        
        // Clear existing products and reinsert with proper categorization
        db.run('DELETE FROM products', () => {
          console.log('🗑️  Cleared existing products');
          
          let processed = 0;
          let successful = 0;
          
          const stmt = db.prepare(`
            INSERT INTO products (
              name, brand, category, subcategory, subsubcategory, description, 
              price, original_price, stock_quantity, 
              is_new, on_sale, in_stock, image_url,
              created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          
          data.forEach((row, index) => {
            if (!row.Name || !row.Price) {
              processed++;
              return;
            }
            
            // Extract brand from product name
            const brand = extractBrand(row.Name);
            
            // Parse price
            const price = parsePrice(row.Price);
            if (price === 0) {
              processed++;
              return;
            }
            
            // Categorize product
            const categoryInfo = categorizeProduct(row.Name, row.Description || '');
            
            // Get image URL
            const imagePath = getImagePath(row.Image_File);
            
            const stock = row.Stock && row.Stock.includes('Ka stok') ? Math.floor(Math.random() * 50) + 10 : 0;
            const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
            const isNew = Math.random() > 0.85 ? 1 : 0;
            const isOnSale = Math.random() > 0.8 ? 1 : 0;
            const inStock = stock > 0 ? 1 : 0;
            
            stmt.run([
              row.Name,
              brand,
              categoryInfo.category,
              categoryInfo.subcategory,
              categoryInfo.subsubcategory || null,
              row.Description || `${row.Name} - Produkt cilësor farmaceutik.`,
              price,
              isOnSale ? Math.round(price * 1.2) : null, // original price if on sale
              stock,
              isNew,
              isOnSale,
              inStock,
              imagePath,
              now,
              now
            ], function(err) {
              processed++;
              
              if (err) {
                console.error(`❌ Failed to insert: ${row.Name} - ${err.message}`);
              } else {
                successful++;
                if (successful % 100 === 0) {
                  console.log(`✅ Categorized ${successful} products...`);
                }
              }
              
              if (processed === data.length) {
                stmt.finalize();
                
                // Show categorization summary
                db.all(`
                  SELECT category, subcategory, COUNT(*) as count 
                  FROM products 
                  GROUP BY category, subcategory 
                  ORDER BY category, subcategory
                `, (err, summary) => {
                  console.log('\n📊 CATEGORIZATION SUMMARY');
                  console.log('=========================');
                  summary.forEach(s => {
                    console.log(`${s.category}${s.subcategory ? ' → ' + s.subcategory : ''}: ${s.count} products`);
                  });
                  
                  console.log(`\n✅ Successfully categorized ${successful} products`);
                  console.log('🏗️  Category structure is now permanent in database');
                  
                  db.close();
                  resolve({ successful, total: data.length });
                });
              }
            });
          });
        });
      });
    });
  });
}

// Helper functions (same as before)
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
    '4U Pharma', 'Babytol', 'Doppelherz', 'Supradyn', 'Multicentrum',
    'Rilastil', 'Korff', 'Pic', 'Holle', 'Atc', 'Klorane', 'Noreva'
  ];
  
  const name = productName.trim();
  
  for (const brand of brands) {
    if (name.toLowerCase().startsWith(brand.toLowerCase())) {
      return brand;
    }
  }
  
  for (const brand of brands) {
    if (name.toLowerCase().includes(brand.toLowerCase())) {
      return brand;
    }
  }
  
  const firstWord = name.split(' ')[0];
  return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
}

function parsePrice(priceStr) {
  if (!priceStr) return 0;
  const cleaned = priceStr.toString().replace(/[^\d.,]/g, '');
  let normalized = cleaned;
  
  if (cleaned.includes(',') && cleaned.includes('.')) {
    normalized = cleaned.replace(/,/g, '');
  } else if (cleaned.includes(',') && !cleaned.includes('.')) {
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

function getImagePath(imageFileName) {
  if (!imageFileName) return null;
  const imagePath = path.join(imagesFolder, imageFileName);
  return fs.existsSync(imagePath) ? `/uploads/images/${imageFileName}` : null;
}

// Run the reorganization
reorganizeDatabase()
  .then(result => {
    console.log(`\n🎉 PERMANENT CATEGORIZATION COMPLETED!`);
    console.log(`✅ ${result.successful} products properly categorized`);
    console.log('🏗️  Albanian category structure is now permanent');
    console.log('📱 Navbar will show all categories and subcategories');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Categorization failed:', error);
    process.exit(1);
  });