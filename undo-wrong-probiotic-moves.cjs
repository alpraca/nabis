const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

// Produktet që u lëvizën gabim dhe duhet të kthehen
const wrongMoves = [
  { name: 'Vichy Mineral 89 Probiotic Fractions', correctCategory: 'dermokozmetikë', correctSubcategory: 'Fytyre' },
  { name: 'Nuxe Prodigieuse Florale Scented Body Shower', correctCategory: 'dermokozmetikë', correctSubcategory: 'Trupi' },
  { name: 'Nuxe Prodigieuse Florale le parfum', correctCategory: 'dermokozmetikë', correctSubcategory: 'Parfume' },
  { name: 'Klorane Floral Water Make-Up Remove', correctCategory: 'dermokozmetikë', correctSubcategory: 'Pastrimi' },
  { name: 'Aptamil Lactose Free Milk', correctCategory: 'mama-dhe-bebat', correctSubcategory: 'Ushqim' },
  { name: 'Aptamil Pregomin Allergy Digestive Care', correctCategory: 'mama-dhe-bebat', correctSubcategory: 'Ushqim' },
  { name: 'RVB Lab Microbioma Rich Balancing Cream with Prebiotics', correctCategory: 'dermokozmetikë', correctSubcategory: 'Face' }
];

console.log('\n🔧 DUKE KTHYER PRODUKTET QË U LËVIZËN GABIM:\n');

db.serialize(() => {
  const stmt = db.prepare(`
    UPDATE products 
    SET category = ?, subcategory = ?
    WHERE name LIKE ?
  `);

  let fixed = 0;
  wrongMoves.forEach(product => {
    stmt.run(product.correctCategory, product.correctSubcategory, `%${product.name}%`, function(err) {
      if (err) {
        console.error(`❌ Gabim duke rregulluar "${product.name}":`, err.message);
      } else if (this.changes > 0) {
        fixed += this.changes;
        console.log(`✅ ${product.name}`);
        console.log(`   → ${product.correctCategory}/${product.correctSubcategory}\n`);
      }
    });
  });

  stmt.finalize(() => {
    console.log(`\n🎉 U rregulluan ${fixed} produkte!\n`);
    
    // Tani verifikoni nënkategorit
    db.all(`
      SELECT category, subcategory, COUNT(*) as count
      FROM products
      WHERE subcategory IN (
        'Probiotic & Digestim',
        'Kujdesi për Nënën',
        'Anti Celulit',
        'Këmbët'
      )
      GROUP BY category, subcategory
      ORDER BY category, subcategory
    `, (err, rows) => {
      if (err) {
        console.error('Gabim:', err);
      } else {
        console.log('\n📊 GJENDJA E NËNKATEGORIVE PAS RREGULLIMIT:\n');
        rows.forEach(row => {
          console.log(`${row.category}/${row.subcategory}: ${row.count} produkte`);
        });
      }
      db.close();
    });
  });
});
