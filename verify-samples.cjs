const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

console.log('\n🔍 SAMPLE VERIFICATION - Checking recategorized products:\n');
console.log('═'.repeat(80));

// Check baby products
db.all(`
  SELECT name, brand, category, subcategory 
  FROM products 
  WHERE brand IN ('Holle', 'Bambo', 'Chicco', 'HiPP')
  LIMIT 5
`, [], (err, rows) => {
  console.log('\n👶 BABY PRODUCTS (should be in "mama-dhe-bebat"):');
  rows.forEach(r => {
    const status = r.category === 'mama-dhe-bebat' ? '✅' : '❌';
    console.log(`  ${status} [${r.category}] ${r.brand} - ${r.name.substring(0, 55)}...`);
  });
  
  // Check supplements
  db.all(`
    SELECT name, brand, category, subcategory 
    FROM products 
    WHERE brand IN ('Solgar', 'Vitabiotics', 'Now Foods')
    LIMIT 5
  `, [], (err, rows) => {
    console.log('\n💊 SUPPLEMENTS (should be in "suplemente"):');
    rows.forEach(r => {
      const status = r.category === 'suplemente' ? '✅' : '❌';
      console.log(`  ${status} [${r.category}] ${r.brand} - ${r.name.substring(0, 55)}...`);
    });
    
    // Check medical products
    db.all(`
      SELECT name, brand, category, subcategory 
      FROM products 
      WHERE brand IN ('Pic', 'PIC', 'Omron')
      LIMIT 5
    `, [], (err, rows) => {
      console.log('\n🏥 MEDICAL PRODUCTS (should be in "farmaci"):');
      rows.forEach(r => {
        const status = r.category === 'farmaci' ? '✅' : '❌';
        console.log(`  ${status} [${r.category}] ${r.brand} - ${r.name.substring(0, 55)}...`);
      });
      
      // Check dermocosmetics
      db.all(`
        SELECT name, brand, category, subcategory 
        FROM products 
        WHERE brand IN ('Vichy', 'La Roche', 'Avene', 'Nuxe')
        LIMIT 5
      `, [], (err, rows) => {
        console.log('\n✨ DERMOCOSMETICS (should be in "dermokozmetikë"):');
        rows.forEach(r => {
          const status = r.category === 'dermokozmetikë' ? '✅' : '❌';
          console.log(`  ${status} [${r.category}] ${r.brand} - ${r.name.substring(0, 55)}...`);
        });
        
        console.log('\n' + '═'.repeat(80));
        console.log('\n🎉 Verification complete!\n');
        db.close();
      });
    });
  });
});
