const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./server/database.sqlite')

console.log('🔍 Debugging Mirëqenia seksuale:\n')

// Check if products exist with this subcategory
db.all(`
  SELECT id, name, brand, category, subcategory 
  FROM products 
  WHERE category = 'farmaci' OR subcategory = 'Mirëqenia seksuale'
  LIMIT 15
`, [], (err, rows) => {
  if (err) {
    console.error('Error:', err.message)
    db.close()
    return
  }

  console.log('Products with farmaci category or Mirëqenia seksuale subcategory:')
  console.log(JSON.stringify(rows, null, 2))
  
  // Check exact subcategory values
  db.all(`SELECT DISTINCT subcategory FROM products WHERE category = 'farmaci'`, [], (err, subcats) => {
    if (err) {
      console.error('Error:', err.message)
      db.close()
      return
    }
    
    console.log('\n\nDistinct subcategories in farmaci category:')
    console.log(JSON.stringify(subcats, null, 2))
    db.close()
  })
})
