const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

console.log('\n🔧 RREGULLIMI I NËNKATEGORIVE PËR TË GJITHË PRODUKTET\n');
console.log('═'.repeat(80));

// Comprehensive subcategory mapping rules
const subcategoryRules = [
  // ============= SUPLEMENTE =============
  {
    category: 'suplemente',
    subcategory: 'Proteinat',
    patterns: [/\b(protein|proteine|whey|casein|amino|bcaa)\b/i],
    priority: 100
  },
  {
    category: 'suplemente',
    subcategory: 'Vitaminat dhe Mineralet',
    patterns: [/\b(vitamin|mineral|calcium|magnesium|zinc|iron|d3|b12|omega|multivitamin|integratore)\b/i],
    priority: 90
  },
  {
    category: 'suplemente',
    subcategory: 'Çajra Mjekësore',
    patterns: [/\b(çaj|tea|tisana|infusion|herbal)\b/i],
    priority: 85
  },
  {
    category: 'suplemente',
    subcategory: 'Probiotic & Digestim',
    patterns: [/\b(probiotic|prebiotic|flora|digestive|digestion|lacto)\b/i],
    priority: 80
  },
  
  // ============= MAMA DHE BEBAT =============
  {
    category: 'mama-dhe-bebat',
    subcategory: 'Pelena',
    patterns: [/\b(diaper|pelena|pannolin|pamper|nappy)\b/i],
    brands: ['Pampers', 'Bambo Nature', 'Huggies'],
    exclude: [/\b(cream|lotion|wash|shampoo|oil|wipes|salviette)\b/i],
    priority: 100
  },
  {
    category: 'mama-dhe-bebat',
    subcategory: 'Higjena',
    patterns: [/\b(wipes|salviette|wash|shampoo|bath|bagno|doccia|sapone|baby soap|baby shampoo)\b/i],
    priority: 95
  },
  {
    category: 'mama-dhe-bebat',
    subcategory: 'Kujdesi për Lëkurën',
    patterns: [/\b(cream|lotion|oil|olio|crema|balsam|moisturizer|baby cream|baby lotion|baby oil)\b/i],
    priority: 90
  },
  {
    category: 'mama-dhe-bebat',
    subcategory: 'Ushqim',
    patterns: [/\b(formula|milk|latte|formula infantile|baby food|puree|organic|bio)\b/i],
    brands: ['Holle', 'HiPP', 'Mellin', 'Plasmon'],
    priority: 95
  },
  {
    category: 'mama-dhe-bebat',
    subcategory: 'Kujdesi për Nënën',
    patterns: [/\b(maternity|pregnancy|gravidanza|shtatzani|gravid|breast|gji|nursing|allattamento)\b/i],
    priority: 92
  },
  {
    category: 'mama-dhe-bebat',
    subcategory: 'Aksesor per Beba',
    patterns: [/\b(bottle|biberon|pacifier|ciuccio|tettarella|nipple|thermometer|termometro)\b/i],
    priority: 88
  },
  
  // ============= DERMOKOZMETIKË =============
  {
    category: 'dermokozmetikë',
    subcategory: 'SPF & Mbrojtje nga Dielli',
    patterns: [/\b(spf|sun|solar|solare|protection|protezione|doposole|after sun)\b/i],
    priority: 100
  },
  {
    category: 'dermokozmetikë',
    subcategory: 'Anti-Age & Anti-Rrudhe',
    patterns: [/\b(anti.?age|anti.?aging|anti.?rughe|anti.?wrinkle|lifting|firming|rassodante)\b/i],
    priority: 98
  },
  {
    category: 'dermokozmetikë',
    subcategory: 'Fytyre',
    patterns: [/\b(face|viso|fytyre|facial|visage|cleanser|detergente|micellar|tonico|toner|serum)\b/i],
    exclude: [/\b(body|corpo|trupi|shampoo|capelli|hair)\b/i],
    priority: 85
  },
  {
    category: 'dermokozmetikë',
    subcategory: 'Trupi',
    patterns: [/\b(body|corpo|trupi|lotion corpo|body cream|body milk|gel doccia|shower gel)\b/i],
    priority: 82
  },
  {
    category: 'dermokozmetikë',
    subcategory: 'Makeup',
    patterns: [/\b(makeup|trucco|foundation|mascara|lipstick|rossetto|eye shadow|blush|bb cream|cc cream)\b/i],
    priority: 95
  },
  {
    category: 'dermokozmetikë',
    subcategory: 'Flokët',
    patterns: [/\b(hair|capelli|floket|shampoo|conditioner|balsamo|maschera capelli|hair mask)\b/i],
    priority: 80
  },
  {
    category: 'dermokozmetikë',
    subcategory: 'Duart Dhe Thonjt',
    patterns: [/\b(hand|mani|duar|nail|unghie|thonj|hand cream|nail polish)\b/i],
    priority: 88
  },
  {
    category: 'dermokozmetikë',
    subcategory: 'Buzet',
    patterns: [/\b(lip|labbra|buze|lip balm|lip gloss|balsamo labbra)\b/i],
    priority: 87
  },
  {
    category: 'dermokozmetikë',
    subcategory: 'Sytë',
    patterns: [/\b(eye|occhi|sy|contour|contorno occhi|eye cream)\b/i],
    exclude: [/\b(makeup|mascara|shadow)\b/i],
    priority: 86
  },
  {
    category: 'dermokozmetikë',
    subcategory: 'Anti Celulit',
    patterns: [/\b(cellulite|cellulit|anticellulite|snellente|slimming)\b/i],
    priority: 92
  },
  
  // ============= HIGJENA =============
  {
    category: 'higjena',
    subcategory: 'Flokët',
    patterns: [/\b(shampoo|shampo|conditioner|hair|capelli|floket)\b/i],
    priority: 95
  },
  {
    category: 'higjena',
    subcategory: 'Trupi',
    patterns: [/\b(shower|doccia|bagno|bath|gel doccia|body wash|soap|sapone)\b/i],
    priority: 90
  },
  {
    category: 'higjena',
    subcategory: 'Goja',
    patterns: [/\b(toothpaste|dentifricio|mouthwash|collutorio|oral|dental|teeth|denti)\b/i],
    priority: 92
  },
  {
    category: 'higjena',
    subcategory: 'Deodorante',
    patterns: [/\b(deodorant|deodorante|antidjerse|antiperspirant)\b/i],
    priority: 94
  },
  {
    category: 'higjena',
    subcategory: 'Depilim',
    patterns: [/\b(depilator|wax|razor|rasoio|depilazione|hair removal)\b/i],
    priority: 88
  },
  {
    category: 'higjena',
    subcategory: 'Higjena Intime',
    patterns: [/\b(intimate|intim|hygiene|igiene intima|detergente intimo)\b/i],
    priority: 93
  },
  
  // ============= FARMACI =============
  {
    category: 'farmaci',
    subcategory: 'Aparat mjeksore',
    patterns: [/\b(thermometer|termometro|blood pressure|misuratore|nebulizer|aerosol|glucose meter)\b/i],
    brands: ['Omron', 'Beurer', 'Pic'],
    priority: 100
  },
  {
    category: 'farmaci',
    subcategory: 'First Aid (Ndihma e Pare)',
    patterns: [/\b(bandage|benda|cerotto|plaster|gauze|garza|disinfettante|disinfectant|cotton|cotone)\b/i],
    priority: 95
  },
  {
    category: 'farmaci',
    subcategory: 'Mirëqenia seksuale',
    patterns: [/\b(condom|preservativo|profilattico|lubricant|lubrificante)\b/i],
    brands: ['Durex', 'Control'],
    priority: 98
  }
];

