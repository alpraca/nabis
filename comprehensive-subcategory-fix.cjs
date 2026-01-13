const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

console.log('\n🔍 COMPREHENSIVE SUBCATEGORY FIX - Checking ALL products\n');
console.log('═'.repeat(90));

// Define what should be in each subcategory
const subcategoryRules = {
  // Products that should NOT be in certain subcategories
  wrongMatches: [
    {
      subcategory: 'Tanning',
      shouldNotContain: [/\b(çaj|tea|tisana|infusion|herbal)\b/i],
      correctSubcategory: 'Çajra Mjekësore',
      correctCategory: 'suplemente'
    },
    {
      subcategory: 'Tanning',
      shouldNotContain: [/\b(vitamin|supplement|integratore)\b/i],
      correctSubcategory: 'Vitaminat dhe Mineralet',
      correctCategory: 'suplemente'
    },
    {
      subcategory: 'Face',
      shouldNotContain: [/\b(shampoo|hair|capelli|floket)\b/i],
      correctSubcategory: 'Flokët',
      correctCategory: 'higjena'
    },
    {
      subcategory: 'Face',
      shouldNotContain: [/\b(body|corpo|trupi|gel doccia|shower)\b/i],
      correctSubcategory: 'Trupi',
      correctCategory: 'higjena'
    },
    {
      subcategory: 'Fytyre',
      shouldNotContain: [/\b(shampoo|hair|capelli|floket|conditioner)\b/i],
      correctSubcategory: 'Flokët',
      correctCategory: 'dermokozmetikë'
    },
    // Removed - serums with vitamins are skincare, not supplements
    {
      subcategory: 'Trupi',
      shouldNotContain: [/\b(face|viso|fytyre|facial)\b/i],
      correctSubcategory: 'Fytyre',
      correctCategory: 'dermokozmetikë'
    },
    {
      subcategory: 'Flokët',
      shouldNotContain: [/\b(face|facial|viso|fytyre|eye|occhi)\b/i],
      correctSubcategory: 'Fytyre',
      correctCategory: 'dermokozmetikë'
    },
    {
      subcategory: 'SPF',
      shouldContain: [/\b(spf|sun|solar|solare|protection)\b/i],
      ifNotMatch: {
        correctSubcategory: 'Fytyre',
        correctCategory: 'dermokozmetikë'
      }
    },
    {
      subcategory: 'Vitaminat dhe Mineralet',
      shouldNotContain: [/\b(cream|crema|lotion|serum|gel|soin)\b/i],
      correctSubcategory: 'Fytyre',
      correctCategory: 'dermokozmetikë'
    },
    {
      subcategory: 'Anti-Age & Anti-Rrudhe',
      shouldNotContain: [/\b(vitamin|supplement|omega|d3|b12)\b/i],
      correctSubcategory: 'Vitaminat dhe Mineralet',
      correctCategory: 'suplemente'
    },
    {
      subcategory: 'Makeup',
      shouldNotContain: [/\b(cream|serum|cleanser|detergente|remover)\b/i],
      correctSubcategory: 'Fytyre',
      correctCategory: 'dermokozmetikë'
    }
  ],
  
  // Positive matches - products that should be in specific subcategories
  correctMatches: [
    {
      patterns: [/\b(çaj|tea|tisana|infusion|herbal)\b/i],
      correctSubcategory: 'Çajra Mjekësore',
      correctCategory: 'suplemente',
      priority: 100
    },
    {
      patterns: [/\b(spf|sun|solar|solare|protection|protezione)\b/i],
      correctSubcategory: 'SPF & Mbrojtje nga Dielli',
      correctCategory: 'dermokozmetikë',
      priority: 95
    },
    {
      patterns: [/\b(shampoo|shampo|conditioner)\b/i],
      correctSubcategory: 'Flokët',
      correctCategory: 'higjena',
      priority: 90
    },
    {
      patterns: [/\b(toothpaste|dentifricio|paste dhëmbësh)\b/i],
      correctSubcategory: 'Goja',
      correctCategory: 'higjena',
      priority: 95
    },
    {
      patterns: [/\b(mouthwash|collutorio|ujë goje)\b/i],
      correctSubcategory: 'Goja',
      correctCategory: 'higjena',
      priority: 95
    }
  ]
};

