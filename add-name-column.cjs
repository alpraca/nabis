const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server/database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('✅ Connected to SQLite database');
});

console.log('🔧 Adding name column to orders table...');

db.run(`ALTER TABLE orders ADD COLUMN name TEXT`, (err) => {
  if (err) {
    if (err.message.includes('duplicate column name')) {
      console.log('✅ Name column already exists in orders table');
    } else {
      console.error('❌ Error adding name column:', err.message);
    }
  } else {
    console.log('✅ Name column added successfully to orders table');
  }
  
  db.close(() => {
    console.log('✅ Database connection closed');
  });
});
