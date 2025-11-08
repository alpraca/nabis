const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./server/database.sqlite')

console.log('🔍 CHECKING MAKEUP SUBCATEGORY PRODUCTS:\n')

db.all(`
  SELECT id, name, brand, category, subcategory
  FROM products
  WHERE LOWER(subcategory) = LOWER('Makeup')
  LIMIT 30
`, [], (err, rows) => {
  if (err) {
    console.error('Error:', err.message)
    db.close()
    return
  }

  console.log(`Found ${rows.length} products in Makeup:\n`)
  
  rows.forEach((row, idx) => {
    console.log(`${idx + 1}. ${row.brand} - ${row.name}`)
  })
  
  console.log('\n\n🔍 CHECKING OTHER MISPLACED PRODUCTS:\n')
  
  // Check for Durex in makeup
  db.get(`SELECT COUNT(*) as cnt FROM products WHERE LOWER(subcategory) = LOWER('Makeup') AND LOWER(brand) LIKE '%durex%'`, [], (err, result) => {
    if (err) console.error(err)
    else console.log(`Durex products in Makeup: ${result.cnt}`)
    
    db.close()
  })
})