function determineSubcategory(product) {
  const searchText = `${product.name} ${product.brand} ${product.description || ''}`.toLowerCase();
  
  let bestMatch = null;
  let highestPriority = -1;
  
  for (const rule of subcategoryRules) {
    // Skip if not matching category
    if (product.category !== rule.category) continue;
    
    // Check exclusion patterns first
    if (rule.exclude) {
      let excluded = false;
      for (const excludePattern of rule.exclude) {
        if (excludePattern.test(searchText)) {
          excluded = true;
          break;
        }
      }
      if (excluded) continue;
    }
    
    // Check brand match
    if (rule.brands && rule.brands.some(brand => 
      product.brand && product.brand.toLowerCase().includes(brand.toLowerCase()))) {
      if (rule.priority > highestPriority) {
        bestMatch = rule.subcategory;
        highestPriority = rule.priority;
      }
    }
    
    // Check pattern match
    if (rule.patterns) {
      for (const pattern of rule.patterns) {
        if (pattern.test(searchText)) {
          if (rule.priority > highestPriority) {
            bestMatch = rule.subcategory;
            highestPriority = rule.priority;
          }
          break;
        }
      }
    }
  }
  
  return bestMatch;
}

// Process all products
async function fixAllSubcategories() {
  return new Promise((resolve, reject) => {
    db.all('SELECT id, name, brand, category, subcategory, description FROM products', [], (err, products) => {
      if (err) {
        reject(err);
        return;
      }
      
      const updates = [];
      const stats = {};
      
      for (const product of products) {
        const correctSubcategory = determineSubcategory(product);
        
        if (correctSubcategory && product.subcategory !== correctSubcategory) {
          updates.push({
            id: product.id,
            name: product.name,
            brand: product.brand,
            category: product.category,
            oldSubcategory: product.subcategory,
            newSubcategory: correctSubcategory
          });
          
          const key = `${product.category} | ${correctSubcategory}`;
          stats[key] = (stats[key] || 0) + 1;
        }
      }
      
      resolve({ updates, stats });
    });
  });
}

