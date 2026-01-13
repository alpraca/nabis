const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔍 ANALYZING MISCATEGORIZED PRODUCTS\n');
console.log('═'.repeat(80));

// Define correct categorization rules based on product keywords
const categorizationRules = [
  // MAMA DHE BEBAT (Baby Products)
  {
    category: 'mama-dhe-bebat',
    patterns: [
      /\b(baby|bebé|bebe|infant|newborn|neonato|latte artificiale|formula)\b/i,
      /\b(pamper|diaper|pannolino|salvietta|wipes)\b/i,
      /\b(biberon|bottle|ciuccio|pacifier|tettarella)\b/i,
    ],
    brands: ['Holle', 'Bambo', 'Pingo', 'Pampers', 'Huggies', 'Chicco', 'Avent', 'Suavinex', 'Plasmon', 'Mellin'],
    priority: 10
  },
  
  // SUPLEMENTE (Supplements & Vitamins)
  {
    category: 'suplemente',
    patterns: [
      /\b(vitamin|supplement|multivitamin|integratore)\b/i,
      /\b(omega|calcium|magnesium|zinc|iron|d3|b12|collagen|protein|amino)\b/i,
      /\b(probiotic|prebiotic|flora)\b/i,
      /\b(çaj|tea|tisana|herbal)\b/i,
    ],
    brands: ['Solgar', 'Now Foods', 'Vitabiotics', 'Centrum', 'Nature\'s Bounty', 'Swanson', 'HealthAid', 'Supradyn'],
    priority: 9
  },
  
  // FARMACI (Medical/Pharmacy Products)
  {
    category: 'farmaci',
    patterns: [
      /\b(bandage|cerotto|plaster|benda|medicazione)\b/i,
      /\b(garza|gauze|cotone|cotton|disinfettante)\b/i,
      /\b(termometro|thermometer|misuratore|pressure|sfigmomanometro)\b/i,
      /\b(siringa|syringe|ago|needle|lancetta)\b/i,
      /\b(medicinal|medicine|farmaco|drug|medicamento)\b/i,
    ],
    brands: ['Pic', 'Omron', 'Beurer', 'Hartmann', 'Master Aid'],
    priority: 8
  },
  
  // HIGJENA (Hygiene Products)
  {
    category: 'higjena',
    patterns: [
      /\b(soap|sapone|shampoo|gel doccia|bagno|douche)\b/i,
      /\b(deodorant|dentifricio|toothpaste|mouthwash|collutorio)\b/i,
      /\b(cotton|cotone|swab|bastoncino|dischetti)\b/i,
      /\b(toilet paper|carta igienica|tissue|fazzoletti)\b/i,
      /\b(hand sanitizer|gel igienizzante|antibacterial)\b/i,
    ],
    brands: ['Dove', 'Nivea', 'Neutrogena', 'Colgate', 'Oral-B'],
    priority: 7
  },
  
  // DERMOKOZMETIKE (Dermocosmetics)
  {
    category: 'dermokozmetikë',
    patterns: [
      /\b(cream|crema|lotion|serum|gel|balsamo|balm)\b/i,
      /\b(face|viso|fytyre|facial|pelle|skin)\b/i,
      /\b(anti.?age|anti.?rughe|wrinkle|lifting)\b/i,
      /\b(spf|sun|solar|solare|protection|protezione)\b/i,
      /\b(makeup|trucco|foundation|mascara|lipstick)\b/i,
    ],
    brands: ['Vichy', 'La Roche-Posay', 'Avene', 'Bioderma', 'Eucerin', 'CeraVe', 'Lierac', 'Nuxe', 'Uriage'],
    priority: 6
  }
];

