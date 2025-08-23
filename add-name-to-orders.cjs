const { db } = require('./server/config/database.cjs');

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
  
  // Check the updated table structure
  db.all(`PRAGMA table_info(orders)`, (err, columns) => {
    if (err) {
      console.error('❌ Error checking table structure:', err);
    } else {
      console.log('\n📋 Updated orders table structure:');
      columns.forEach(col => {
        console.log(`   ${col.name}: ${col.type}${col.notnull ? ' NOT NULL' : ''}${col.dflt_value ? ` DEFAULT ${col.dflt_value}` : ''}`);
      });
    }
    db.close();
  });
});
