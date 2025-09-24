const { db } = require('./server/config/database.cjs')

console.log('🔧 Adding subcategory column to products table...')

// Add subcategory column to products table
db.run(`
  ALTER TABLE products ADD COLUMN subcategory TEXT
`, (err) => {
  if (err && !err.message.includes('duplicate column name')) {
    console.error('❌ Error adding subcategory column:', err.message)
  } else {
    console.log('✅ Subcategory column added successfully')
  }
  
  db.close()
})