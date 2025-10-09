const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.all('SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != ""', (err, rows) => {
  if (err) {
    console.error('Gabim:', err);
  } else {
    console.log('📦 Kategoritë aktuale në products:');
    rows.forEach(row => {
      console.log(`- ${row.category}`);
    });
  }
  db.close();
});