async function applyUpdates(updates) {
  return new Promise((resolve, reject) => {
    if (updates.length === 0) {
      resolve({ fixed: 0, errors: [] });
      return;
    }
    
    const stmt = db.prepare('UPDATE products SET subcategory = ? WHERE id = ?');
    
    let fixed = 0;
    const errors = [];
    
    for (const update of updates) {
      stmt.run([update.newSubcategory, update.id], (err) => {
        if (err) {
          errors.push({ product: update, error: err.message });
        } else {
          fixed++;
        }
        
        if (fixed + errors.length === updates.length) {
          stmt.finalize();
          resolve({ fixed, errors });
        }
      });
    }
  });
}

// Main execution
(async () => {
  try {
    console.log('\n📊 Step 1: Duke analizuar produktet...\n');
    
    const { updates, stats } = await fixAllSubcategories();
    
    console.log(`\n🔍 Gjetur ${updates.length} produkte që kanë nevojë për rregullim\n`);
    
    if (updates.length === 0) {
      console.log('✅ Të gjitha nënkategorit janë të sakta!');
      db.close();
      return;
    }
    
    console.log('📋 NDRYSHIMET NË NËNKATEGORI:\n');
    const sortedStats = Object.entries(stats).sort((a, b) => b[1] - a[1]);
    for (const [change, count] of sortedStats) {
      console.log(`  ${change.padEnd(60)} : ${count} produkte`);
    }
    
    console.log('\n' + '═'.repeat(80));
    console.log('\n💾 Step 2: Duke aplikuar ndryshimet...\n');
    
    const result = await applyUpdates(updates);
    
    console.log('\n' + '═'.repeat(80));
    console.log('\n✅ REZULTATET:\n');
    console.log(`  ✓ U rregulluan: ${result.fixed} produkte`);
    
    if (result.errors.length > 0) {
      console.log(`  ✗ Gabime: ${result.errors.length} produkte`);
    }
    
    console.log('\n🎉 Mbaruan! Të gjitha nënkategorit janë rregulluar.\n');
    
    db.close();
  } catch (error) {
    console.error('❌ Gabim:', error.message);
    db.close();
    process.exit(1);
  }
})();
