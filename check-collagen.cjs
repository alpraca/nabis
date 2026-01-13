const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

db.all('SELECT name, brand, category FROM products WHERE name LIKE "%Collagen%"', (err, rows) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('\nAll Collagen products:\n');
  rows.forEach(r => {
    console.log(`  [${r.category.padEnd(18)}] ${r.brand} - ${r.name}`);
  });
  db.close();
});