async function findMisplacedProducts() {
  return new Promise((resolve, reject) => {
    db.all('SELECT id, name, brand, category, subcategory, description FROM products WHERE subcategory IS NOT NULL', 
      [], (err, products) => {
      if (err) {
        reject(err);
        return;
      }
      
      const fixes = [];
      
      for (const product of products) {
        const searchText = `${product.name} ${product.brand} ${product.description || ''}`.toLowerCase();
        let needsFix = false;
        let newCategory = product.category;
        let newSubcategory = product.subcategory;
        
        // Check wrong matches first
        for (const rule of subcategoryRules.wrongMatches) {
          if (product.subcategory === rule.subcategory) {
            // Check shouldNotContain patterns
            if (rule.shouldNotContain) {
              for (const pattern of rule.shouldNotContain) {
                if (pattern.test(searchText)) {
                  needsFix = true;
                  newCategory = rule.correctCategory;
                  newSubcategory = rule.correctSubcategory;
                  break;
                }
              }
            }
            
            // Check shouldContain patterns (if product doesn't match, it's wrong)
            if (rule.shouldContain && !needsFix) {
              let matches = false;
              for (const pattern of rule.shouldContain) {
                if (pattern.test(searchText)) {
                  matches = true;
                  break;
                }
              }
              if (!matches && rule.ifNotMatch) {
                needsFix = true;
                newCategory = rule.ifNotMatch.correctCategory;
                newSubcategory = rule.ifNotMatch.correctSubcategory;
              }
            }
            
            if (needsFix) break;
          }
        }
        
        // If not fixed by wrong matches, check correct matches
        if (!needsFix) {
          for (const rule of subcategoryRules.correctMatches) {
            for (const pattern of rule.patterns) {
              if (pattern.test(searchText)) {
                // Product matches pattern but is in wrong subcategory
                if (product.subcategory !== rule.correctSubcategory || 
                    product.category !== rule.correctCategory) {
                  needsFix = true;
                  newCategory = rule.correctCategory;
                  newSubcategory = rule.correctSubcategory;
                  break;
                }
              }
            }
            if (needsFix) break;
          }
        }
        
        if (needsFix) {
          fixes.push({
            id: product.id,
            name: product.name,
            brand: product.brand,
            oldCategory: product.category,
            oldSubcategory: product.subcategory,
            newCategory: newCategory,
            newSubcategory: newSubcategory
          });
        }
      }
      
      resolve(fixes);
    });
  });
}

async function applyFixes(fixes) {
  return new Promise((resolve, reject) => {
    if (fixes.length === 0) {
      resolve({ fixed: 0, errors: [] });
      return;
    }
    
    const stmt = db.prepare('UPDATE products SET category = ?, subcategory = ? WHERE id = ?');
    let fixed = 0;
    const errors = [];
    
    for (const fix of fixes) {
      stmt.run([fix.newCategory, fix.newSubcategory, fix.id], (err) => {
        if (err) {
          errors.push({ product: fix, error: err.message });
        } else {
          fixed++;
        }
        
        if (fixed + errors.length === fixes.length) {
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
    console.log('\n📊 Step 1: Analyzing ALL products in ALL subcategories...\n');
    
    const fixes = await findMisplacedProducts();
    
    console.log(`\n🔍 Found ${fixes.length} misplaced products\n`);
    
    if (fixes.length === 0) {
      console.log('✅ All products are in correct subcategories!');
      db.close();
      return;
    }
    
    // Group by change type
    const changes = {};
    for (const fix of fixes) {
      const key = `${fix.oldCategory}/${fix.oldSubcategory} → ${fix.newCategory}/${fix.newSubcategory}`;
      if (!changes[key]) {
        changes[key] = [];
      }
      changes[key].push(fix);
    }
    
    console.log('📋 CHANGES TO BE MADE:\n');
    for (const [change, products] of Object.entries(changes)) {
      console.log(`\n  ${change} (${products.length} products)`);
      products.slice(0, 5).forEach(p => {
        console.log(`    • ${p.brand} - ${p.name.substring(0, 60)}...`);
      });
      if (products.length > 5) {
        console.log(`    ... and ${products.length - 5} more`);
      }
    }
    
    console.log('\n' + '═'.repeat(90));
    console.log('\n💾 Step 2: Applying fixes...\n');
    
    const result = await applyFixes(fixes);
    
    console.log('\n' + '═'.repeat(90));
    console.log('\n✅ RESULTS:\n');
    console.log(`  ✓ Fixed: ${result.fixed} products`);
    
    if (result.errors.length > 0) {
      console.log(`  ✗ Errors: ${result.errors.length} products`);
    }
    
    console.log('\n🎉 Comprehensive subcategory fix complete!\n');
    
    db.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    db.close();
    process.exit(1);
  }
})();
