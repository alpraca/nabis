const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.all('SELECT * FROM categories ORDER BY parent, name', (err, rows) => {
  if (err) {
    console.error('Gabim:', err);
  } else {
    console.log('🗂️ Kategoritë në database:');
    rows.forEach(row => {
      console.log(`ID: ${row.id}, Emri: ${row.name}, Display: ${row.display_name}, Parent: ${row.parent || 'Kryesore'}`);
    });
  }
  db.close();
});