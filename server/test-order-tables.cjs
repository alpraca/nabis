const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", (err, tables) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Tables:', tables.map(t => t.name).join(', '));
    
    // Check orders table structure
    db.all("PRAGMA table_info(orders)", (err, cols) => {
      if (err) {
        console.error('Error checking orders table:', err);
      } else {
        console.log('\nOrders table columns:');
        console.log(cols);
      }
      db.close();
    });
  }
});
