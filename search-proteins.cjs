const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

db.all(`SELECT name, brand, category, subcategory FROM products 
        WHERE LOWER(name) LIKE '%protein%' OR LOWER(name) LIKE '%whey%' OR LOWER(name) LIKE '%amino%'`, 
(err, rows) => {
  console.log(`\nProtein products found: ${rows.length}\n`);
  rows.forEach(r => console.log(`  [${r.category}/${r.subcategory || 'NULL'}] ${r.brand} - ${r.name}`));
  db.close();
});
