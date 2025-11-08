const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./server/database.sqlite')

// Simulate the query logic
const category = 'mireqenia-seksuale'
const categoryParam = category.toLowerCase()

const categoryMappings = {
  'mireqenia-seksuale': 'Mirëqenia seksuale'
}

const actualCategoryName = categoryMappings[categoryParam] || categoryParam
console.log('1. categoryParam:', categoryParam)
console.log('2. actualCategoryName:', actualCategoryName)

const mainCategories = ['dermokozmetikë', 'higjena', 'farmaci', 'mama-dhe-bebat', 'produkte-shtese', 'suplemente']
const isMainCategory = mainCategories.some(cat => cat.toLowerCase() === actualCategoryName.toLowerCase())

console.log('3. isMainCategory:', isMainCategory)
console.log('4. Search will be in:', isMainCategory ? 'category' : 'subcategory', 'column')

// Now run the actual query
if (!isMainCategory) {
  const query = `
    SELECT p.*, pi.image_url as image_url
    FROM products p
    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.sort_order = 1
    WHERE 1=1 AND LOWER(p.subcategory) = LOWER(?)
    GROUP BY p.id ORDER BY p.created_at DESC
    LIMIT 24
  `
  
  console.log('\nExecuting SQL:')
  console.log(query)
  console.log('\nWith parameter:', actualCategoryName)
  
  db.all(query, [actualCategoryName], (err, rows) => {
    if (err) {
      console.error('Error:', err.message)
    } else {
      console.log(`\nResult: ${rows.length} products`)
      if (rows.length > 0) {
        rows.forEach(row => {
          console.log(`  - ${row.brand} ${row.name.substring(0, 50)}`)
        })
      }
    }
    db.close()
  })
}
