const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

console.log('\n🔧 DUKE LËVIZUR ATC ÇAJ MULTI-VITAMINOZ:\n');

db.run(`
  UPDATE products 
  SET category = 'suplemente', subcategory = 'Çajra Mjekësore'
  WHERE name LIKE '%ATC Çaj Multi-vitaminoz%'
`, function(err) {
  if (err) {
    console.error('❌ Gabim:', err.message);
  } else {
    console.log(`✅ U lëviz ${this.changes} produkt\n`);
    
    // Verifikoni nënkategorinë Proteinat
    db.all(`
      SELECT category, subcategory, COUNT(*) as count
      FROM products
      WHERE subcategory = 'Proteinat'
      GROUP BY category, subcategory
    `, (err, rows) => {
      if (err) {
        console.error('Gabim:', err.message);
      } else if (rows.length === 0) {
        console.log('📊 Nënkategoria "Proteinat" tani është bosh (nuk ka produkte të vërteta proteine në databazë)\n');
      } else {
        rows.forEach(row => {
          console.log(`${row.category}/${row.subcategory}: ${row.count} produkte`);
        });
      }
      db.close();
    });
  }
});
