const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

console.log('\n🔍 DUKE KONTROLLUAR PRODUKTET NË "GOJA":\n');

// Check all products in "Goja" subcategory
db.all(`
  SELECT id, name, brand, category, subcategory
  FROM products
  WHERE subcategory = 'Goja'
  ORDER BY brand, name
`, [], (err, products) => {
  if (err) {
    console.error(err);
    db.close();
    return;
  }
  
  console.log(`Gjetur ${products.length} produkte në nënkategorinë "Goja":\n`);
  
  const fixes = [];
  
  products.forEach(p => {
    const name = p.name.toLowerCase();
    let correctSubcat = null;
    let correctCategory = p.category;
    
    // Makeup remover -> dermokozmetikë/Fytyre
    if (name.includes('makeup') || name.includes('make-up') || name.includes('remover') || name.includes('micellar')) {
      correctSubcat = 'Fytyre';
      correctCategory = 'dermokozmetikë';
    }
    // B-complex, vitamins -> suplemente/Vitaminat dhe Mineralet
    else if (name.includes('b-12') || name.includes('b12') || name.includes('vitamin') || name.includes('b-complex')) {
      correctSubcat = 'Vitaminat dhe Mineralet';
      correctCategory = 'suplemente';
    }
    // Lozenges that are supplements (not for throat)
    else if (name.includes('oralbiotic') || (name.includes('lozenge') && !name.includes('throat'))) {
      correctSubcat = 'Probiotic & Digestim';
      correctCategory = 'suplemente';
    }
    
    if (correctSubcat) {
      fixes.push({
        id: p.id,
        name: p.name,
        brand: p.brand,
        oldCategory: p.category,
        oldSubcat: p.subcategory,
        newCategory: correctCategory,
        newSubcat: correctSubcat
      });
      console.log(`❌ GABIM: [${p.category}/${p.subcategory}] ${p.brand} - ${p.name.substring(0, 60)}`);
      console.log(`   → Duhet: [${correctCategory}/${correctSubcat}]`);
      console.log('');
    } else {
      console.log(`✅ OK: [${p.category}/${p.subcategory}] ${p.brand} - ${p.name.substring(0, 60)}`);
    }
  });
  
  if (fixes.length === 0) {
    console.log('\n✅ Të gjitha produktet në "Goja" janë të sakta!');
    db.close();
    return;
  }
  
  console.log(`\n\n🔧 DUKE RREGULLUAR ${fixes.length} PRODUKTE...\n`);
  
  let fixed = 0;
  const stmt = db.prepare('UPDATE products SET category = ?, subcategory = ? WHERE id = ?');
  
  fixes.forEach(fix => {
    stmt.run([fix.newCategory, fix.newSubcat, fix.id], (err) => {
      if (err) {
        console.error(`❌ Gabim për ${fix.name}: ${err.message}`);
      } else {
        console.log(`✅ ${fix.brand} - ${fix.name.substring(0, 60)}`);
        console.log(`   ${fix.oldCategory}/${fix.oldSubcat} → ${fix.newCategory}/${fix.newSubcat}`);
      }
      
      fixed++;
      if (fixed === fixes.length) {
        stmt.finalize();
        console.log(`\n🎉 U rregulluan ${fixes.length} produkte!\n`);
        db.close();
      }
    });
  });
});
