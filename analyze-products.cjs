const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./server/database.sqlite')

// Get sample products from each category to analyze
const categories = ['dermokozmetikë', 'farmaci', 'higjena', 'mama-dhe-bebat', 'produkte-shtese', 'suplemente']

console.log('📊 ANALYZING PRODUCT DATA:\n')

categories.forEach(cat => {
  db.all(`
    SELECT id, name, brand, description, subcategory 
    FROM products 
    WHERE category = ?
    LIMIT 10
  `, [cat], (err, rows) => {
    console.log(`\n${cat.toUpperCase()}:`)
    console.log('='.repeat(60))
    rows.forEach(r => {
      console.log(`\n  NAME: ${r.name.substring(0, 60)}`)
      console.log(`  BRAND: ${r.brand}`)
      console.log(`  SUBCAT: ${r.subcategory || 'NULL'}`)
      if (r.description) {
        console.log(`  DESC: ${r.description.substring(0, 60)}...`)
      }
    })
  })
})

setTimeout(() => db.close(), 3000)
