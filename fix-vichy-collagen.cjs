const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

// Fix Vichy Collagen Specialist products - they are skincare creams, not supplements
db.run(`UPDATE products SET category = 'dermokozmetikë' WHERE brand LIKE '%Vichy%' AND name LIKE '%Collagen Specialist%'`, function(err) {
  if (err) {
    console.error('❌ Error:', err.message);
    db.close();
    return;
  }
  console.log(`✅ Fixed ${this.changes} Vichy Collagen Specialist products (creams) → dermokozmetikë`);
  
  // Verify the fix
  db.all('SELECT name, brand, category FROM products WHERE name LIKE "%Collagen%" ORDER BY category, brand', (err, rows) => {
    if (err) {
      console.error(err);
      db.close();
      return;
    }
    console.log('\n📋 Final Collagen Products:\n');
    rows.forEach(r => {
      const emoji = r.category === 'dermokozmetikë' ? '✨' : '💊';
      console.log(`  ${emoji} [${r.category.padEnd(18)}] ${r.brand} - ${r.name}`);
    });
    db.close();
  });
});
