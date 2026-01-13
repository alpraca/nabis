const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

db.run('UPDATE products SET category = ? WHERE category = ?', ['dermokozmetikë', 'Dermocosmetics'], function(err) {
  if (err) {
    console.error('❌ Error:', err.message);
  } else {
    console.log(`✅ Fixed ${this.changes} products: "Dermocosmetics" → "dermokozmetikë"`);
  }
  db.close();
});
