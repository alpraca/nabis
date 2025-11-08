const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./server/database.sqlite')

console.log('🔍 CHECKING APARAT MJEKSORE SUBCATEGORY\n')
console.log('═'.repeat(80) + '\n')

db.all(`
  SELECT id, name, brand, category, subcategory
  FROM products
  WHERE subcategory = 'Aparat mjeksore'
  ORDER BY name
`, [], (err, rows) => {
  if (err) {
    console.error('Error:', err.message)
    db.close()
    return
  }

  console.log(`Found ${rows.length} products in "Aparat mjeksore":\n`)
  
  if (rows.length === 0) {
    console.log('❌ EMPTY! No products in this subcategory!\n')
  } else {
    rows.forEach((product, idx) => {
      console.log(`${idx + 1}. ${product.brand.toUpperCase()} - ${product.name}`)
      console.log(`   Category: ${product.category}/${product.subcategory}\n`)
    })
  }
  
  console.log('═'.repeat(80))
  console.log('\nNow checking what SHOULD be in medical devices...\n')
  
  // Check for blood glucose meters and similar devices that might be misplaced
  db.all(`
    SELECT COUNT(*) as count FROM products 
    WHERE (
      name LIKE '%blood glucose%' OR
      name LIKE '%glucose monitor%' OR
      name LIKE '%lancet%' OR
      name LIKE '%test strip%' OR
      name LIKE '%blood pressure%' OR
      name LIKE '%thermometer%' OR
      name LIKE '%contour%' AND name LIKE '%eye%' OR
      name LIKE '%accu-check%'
    )
  `, [], (err, row) => {
    console.log(`Products that SHOULD be in Aparat Mjeksore: ${row.count}`)
    console.log('(blood glucose, lancets, test strips, medical devices)\n')
    db.close()
  })
})
