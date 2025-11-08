const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./server/database.sqlite')

console.log('🔍 COMPREHENSIVE AUDIT - ALL PRODUCTS IN ALL SUBCATEGORIES\n')
console.log('═'.repeat(100) + '\n')

// Get all products with category info
db.all(`
  SELECT id, name, brand, category, subcategory
  FROM products
  ORDER BY category, subcategory, name
`, [], (err, products) => {
  if (err) {
    console.error('Error:', err.message)
    db.close()
    return
  }

  // Group by subcategory
  const bySubcategory = {}
  products.forEach(p => {
    const key = `${p.category}/${p.subcategory}`
    if (!bySubcategory[key]) {
      bySubcategory[key] = []
    }
    bySubcategory[key].push(p)
  })

  // Display each subcategory
  Object.keys(bySubcategory).sort().forEach(key => {
    const items = bySubcategory[key]
    console.log(`📂 ${key} (${items.length} products)`)
    console.log('─'.repeat(100))
    
    items.forEach((item, idx) => {
      console.log(`${idx + 1}. ${item.brand.toUpperCase()} - ${item.name}`)
    })
    
    console.log()
  })

  console.log('═'.repeat(100))
  console.log(`\n📊 TOTAL: ${products.length} products across ${Object.keys(bySubcategory).length} subcategories\n`)
  
  db.close()
})
