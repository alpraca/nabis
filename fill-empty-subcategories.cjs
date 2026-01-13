const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

console.log('\n🔍 DUKE KËRKUAR PRODUKTE PËR NËNKATEGORIT ME PAK PRODUKTE:\n');
console.log('═'.repeat(90));

// Define subcategories that should have more products and search patterns
const subcategorySearches = [
  // Proteinat - should have protein products
  {
    subcategory: 'Proteinat',
    targetCategory: 'suplemente',
    currentCount: 1,
    searchPatterns: [
      { pattern: '%protein%', exclude: ['serum', 'cream', 'lotion'] },
      { pattern: '%whey%', exclude: [] },
      { pattern: '%amino%acid%', exclude: [] },
      { pattern: '%bcaa%', exclude: [] }
    ]
  },
  // Probiotic & Digestim
  {
    subcategory: 'Probiotic & Digestim',
    targetCategory: 'suplemente',
    currentCount: 3,
    searchPatterns: [
      { pattern: '%probiotic%', exclude: [] },
      { pattern: '%prebiotic%', exclude: [] },
      { pattern: '%digestive%', exclude: [] },
      { pattern: '%digestion%', exclude: [] },
      { pattern: '%flora%', exclude: [] },
      { pattern: '%lacto%', exclude: [] }
    ]
  },
  // Kujdesi për Nënën
  {
    subcategory: 'Kujdesi për Nënën',
    targetCategory: 'mama-dhe-bebat',
    currentCount: 1,
    searchPatterns: [
      { pattern: '%maternity%', exclude: [] },
      { pattern: '%pregnancy%', exclude: [] },
      { pattern: '%nursing%', exclude: [] },
      { pattern: '%breast%', exclude: [] },
      { pattern: '%gravid%', exclude: [] },
      { pattern: '%shtatzani%', exclude: [] }
    ]
  },
  // Anti Celulit
  {
    subcategory: 'Anti Celulit',
    targetCategory: 'dermokozmetikë',
    currentCount: 5,
    searchPatterns: [
      { pattern: '%cellulite%', exclude: [] },
      { pattern: '%celulit%', exclude: [] },
      { pattern: '%anticellulite%', exclude: [] },
      { pattern: '%snellente%', exclude: [] },
      { pattern: '%slimming%', exclude: [] }
    ]
  },
  // Këmbët
  {
    subcategory: 'Këmbët',
    targetCategory: 'higjena',
    currentCount: 2,
    searchPatterns: [
      { pattern: '%foot%', exclude: [] },
      { pattern: '%feet%', exclude: [] },
      { pattern: '%piedi%', exclude: [] },
      { pattern: '%këmbë%', exclude: [] },
      { pattern: '%heel%', exclude: [] }
    ]
  }
];

let totalChecked = 0;
const allFindings = [];

subcategorySearches.forEach((search, index) => {
  console.log(`\n🔎 ${search.subcategory} (aktualisht ${search.currentCount} produkte):`);
  console.log('─'.repeat(90));
  
  let patternsChecked = 0;
  
  search.searchPatterns.forEach(({ pattern, exclude }) => {
    let query = `SELECT id, name, brand, category, subcategory FROM products 
                 WHERE LOWER(name) LIKE LOWER('${pattern}')`;
    
    // Add exclusions
    if (exclude.length > 0) {
      exclude.forEach(ex => {
        query += ` AND LOWER(name) NOT LIKE LOWER('%${ex}%')`;
      });
    }
    
    db.all(query, [], (err, products) => {
      if (err) {
        console.error(`Error searching for ${pattern}:`, err.message);
      } else if (products.length > 0) {
        products.forEach(p => {
          // Check if it's not already in the target subcategory
          if (p.subcategory !== search.subcategory || p.category !== search.targetCategory) {
            console.log(`   ❌ [${p.category}/${p.subcategory || 'NULL'}] ${p.brand} - ${p.name.substring(0, 60)}`);
            console.log(`      → Duhet: [${search.targetCategory}/${search.subcategory}]`);
            
            allFindings.push({
              id: p.id,
              name: p.name,
              brand: p.brand,
              currentCategory: p.category,
              currentSubcategory: p.subcategory,
              targetCategory: search.targetCategory,
              targetSubcategory: search.subcategory,
              reason: `Matches pattern: ${pattern}`
            });
          }
        });
      }
      
      patternsChecked++;
      if (patternsChecked === search.searchPatterns.length) {
        totalChecked++;
        
        if (totalChecked === subcategorySearches.length) {
          console.log('\n' + '═'.repeat(90));
          
          if (allFindings.length === 0) {
            console.log('\n✅ Nuk u gjetën produkte të tjera për këto nënkategori!');
            console.log('\n💡 Këto nënkategori kanë pak produkte sepse nuk ka më produkte në databazë.');
            console.log('   Duhet të shtoni produkte të reja për t\'i mbushur!\n');
            db.close();
          } else {
            console.log(`\n🔧 GJETUR ${allFindings.length} PRODUKTE QË DUHET TË LËVIZEN:\n`);
            applyFixes(allFindings);
          }
        }
      }
    });
  });
});

function applyFixes(findings) {
  let fixed = 0;
  const stmt = db.prepare('UPDATE products SET category = ?, subcategory = ? WHERE id = ?');
  
  findings.forEach(fix => {
    stmt.run([fix.targetCategory, fix.targetSubcategory, fix.id], (err) => {
      if (err) {
        console.error(`❌ Error: ${err.message}`);
      } else {
        console.log(`✅ ${fix.brand} - ${fix.name.substring(0, 50)}`);
        console.log(`   ${fix.currentCategory}/${fix.currentSubcategory || 'NULL'} → ${fix.targetCategory}/${fix.targetSubcategory}`);
      }
      
      fixed++;
      if (fixed === findings.length) {
        stmt.finalize();
        console.log(`\n🎉 U lëvizën ${fixed} produkte!\n`);
        db.close();
      }
    });
  });
}
