const { db } = require('./server/config/database.cjs')

// Check anti-aging products
console.log('\n=== ANTI-AGING / ANTI-RRUDHOSJE PRODUCTS ===\n')
db.all(`
  SELECT id, name, category, subcategory 
  FROM products 
  WHERE LOWER(name) LIKE '%anti%' 
     OR LOWER(name) LIKE '%rrudh%' 
     OR LOWER(description) LIKE '%rrudh%'
     OR LOWER(name) LIKE '%wrinkle%'
  LIMIT 30
`, [], (err, rows) => {
  if (err) console.error(err)
  else {
    rows.forEach(p => {
      console.log(`ID: ${p.id}`)
      console.log(`Name: ${p.name}`)
      console.log(`Category: ${p.category} -> ${p.subcategory}`)
      console.log('---')
    })
  }
})

// Check oral care products
setTimeout(() => {
  console.log('\n=== ORAL CARE / GOJA PRODUCTS ===\n')
  db.all(`
    SELECT id, name, category, subcategory 
    FROM products 
    WHERE LOWER(name) LIKE '%paste%dhemb%' 
       OR LOWER(name) LIKE '%gojëlar%'
       OR LOWER(name) LIKE '%gojelar%'
       OR LOWER(name) LIKE '%mouth%'
       OR LOWER(name) LIKE '%dental%'
       OR LOWER(name) LIKE '%toothpaste%'
       OR subcategory = 'Goja'
    LIMIT 30
  `, [], (err, rows) => {
    if (err) console.error(err)
    else {
      rows.forEach(p => {
        console.log(`ID: ${p.id}`)
        console.log(`Name: ${p.name}`)
        console.log(`Category: ${p.category} -> ${p.subcategory}`)
        console.log('---')
      })
    }
    process.exit(0)
  })
}, 1000)
