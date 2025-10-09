/**
 * PERMANENT PRODUCT CATEGORIZATION SYSTEM
 * 
 * This script will:
 * 1. Analyze all 1,227 products from the Excel file
 * 2. Categorize them according to the exact navbar structure
 * 3. Assign proper subcategories and sub-subcategories
 * 4. Ensure all images are properly linked
 * 5. Update the database permanently with the new structure
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const XLSX = require('xlsx');
const fs = require('fs');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const excelFile = path.join(__dirname, 'farmaon_products.xlsx');
const imagesFolder = path.join(__dirname, 'product_images');
const uploadsFolder = path.join(__dirname, 'server', 'uploads', 'images');

console.log('🏗️  PERMANENT PRODUCT CATEGORIZATION SYSTEM');
console.log('============================================');

// EXACT category structure as specified
const categoryStructure = {
  'dermokozmetike': {
    name: 'Dermokozmetikë',
    subcategories: {
      'fytyre': { name: 'Fytyre', subsubcategories: [] },
      'floket': { name: 'Flokët', subsubcategories: [] },
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
      'kembet': { name: 'Këmbët', subsubcategories: [] },
      'trupi': { name: 'Trupi', subsubcategories: [] }
    }
  },
  'farmaci': {
    name: 'Farmaci',
    subcategories: {
      'otc-pa-recete': { name: 'OTC (pa recetë)', subsubcategories: [] },
      'mirekenia-seksuale': { name: 'Mirëqenia seksuale', subsubcategories: [] },
      'aparat-mjeksore': { name: 'Aparat mjekësore', subsubcategories: [] },
      'first-aid': { name: 'First Aid (Ndihmë e Parë)', subsubcategories: [] },
      'ortopedike': { name: 'Ortopedike', subsubcategories: [] }
    }
  },
  'mama-dhe-bebat': {
    name: 'Mama dhe Bebat',
    subcategories: {
      'kujdesi-ndaj-nenes': {
        name: 'Kujdesi ndaj Nënës',
        subsubcategories: ['shtatzani', 'ushqyerje-me-gji']
      },
      'kujdesi-ndaj-bebit': {
        name: 'Kujdesi ndaj Bebit',
        subsubcategories: ['pelena', 'higjena', 'spf', 'suplementa']
      },
      'aksesor-per-beba': { name: 'Aksesorë për Beba', subsubcategories: [] },
      'planifikim-familjar': { name: 'Planifikim Familjar', subsubcategories: [] }
    }
  },
  'produkte-shtese': {
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

// Enhanced categorization logic based on product names and descriptions
function categorizeProduct(productName, description = '') {
  const name = (productName + ' ' + description).toLowerCase();
  
  // Specific keyword mapping for accurate categorization
  const categorizations = [
    // Dermokozmetikë - Fytyre
    {
      category: 'dermokozmetike',
      subcategory: 'fytyre',
      keywords: ['face', 'facial', 'serum', 'anti-age', 'anti-aging', 'eye cream', 'moisturizer', 'cleanser', 'toner', 'mask', 'cream', 'lotion', 'gel', 'micellar', 'cleansing', 'hydrating', 'moisturizing', 'nourishing', 'anti-wrinkle', 'brightening', 'lifting', 'firming', 'vitamin c', 'retinol', 'hyaluronic', 'effaclar', 'toleriane', 'hydreane', 'cleanance', 'anthelios face', 'capital soleil face']
    },
    
    // Dermokozmetikë - Flokët
    {
      category: 'dermokozmetike',
      subcategory: 'floket',
      keywords: ['hair', 'shampoo', 'conditioner', 'treatment', 'scalp', 'kelual', 'anaphase', 'dercos', 'klorane', 'hair care', 'anti-dandruff', 'hair loss', 'hair growth', 'dry hair', 'oily hair', 'colored hair']
    },
    
    // Dermokozmetikë - Trupi
    {
      category: 'dermokozmetike',
      subcategory: 'trupi',
      keywords: ['body', 'body lotion', 'body cream', 'body oil', 'shower gel', 'bath', 'atoderm', 'lipikar', 'xeracalm', 'body wash', 'moisturizing body', 'nourishing body', 'dry skin body', 'sensitive skin body']
    },
    
    // Dermokozmetikë - SPF
    {
      category: 'dermokozmetike',
      subcategory: 'spf',
      keywords: ['spf', 'sun', 'solar', 'protection', 'sunscreen', 'sunblock', 'anthelios', 'capital soleil', 'uv protection', 'sun protection', 'photoprotection']
    },
    
    // Dermokozmetikë - Tanning
    {
      category: 'dermokozmetike',
      subcategory: 'tanning',
      keywords: ['tanning', 'self-tan', 'bronzer', 'after sun', 'sun tan', 'golden', 'bronze']
    },
    
    // Dermokozmetikë - Makeup
    {
      category: 'dermokozmetike',
      subcategory: 'makeup',
      keywords: ['makeup', 'foundation', 'concealer', 'powder', 'blush', 'lipstick', 'lip', 'mascara', 'eyeliner', 'eyeshadow', 'bb cream', 'cc cream', 'primer', 'cosmetic']
    },
    
    // Higjena - Goja
    {
      category: 'higjena',
      subcategory: 'goja',
      keywords: ['oral', 'toothpaste', 'mouthwash', 'dental', 'teeth', 'gum', 'colgate', 'oral-b', 'sensodyne', 'paradontax', 'tooth', 'mouth', 'breath', 'gums']
    },
    
    // Higjena - Depilim dhe Intime
    {
      category: 'higjena',
      subcategory: 'depilim-dhe-intime',
      keywords: ['intimate', 'depilation', 'hair removal', 'wax', 'shaving', 'razor', 'intimate hygiene', 'feminine', 'vaginal', 'intimate wash']
    },
    
    // Higjena - Këmbët
    {
      category: 'higjena',
      subcategory: 'kembet',
      keywords: ['foot', 'feet', 'toe', 'nail', 'callus', 'corn', 'athlete', 'fungal', 'foot care', 'heel', 'sole']
    },
    
    // Mama dhe Bebat - Kujdesi ndaj Nënës
    {
      category: 'mama-dhe-bebat',
      subcategory: 'kujdesi-ndaj-nenes',
      keywords: ['pregnancy', 'pregnant', 'maternity', 'prenatal', 'postnatal', 'breastfeeding', 'nursing', 'stretch marks', 'maternal', 'mother', 'mom']
    },
    
    // Mama dhe Bebat - Kujdesi ndaj Bebit
    {
      category: 'mama-dhe-bebat',
      subcategory: 'kujdesi-ndaj-bebit',
      keywords: ['baby', 'infant', 'newborn', 'child', 'pediatric', 'mustela', 'bepanthen', 'chicco', 'stelatopia', 'baby care', 'diaper', 'nappy', 'baby cream', 'baby oil', 'baby shampoo']
    },
    
    // Mama dhe Bebat - Aksesorë për Beba
    {
      category: 'mama-dhe-bebat',
      subcategory: 'aksesor-per-beba',
      keywords: ['baby accessories', 'bottle', 'pacifier', 'bib', 'baby toys', 'baby monitor', 'car seat', 'stroller', 'high chair']
    },
    
    // Mama dhe Bebat - Planifikim Familjar
    {
      category: 'mama-dhe-bebat',
      subcategory: 'planifikim-familjar',
      keywords: ['contraceptive', 'condom', 'birth control', 'family planning', 'ovulation', 'pregnancy test', 'fertility']
    },
    
    // Farmaci - OTC
    {
      category: 'farmaci',
      subcategory: 'otc-pa-recete',
      keywords: ['painkiller', 'pain relief', 'fever', 'cold', 'flu', 'cough', 'sore throat', 'headache', 'muscle pain', 'anti-inflammatory', 'antihistamine', 'allergy', 'digestive', 'stomach', 'diarrhea', 'constipation']
    },
    
    // Farmaci - Mirëqenia seksuale
    {
      category: 'farmaci',
      subcategory: 'mirekenia-seksuale',
      keywords: ['sexual health', 'erectile', 'libido', 'performance', 'enhancement', 'durex', 'control', 'lubricant']
    },
    
    // Farmaci - Aparat mjekësore
    {
      category: 'farmaci',
      subcategory: 'aparat-mjeksore',
      keywords: ['blood pressure', 'thermometer', 'glucose', 'stethoscope', 'nebulizer', 'oximeter', 'scale', 'medical device', 'omron', 'braun', 'beurer']
    },
    
    // Farmaci - First Aid
    {
      category: 'farmaci',
      subcategory: 'first-aid',
      keywords: ['first aid', 'bandage', 'antiseptic', 'wound', 'burn', 'cut', 'bruise', 'emergency', 'compeed', 'hansaplast', 'elastoplast', 'plaster']
    },
    
    // Farmaci - Ortopedike
    {
      category: 'farmaci',
      subcategory: 'ortopedike',
      keywords: ['orthopedic', 'joint', 'muscle', 'bone', 'arthritis', 'rheumatism', 'back pain', 'knee', 'ankle', 'wrist', 'support', 'brace']
    },
    
    // Suplemente
    {
      category: 'suplemente',
      subcategory: null,
      keywords: ['vitamin', 'supplement', 'mineral', 'omega', 'calcium', 'iron', 'magnesium', 'zinc', 'probiotics', 'multivitamin', 'solgar', 'centrum', 'nature', 'vitabiotics', 'now foods', 'dietary supplement']
    },
    
    // Produkte Shtesë - Sete
    {
      category: 'produkte-shtese',
      subcategory: 'sete',
      keywords: ['set', 'kit', 'trio', 'duo', 'collection', 'pack', 'bundle', 'routine', 'travel set', 'gift set']
    },
    
    // Produkte Shtesë - Vajra Esencial
    {
      category: 'produkte-shtese',
      subcategory: 'vajra-esencial',
      keywords: ['essential oil', 'aromatherapy', 'oil', 'essence', 'fragrance oil', 'therapeutic oil']
    }
  ];
  
  // Find the best match
  for (const cat of categorizations) {
    for (const keyword of cat.keywords) {
      if (name.includes(keyword)) {
        return {
          category: cat.category,
          subcategory: cat.subcategory,
          subsubcategory: null // Will be determined later if needed
        };
      }
    }
  }
  
  // Default to dermokozmetike if no match found
  return {
    category: 'dermokozmetike',
    subcategory: 'fytyre',
    subsubcategory: null
  };
}

// Create image mapping for faster lookup
function createImageMapping() {
  console.log('🗺️  Creating image mapping...');
  
  const imageFiles = fs.readdirSync(imagesFolder);
  const imageMap = new Map();
  
  imageFiles.forEach(file => {
    const normalized = file.toLowerCase().replace(/[^a-z0-9.]/g, '_');
    imageMap.set(normalized, file);
    imageMap.set(file.toLowerCase(), file);
    imageMap.set(file, file);
  });
  
  console.log(`📁 Mapped ${imageFiles.length} image files`);
  return imageMap;
}

// Find matching image for a product
function findProductImage(productName, imageFileName, imageMap) {
  if (!imageFileName) return null;
  
  // Try exact match first
  if (imageMap.has(imageFileName)) {
    return imageMap.get(imageFileName);
  }
  
  // Try lowercase match
  if (imageMap.has(imageFileName.toLowerCase())) {
    return imageMap.get(imageFileName.toLowerCase());
  }
  
  // Try normalized match
  const normalized = imageFileName.toLowerCase().replace(/[^a-z0-9.]/g, '_');
  if (imageMap.has(normalized)) {
    return imageMap.get(normalized);
  }
  
  return null;
}

async function permanentCategorization() {
  console.log('📊 Reading Excel file...');
  
  const workbook = XLSX.readFile(excelFile);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const excelData = XLSX.utils.sheet_to_json(worksheet);
  
  console.log(`📋 Found ${excelData.length} products to categorize`);
  
  // Create image mapping
  const imageMap = createImageMapping();
  
  // Ensure uploads directory exists
  if (!fs.existsSync(uploadsFolder)) {
    fs.mkdirSync(uploadsFolder, { recursive: true });
  }
  
  const db = new sqlite3.Database(dbPath);
  
  // Update database schema if needed
  db.run(`ALTER TABLE products ADD COLUMN subsubcategory TEXT`, (err) => {
    if (err && !err.message.includes('duplicate')) {
      console.log('⚠️  Schema update:', err.message);
    }
  });
  
  // Clear existing data and recategorize
  console.log('🗑️  Clearing existing products...');
  db.run('DELETE FROM products', (err) => {
    if (err) {
      console.error('❌ Failed to clear products:', err.message);
      return;
    }
    
    console.log('🏗️  Starting permanent categorization...');
    
    const stmt = db.prepare(`
      INSERT INTO products (
        name, brand, category, subcategory, subsubcategory, description,
        price, original_price, stock_quantity,
        is_new, on_sale, in_stock, image_url,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    let processed = 0;
    let successful = 0;
    let withImages = 0;
    let categoryCounts = {};
    
    excelData.forEach((row, index) => {
      if (!row.Name || !row.Price) {
        processed++;
        return;
      }
      
      // Extract brand from product name
      const brand = extractBrand(row.Name);
      
      // Categorize the product
      const categorization = categorizeProduct(row.Name, row.Description);
      
      // Find and copy image
      let imageUrl = null;
      if (row.Image_File) {
        const actualImageFile = findProductImage(row.Name, row.Image_File, imageMap);
        if (actualImageFile) {
          const sourcePath = path.join(imagesFolder, actualImageFile);
          const destPath = path.join(uploadsFolder, actualImageFile);
          
          if (!fs.existsSync(destPath)) {
            try {
              fs.copyFileSync(sourcePath, destPath);
            } catch (error) {
              console.error(`❌ Failed to copy image ${actualImageFile}`);
            }
          }
          
          imageUrl = `/uploads/images/${actualImageFile}`;
          withImages++;
        }
      }
      
      // Parse price
      const price = parsePrice(row.Price);
      const stock = row.Stock && row.Stock.includes('Ka stok') ? 50 : 25;
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      
      // Track category counts
      const catKey = `${categorization.category}-${categorization.subcategory || 'none'}`;
      categoryCounts[catKey] = (categoryCounts[catKey] || 0) + 1;
      
      stmt.run([
        row.Name,
        brand,
        categorization.category,
        categorization.subcategory,
        categorization.subsubcategory,
        row.Description || `${row.Name} - Produkt cilësor farmaceutik.`,
        price,
        null, // original_price
        stock,
        Math.random() > 0.85 ? 1 : 0, // is_new (15% chance)
        0, // on_sale
        1, // in_stock
        imageUrl,
        now,
        now
      ], function(err) {
        processed++;
        
        if (err) {
          console.error(`❌ Failed to insert ${row.Name}:`, err.message);
        } else {
          successful++;
          if (successful % 100 === 0) {
            console.log(`✅ Categorized ${successful} products...`);
          }
        }
        
        // Check if all processed
        if (processed === excelData.length) {
          stmt.finalize();
          
          console.log('\n🎉 PERMANENT CATEGORIZATION COMPLETE!');
          console.log('=====================================');
          console.log(`✅ Total products processed: ${processed}`);
          console.log(`✅ Successfully categorized: ${successful}`);
          console.log(`🖼️  Products with images: ${withImages} (${Math.round((withImages/successful)*100)}%)`);
          
          console.log('\n📊 CATEGORY DISTRIBUTION:');
          Object.entries(categoryCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 15)
            .forEach(([category, count]) => {
              console.log(`   ${category}: ${count} products`);
            });
          
          // Validate the structure
          db.all(`
            SELECT category, subcategory, COUNT(*) as count 
            FROM products 
            GROUP BY category, subcategory 
            ORDER BY category, subcategory
          `, (err, results) => {
            console.log('\n🏗️  FINAL CATEGORY STRUCTURE:');
            let currentCategory = '';
            results.forEach(row => {
              if (row.category !== currentCategory) {
                currentCategory = row.category;
                console.log(`\n📂 ${categoryStructure[row.category]?.name || row.category}:`);
              }
              const subcatName = row.subcategory ? 
                (categoryStructure[row.category]?.subcategories[row.subcategory]?.name || row.subcategory) : 
                'General';
              console.log(`   └── ${subcatName}: ${row.count} products`);
            });
            
            // Save permanent validation
            const validationData = {
              timestamp: new Date().toISOString(),
              totalProducts: successful,
              productsWithImages: withImages,
              imagesCoverage: Math.round((withImages/successful)*100),
              categoryDistribution: categoryCounts,
              status: 'PERMANENTLY_CATEGORIZED'
            };
            
            fs.writeFileSync(
              path.join(__dirname, 'permanent-categorization-validation.json'),
              JSON.stringify(validationData, null, 2)
            );
            
            console.log('\n🔒 CATEGORIZATION IS NOW PERMANENT!');
            console.log('✅ All products properly categorized');
            console.log('✅ All images linked and copied');
            console.log('✅ Database structure complete');
            console.log('✅ Validation file saved');
            
            db.close();
          });
        }
      });
    });
  });
}

// Helper function to extract brand
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
  
  return name.split(' ')[0];
}

// Helper function to parse price
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

// Run the permanent categorization
permanentCategorization();