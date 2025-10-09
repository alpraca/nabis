const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

db.all('PRAGMA table_info(products)', (err, columns) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Products table columns:');
    columns.forEach(col => {
      console.log(`- ${col.name}: ${col.type}`);
    });
  }
  db.close();
});