/**
 * COMPLETE CATEGORY REORGANIZATION SYSTEM
 * This will reorganize all products into the proper Albanian category structure
 * and ensure all categories/subcategories are available in the navbar
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const XLSX = require('xlsx');
const fs = require('fs');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const excelFile = path.join(__dirname, 'farmaon_products.xlsx');

console.log('🚀 COMPLETE CATEGORY REORGANIZATION SYSTEM');
console.log('==========================================');

// Complete Albanian category structure
const categoryStructure = {
  'Dermokozmetikë': {
    'Fytyre': [],
    'Flokët': [],
    'Trupi': [],
    'SPF': [],
    'Tanning': [],
    'Makeup': []
  },
  'Higjena': {
    'Depilim dhe Intime': [],
    'Goja': [],
    'Këmbët': [],
    'Trupi': []
  },
  'Farmaci': {
    'OTC (pa recetë)': [],
    'Mirëqenia seksuale': [],
    'Aparat mjekësore': [],
    'First Aid (Ndihmë e Parë)': [],
    'Ortopedike': []
  },
  'Mama dhe Bebat': {
    'Kujdesi ndaj Nënës': {
      'Shtatzëni': [],
      'Ushqyerje me Gji': []
    },
    'Kujdesi ndaj Bebit': {
      'Pelena': [],
      'Higjena': [],
      'SPF': [],
      'Suplementa': []
    },
    'Aksesore për Beba': [],
    'Planifikim Familjar': []
  },
  'Produkte Shtesë': {
    'Sete': [],
    'Vajra Esencial': []
  },
  'Suplemente': {}
};

// Advanced product categorization logic
function categorizeProduct(productName, description = '') {
  const name = productName.toLowerCase();
  const desc = description.toLowerCase();
  const fullText = `${name} ${desc}`;

  // Face products (Dermokozmetikë > Fytyre)
  if (fullText.match(/\b(face|facial|serum|cream|cleanser|moisturizer|toner|mask|eye|anti.?age|cleanance|effaclar|toleriane|hydreane|micellar|anti.?wrinkle|vitamin.?c|retinol|hyaluronic|niacinamide|peptide|exfoliat|peel|brightening|whitening|spot|acne|blemish|pore|blackhead|glycolic|salicylic|benzoyl|dermatological)\b/)) {
    return { main: 'Dermokozmetikë', sub: 'Fytyre' };
  }

  // Hair products (Dermokozmetikë > Flokët)
  if (fullText.match(/\b(hair|shampoo|conditioner|treatment|scalp|kelual|anaphase|dercos|anti.?dandruff|dry.?hair|oily.?hair|damaged.?hair|hair.?loss|volume|shine|split.?ends|keratin|protein|argan|biotin|follicle)\b/)) {
    return { main: 'Dermokozmetikë', sub: 'Flokët' };
  }

  // Body products (Dermokozmetikë > Trupi)
  if (fullText.match(/\b(body|lotion|shower|gel|deodorant|hand|foot|atoderm|lipikar|moisturizing|firming|anti.?cellulite|stretch.?marks|massage|exfoliating|scrub|oil|butter|milk)\b/) && !fullText.match(/\b(baby|infant|oral|dental)\b/)) {
    return { main: 'Dermokozmetikë', sub: 'Trupi' };
  }

  // SPF products (Dermokozmetikë > SPF)
  if (fullText.match(/\b(spf|sun|solar|protection|anthelios|capital|uv|sunscreen|sunblock|after.?sun|tan|bronze)\b/) && !fullText.match(/\b(baby|infant)\b/)) {
    return { main: 'Dermokozmetikë', sub: 'SPF' };
  }

  // Tanning products (Dermokozmetikë > Tanning)
  if (fullText.match(/\b(tanning|tan|bronze|self.?tan|sunless|golden|dark|gradual.?tan)\b/)) {
    return { main: 'Dermokozmetikë', sub: 'Tanning' };
  }

  // Makeup products (Dermokozmetikë > Makeup)
  if (fullText.match(/\b(makeup|foundation|concealer|powder|blush|lipstick|mascara|eyeliner|eyeshadow|lip.?gloss|primer|highlighter|contour|bronzer|setting|fixing|remover|micellar.?water|cleansing.?oil)\b/)) {
    return { main: 'Dermokozmetikë', sub: 'Makeup' };
  }

  // Oral hygiene (Higjena > Goja)
  if (fullText.match(/\b(oral|tooth|teeth|dental|toothpaste|mouthwash|floss|whitening|breath|gum|colgate|oral.?b|sensodyne|listerine|paradontax|plaque|tartar|cavity)\b/)) {
    return { main: 'Higjena', sub: 'Goja' };
  }

  // Intimate and hair removal (Higjena > Depilim dhe Intime)
  if (fullText.match(/\b(intimate|depilation|hair.?removal|wax|epilat|razor|shave|feminine|vaginal|ph|lactacyd|saugella|candida|yeast)\b/)) {
    return { main: 'Higjena', sub: 'Depilim dhe Intime' };
  }

  // Foot care (Higjena > Këmbët)
  if (fullText.match(/\b(foot|feet|heel|callus|corn|athlete.?foot|fungal|nail|pedicure|cracked.?heels|dry.?feet|foot.?cream|antifungal)\b/)) {
    return { main: 'Higjena', sub: 'Këmbët' };
  }

  // Body hygiene (Higjena > Trupi)
  if (fullText.match(/\b(hygiene|antibacterial|antiseptic|soap|wash|cleansing|sanitizer|wipes|douche)\b/) && !fullText.match(/\b(face|facial|baby|infant)\b/)) {
    return { main: 'Higjena', sub: 'Trupi' };
  }

  // Pregnancy products (Mama dhe Bebat > Kujdesi ndaj Nënës > Shtatzëni)
  if (fullText.match(/\b(pregnancy|pregnant|prenatal|maternity|stretch.?marks|morning.?sickness|folic.?acid|iron|calcium|prenatal.?vitamin)\b/)) {
    return { main: 'Mama dhe Bebat', sub: 'Kujdesi ndaj Nënës', subsub: 'Shtatzëni' };
  }

  // Breastfeeding products (Mama dhe Bebat > Kujdesi ndaj Nënës > Ushqyerje me Gji)
  if (fullText.match(/\b(breastfeeding|nursing|breast|nipple|lactation|milk.?production|galactagogue)\b/)) {
    return { main: 'Mama dhe Bebat', sub: 'Kujdesi ndaj Nënës', subsub: 'Ushqyerje me Gji' };
  }

  // Baby diapers (Mama dhe Bebat > Kujdesi ndaj Bebit > Pelena)
  if (fullText.match(/\b(diaper|nappy|pampers|huggies|diaper.?rash)\b/)) {
    return { main: 'Mama dhe Bebat', sub: 'Kujdesi ndaj Bebit', subsub: 'Pelena' };
  }

  // Baby hygiene (Mama dhe Bebat > Kujdesi ndaj Bebit > Higjena)
  if (fullText.match(/\b(baby|infant|newborn)\b/) && fullText.match(/\b(wash|soap|shampoo|wipes|oil|powder|lotion|cream|bath)\b/)) {
    return { main: 'Mama dhe Bebat', sub: 'Kujdesi ndaj Bebit', subsub: 'Higjena' };
  }

  // Baby SPF (Mama dhe Bebat > Kujdesi ndaj Bebit > SPF)
  if (fullText.match(/\b(baby|infant)\b/) && fullText.match(/\b(spf|sun|protection|sunscreen)\b/)) {
    return { main: 'Mama dhe Bebat', sub: 'Kujdesi ndaj Bebit', subsub: 'SPF' };
  }

  // Baby supplements (Mama dhe Bebat > Kujdesi ndaj Bebit > Suplementa)
  if (fullText.match(/\b(baby|infant)\b/) && fullText.match(/\b(vitamin|supplement|drops|syrup|probiotics|d3|iron)\b/)) {
    return { main: 'Mama dhe Bebat', sub: 'Kujdesi ndaj Bebit', subsub: 'Suplementa' };
  }

  // Baby formula and food (Mama dhe Bebat > Kujdesi ndaj Bebit)
  if (fullText.match(/\b(aptamil|nan|nutrilon|similac|enfamil|formula|baby.?food|cereal|puree)\b/)) {
    return { main: 'Mama dhe Bebat', sub: 'Kujdesi ndaj Bebit' };
  }

  // Baby accessories (Mama dhe Bebat > Aksesore për Beba)
  if (fullText.match(/\b(baby|infant)\b/) && fullText.match(/\b(bottle|pacifier|teether|bib|carrier|stroller|car.?seat|high.?chair|monitor|thermometer)\b/)) {
    return { main: 'Mama dhe Bebat', sub: 'Aksesore për Beba' };
  }

  // Family planning (Mama dhe Bebat > Planifikim Familjar)
  if (fullText.match(/\b(contraceptive|condom|birth.?control|pregnancy.?test|ovulation|fertility|family.?planning|durex|control|sagami)\b/)) {
    return { main: 'Mama dhe Bebat', sub: 'Planifikim Familjar' };
  }

  // OTC medicines (Farmaci > OTC)
  if (fullText.match(/\b(paracetamol|ibuprofen|aspirin|acetaminophen|pain.?relief|fever|headache|cold|flu|cough|throat|antihistamine|allergy|diarrhea|constipation|antacid|heartburn|sleep|melatonin)\b/)) {
    return { main: 'Farmaci', sub: 'OTC (pa recetë)' };
  }

  // Sexual wellness (Farmaci > Mirëqenia seksuale)
  if (fullText.match(/\b(sexual|erectile|libido|viagra|cialis|lubricant|enhancement|performance|stamina)\b/)) {
    return { main: 'Farmaci', sub: 'Mirëqenia seksuale' };
  }

  // Medical devices (Farmaci > Aparat mjekësore)
  if (fullText.match(/\b(thermometer|blood.?pressure|glucose|meter|stethoscope|nebulizer|inhaler|syringe|bandage|gauze|medical.?device|monitor|omron|braun|beurer)\b/)) {
    return { main: 'Farmaci', sub: 'Aparat mjekësore' };
  }

  // First aid (Farmaci > First Aid)
  if (fullText.match(/\b(first.?aid|wound|cut|burn|antiseptic|bandage|plaster|compeed|hansaplast|band.?aid|elastoplast|emergency|trauma)\b/)) {
    return { main: 'Farmaci', sub: 'First Aid (Ndihmë e Parë)' };
  }

  // Orthopedic (Farmaci > Ortopedike)
  if (fullText.match(/\b(orthopedic|joint|arthritis|muscle|back|neck|knee|elbow|wrist|ankle|support|brace|compression|physiotherapy|rehabilitation)\b/)) {
    return { main: 'Farmaci', sub: 'Ortopedike' };
  }

  // Essential oils (Produkte Shtesë > Vajra Esencial)
  if (fullText.match(/\b(essential.?oil|aromatherapy|lavender|eucalyptus|tea.?tree|peppermint|rosemary|chamomile|diffuser|pure.?oil)\b/)) {
    return { main: 'Produkte Shtesë', sub: 'Vajra Esencial' };
  }

  // Gift sets (Produkte Shtesë > Sete)
  if (fullText.match(/\b(set|kit|trio|duo|collection|gift|combo|bundle|travel.?size|routine)\b/)) {
    return { main: 'Produkte Shtesë', sub: 'Sete' };
  }

  // Supplements (Suplemente)
  if (fullText.match(/\b(vitamin|supplement|mineral|omega|calcium|magnesium|zinc|iron|d3|b12|c|multivitamin|probiotics|collagen|protein|amino|solgar|centrum|nature|now.?foods|vitabiotics)\b/)) {
    return { main: 'Suplemente', sub: null };
  }

  // Default fallback based on brand patterns
  if (fullText.match(/\b(vichy|avene|la.?roche.?posay|eucerin|bioderma|cerave|nivea)\b/)) {
    return { main: 'Dermokozmetikë', sub: 'Fytyre' };
  }

  // Final fallback
  return { main: 'Dermokozmetikë', sub: 'Fytyre' };
}

const db = new sqlite3.Database(dbPath);

// First, update the database schema
console.log('📋 Updating database schema...');

const schemaUpdates = [
  'ALTER TABLE products ADD COLUMN main_category TEXT',
  'ALTER TABLE products ADD COLUMN sub_category TEXT', 
  'ALTER TABLE products ADD COLUMN sub_sub_category TEXT'
];

let schemaCount = 0;
schemaUpdates.forEach(sql => {
  db.run(sql, (err) => {
    schemaCount++;
    if (err && !err.message.includes('duplicate')) {
      console.log(`⚠️  Schema update: ${err.message}`);
    } else if (!err) {
      console.log(`✅ Added new category column`);
    }
    
    if (schemaCount === schemaUpdates.length) {
      // Now read Excel and categorize products
      console.log('\n📊 Reading and categorizing products...');
      
      const workbook = XLSX.readFile(excelFile);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const excelData = XLSX.utils.sheet_to_json(worksheet);
      
      console.log(`📦 Processing ${excelData.length} products...`);
      
      const categoryStats = {};
      let processed = 0;
      
      const stmt = db.prepare(`
        UPDATE products 
        SET main_category = ?, sub_category = ?, sub_sub_category = ?
        WHERE name = ?
      `);
      
      excelData.forEach((row, index) => {
        if (!row.Name) return;
        
        const category = categorizeProduct(row.Name, row.Description || '');
        
        // Track statistics
        const catKey = `${category.main} > ${category.sub || 'None'} > ${category.subsub || 'None'}`;
        categoryStats[catKey] = (categoryStats[catKey] || 0) + 1;
        
        stmt.run([
          category.main,
          category.sub,
          category.subsub || null,
          row.Name
        ], function(err) {
          processed++;
          
          if (err) {
            console.error(`❌ Failed to update ${row.Name}:`, err.message);
          } else if (processed <= 10) {
            console.log(`✅ ${processed}. ${row.Name} -> ${category.main} > ${category.sub || 'None'}`);
          } else if (processed % 100 === 0) {
            console.log(`📊 Processed ${processed} products...`);
          }
          
          if (processed === excelData.length) {
            stmt.finalize();
            
            console.log('\n📈 CATEGORIZATION RESULTS');
            console.log('========================');
            
            // Show top categories
            const sortedStats = Object.entries(categoryStats)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 15);
            
            sortedStats.forEach(([cat, count]) => {
              console.log(`${count.toString().padStart(3)} products: ${cat}`);
            });
            
            // Create categories table for navbar
            console.log('\n🔧 Creating categories structure for navbar...');
            
            db.run('DROP TABLE IF EXISTS categories', () => {
              db.run(`
                CREATE TABLE categories (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  main_category TEXT NOT NULL,
                  sub_category TEXT,
                  sub_sub_category TEXT,
                  product_count INTEGER DEFAULT 0,
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
              `, () => {
                
                // Insert all category combinations
                const categoryInserts = [];
                
                function addCategories(structure, main = null, sub = null) {
                  Object.keys(structure).forEach(key => {
                    if (typeof structure[key] === 'object' && !Array.isArray(structure[key])) {
                      if (!main) {
                        // This is a main category
                        categoryInserts.push([key, null, null]);
                        addCategories(structure[key], key);
                      } else if (!sub) {
                        // This is a sub category
                        categoryInserts.push([main, key, null]);
                        addCategories(structure[key], main, key);
                      } else {
                        // This is a sub-sub category
                        categoryInserts.push([main, sub, key]);
                      }
                    } else {
                      // This is a final category
                      if (main && sub) {
                        categoryInserts.push([main, sub, null]);
                      } else if (main) {
                        categoryInserts.push([main, key, null]);
                      }
                    }
                  });
                }
                
                addCategories(categoryStructure);
                
                const catStmt = db.prepare('INSERT INTO categories (main_category, sub_category, sub_sub_category) VALUES (?, ?, ?)');
                
                categoryInserts.forEach(([main, sub, subsub]) => {
                  catStmt.run([main, sub, subsub]);
                });
                
                catStmt.finalize();
                
                // Update product counts
                db.run(`
                  UPDATE categories 
                  SET product_count = (
                    SELECT COUNT(*) 
                    FROM products 
                    WHERE products.main_category = categories.main_category 
                    AND (categories.sub_category IS NULL OR products.sub_category = categories.sub_category)
                    AND (categories.sub_sub_category IS NULL OR products.sub_sub_category = categories.sub_sub_category)
                  )
                `, () => {
                  
                  // Final verification
                  db.get('SELECT COUNT(*) as total FROM products WHERE main_category IS NOT NULL', (err, row) => {
                    console.log(`\n✅ Categorized ${row.total} products`);
                    
                    db.all('SELECT main_category, COUNT(*) as count FROM products GROUP BY main_category ORDER BY count DESC', (err, mainCats) => {
                      console.log('\n🏷️  MAIN CATEGORY DISTRIBUTION:');
                      mainCats.forEach(cat => {
                        console.log(`   ${cat.main_category}: ${cat.count} products`);
                      });
                      
                      console.log('\n🎉 CATEGORY REORGANIZATION COMPLETE!');
                      console.log('====================================');
                      console.log('✅ All products categorized into Albanian structure');
                      console.log('✅ Categories table created for navbar');
                      console.log('✅ Product counts updated');
                      console.log('✅ All categories/subcategories available in navbar');
                      console.log('✅ Empty categories preserved for future use');
                      
                      db.close();
                    });
                  });
                });
              });
            });
          }
        });
      });
    }
  });
});