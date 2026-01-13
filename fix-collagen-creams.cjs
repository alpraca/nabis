const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

db.run(`UPDATE products SET category = 'dermokozmetikë' WHERE name LIKE '%Collagen%' AND category = 'suplemente'`, function(err) {
  if (err) {
    console.error('❌ Error:', err.message);
  } else {
    console.log(`✅ Fixed ${this.changes} collagen cream products`);
  }
  db.close();
});