// Function to determine correct category
function determineCorrectCategory(product) {
  const searchText = `${product.name} ${product.brand} ${product.description || ''}`.toLowerCase();
  
  // Special cases - handle edge cases first
  // HiPP baby food products
  if (product.brand && product.brand.toLowerCase().includes('hipp') && 
      (searchText.includes('fruit') || searchText.includes('organic'))) {
    return 'mama-dhe-bebat';
  }
  
  // Vichy/Uriage Collagen skincare products (not supplements)
  if ((product.brand && (product.brand.toLowerCase().includes('vichy') || 
       product.brand.toLowerCase().includes('uriage'))) && 
      searchText.includes('collagen')) {
    return 'dermokozmetikë';
  }
  
  // Collagen creams (not supplements) - if contains cream/lotion/serum keywords
  if (searchText.includes('collagen') && 
      (searchText.includes('cream') || searchText.includes('lotion') || 
       searchText.includes('serum') || searchText.includes('crème') || 
       searchText.includes('soin') || searchText.includes('gel') ||
       searchText.includes('specialist') || searchText.includes('booster'))) {
    return 'dermokozmetikë';
  }
  
  let bestMatch = null;
  let highestPriority = -1;
  
  for (const rule of categorizationRules) {
    // Check brand match
    if (rule.brands.some(brand => product.brand && product.brand.toLowerCase().includes(brand.toLowerCase()))) {
      if (rule.priority > highestPriority) {
        bestMatch = rule.category;
        highestPriority = rule.priority;
      }
    }
    
    // Check pattern match
    for (const pattern of rule.patterns) {
      if (pattern.test(searchText)) {
        if (rule.priority > highestPriority) {
          bestMatch = rule.category;
          highestPriority = rule.priority;
        }
        break;
      }
    }
  }
  
  return bestMatch;
}

// Find all miscategorized products
async function findMiscategorizedProducts() {
  return new Promise((resolve, reject) => {
    db.all('SELECT id, name, brand, category, subcategory, description FROM products', [], (err, products) => {
      if (err) {
        reject(err);
        return;
      }
      
      const miscategorized = [];
      
      for (const product of products) {
        const correctCategory = determineCorrectCategory(product);
        
        if (correctCategory && product.category !== correctCategory) {
          miscategorized.push({
            id: product.id,
            name: product.name,
            brand: product.brand,
            currentCategory: product.category,
            correctCategory: correctCategory,
            subcategory: product.subcategory
          });
        }
      }
      
      resolve(miscategorized);
    });
  });
}

// Fix the miscategorized products
async function fixProducts(miscategorized) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('UPDATE products SET category = ? WHERE id = ?');
    
    let fixed = 0;
    const errors = [];
    
    for (const product of miscategorized) {
      stmt.run([product.correctCategory, product.id], (err) => {
        if (err) {
          errors.push({ product, error: err.message });
        } else {
          fixed++;
        }
        
        if (fixed + errors.length === miscategorized.length) {
          stmt.finalize();
          resolve({ fixed, errors });
        }
      });
    }
    
    if (miscategorized.length === 0) {
      resolve({ fixed: 0, errors: [] });
    }
  });
}

// Main execution
(async () => {
  try {
    console.log('\n📊 Step 1: Analyzing products...\n');
    
    const miscategorized = await findMiscategorizedProducts();
    
    console.log(`\n🔍 Found ${miscategorized.length} miscategorized products\n`);
    
    if (miscategorized.length === 0) {
      console.log('✅ All products are correctly categorized!');
      db.close();
      return;
    }
    
    // Group by category changes
    const changes = {};
    for (const prod of miscategorized) {
      const key = `${prod.currentCategory} → ${prod.correctCategory}`;
      if (!changes[key]) {
        changes[key] = [];
      }
      changes[key].push(prod);
    }
    
    console.log('📋 CATEGORIZATION CHANGES:\n');
    for (const [change, products] of Object.entries(changes)) {
      console.log(`\n  ${change} (${products.length} products)`);
      products.slice(0, 5).forEach(p => {
        console.log(`    • ${p.brand} - ${p.name.substring(0, 60)}...`);
      });
      if (products.length > 5) {
        console.log(`    ... and ${products.length - 5} more`);
      }
    }
    
    console.log('\n' + '═'.repeat(80));
    console.log('\n💾 Step 2: Applying fixes...\n');
    
    const result = await fixProducts(miscategorized);
    
    console.log('\n' + '═'.repeat(80));
    console.log('\n✅ RESULTS:\n');
    console.log(`  ✓ Fixed: ${result.fixed} products`);
    
    if (result.errors.length > 0) {
      console.log(`  ✗ Errors: ${result.errors.length} products`);
      console.log('\n❌ ERRORS:');
      result.errors.forEach(({ product, error }) => {
        console.log(`  • ${product.name}: ${error}`);
      });
    }
    
    console.log('\n🎉 Done! All products have been recategorized correctly.\n');
    
    db.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    db.close();
    process.exit(1);
  }
})();
