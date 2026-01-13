const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

console.log('\n🔍 DUKE KONTROLLUAR NËNKATEGORIT E ZBRAZËTA:\n');
console.log('═'.repeat(90));

// Get all unique subcategories that exist in products
db.all(`
  SELECT DISTINCT subcategory
  FROM products
  WHERE subcategory IS NOT NULL AND subcategory != ''
  ORDER BY subcategory
`, [], (err, usedSubcategories) => {
  if (err) {
    console.error(err);
    db.close();
    return;
  }
  
  console.log(`\n📊 Nënkategori të përdorura: ${usedSubcategories.length}\n`);
  
  // Now get counts for each
  db.all(`
    SELECT category, subcategory, COUNT(*) as count
    FROM products
    WHERE subcategory IS NOT NULL
    GROUP BY category, subcategory
    HAVING count = 0
    ORDER BY category, subcategory
  `, [], (err, emptySubcats) => {
    if (err) {
      console.error(err);
      db.close();
      return;
    }
    
    console.log(`\n❌ NËNKATEGORI PA PRODUKTE: ${emptySubcats.length}\n`);
    
    if (emptySubcats.length === 0) {
      console.log('✅ Të gjitha nënkategorit kanë produkte!\n');
    } else {
      emptySubcats.forEach(sub => {
        console.log(`   [${sub.category}] ${sub.subcategory}`);
      });
    }
    
    // Also check for subcategories with very few products (1-2)
    console.log('\n⚠️  NËNKATEGORI ME SHUMË PAK PRODUKTE (1-5):\n');
    
    db.all(`
      SELECT category, subcategory, COUNT(*) as count
      FROM products
      WHERE subcategory IS NOT NULL
      GROUP BY category, subcategory
      HAVING count <= 5
      ORDER BY count ASC, category, subcategory
    `, [], (err, fewProducts) => {
      if (err) {
        console.error(err);
        db.close();
        return;
      }
      
      let currentCategory = '';
      fewProducts.forEach(sub => {
        if (sub.category !== currentCategory) {
          currentCategory = sub.category;
          console.log(`\n  📁 ${currentCategory.toUpperCase()}`);
        }
        console.log(`     ${sub.subcategory.padEnd(50)} : ${sub.count} produkte`);
      });
      
      console.log('\n' + '═'.repeat(90));
      console.log(`\n📈 TOTALI: ${fewProducts.length} nënkategori me 1-5 produkte\n`);
      
      db.close();
    });
  });
});
