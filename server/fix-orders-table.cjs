const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

db.serialize(() => {
  // Check if name column exists
  db.all("PRAGMA table_info(orders)", (err, cols) => {
    if (err) {
      console.error('Error:', err);
      return;
    }
    
    const hasNameColumn = cols.some(col => col.name === 'name');
    
    if (!hasNameColumn) {
      console.log('Adding name column to orders table...');
      db.run("ALTER TABLE orders ADD COLUMN name TEXT", (err) => {
        if (err) {
          console.error('Error adding name column:', err);
        } else {
          console.log('✅ Name column added successfully');
        }
        db.close();
      });
    } else {
      console.log('✅ Name column already exists');
      db.close();
    }
  });
});
